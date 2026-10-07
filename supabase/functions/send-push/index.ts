import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push@3.6.7"

/**
 * Wysyła powiadomienia push do zapisanych urządzeń.
 *
 * Typy (pole "type" w body):
 * - daily      — codziennie z pg_cron: tajemnica (1. niedziela), intencja (jeśli jeszcze nie ogłoszona),
 *                odpust (stała data, Wielkanoc lub dzień przyjęcia Róży — ten tylko dla jej członków)
 * - intention  — z triggera po zapisaniu intencji na bieżący miesiąc
 * - mystery / indulgence — ręczne wywołanie jednego typu (z "force": true pomija datę i dziennik — do testów)
 *
 * Każde powiadomienie wychodzi raz — klucz zapisywany w push_notification_log przed wysyłką.
 * Autoryzacja: nagłówek x-cron-secret zgodny z sekretem CRON_SECRET.
 */

type NotificationType = "daily" | "mystery" | "intention" | "indulgence"

interface PushSubscriptionRow {
  id: number
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

interface PushPayload {
  title: string
  body: string
  url: string
  tag: string
}

interface SendStats {
  sent: number
  failed: number
  removed: number
}

const MONTHS = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
]

const ADMISSION_INDULGENCE_NAME = "Dzień przyjęcia do Stowarzyszenia Żywego Różańca"

const jsonHeaders = { "Content-Type": "application/json" }

/**
 * Data Wielkanocy (algorytm Meeusa/Jonesa/Butchera)
 * (ta sama logika w src/shared/lib/liturgical.ts — przy zmianie zaktualizuj oba miejsca)
 */
function getEasterDate(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

/** Dzisiejsza data w strefie Europe/Warsaw */
function warsawToday() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Warsaw",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  )
  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)
  const ym = `${year}-${String(month).padStart(2, "0")}`
  return { year, month, day, isSunday: parts.weekday === "Sun", ym, ymd: `${ym}-${String(day).padStart(2, "0")}` }
}

function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

/** Rezerwuje klucz w dzienniku. false = to powiadomienie już zostało wysłane. */
async function claim(supabase: SupabaseClient, key: string, force: boolean): Promise<boolean> {
  if (force) return true
  const { data, error } = await supabase
    .from("push_notification_log")
    .upsert({ key }, { onConflict: "key", ignoreDuplicates: true })
    .select("key")
  if (error) throw error
  return (data?.length ?? 0) > 0
}

/** Wysyła payload do subskrypcji; usuwa wygasłe (404/410) */
async function sendToAll(
  supabase: SupabaseClient,
  subscriptions: PushSubscriptionRow[],
  payloadFor: (sub: PushSubscriptionRow) => PushPayload | null,
): Promise<SendStats> {
  const stats: SendStats = { sent: 0, failed: 0, removed: 0 }
  const expiredIds: number[] = []

  await Promise.allSettled(subscriptions.map(async (sub) => {
    const payload = payloadFor(sub)
    if (!payload) return

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 24 },
      )
      stats.sent++
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode
      // 404/410 — subskrypcja wygasła lub użytkownik odinstalował aplikację
      if (statusCode === 404 || statusCode === 410) {
        expiredIds.push(sub.id)
      } else {
        stats.failed++
        console.error(`Push nie wysłany (${statusCode ?? "?"}):`, err)
      }
    }
  }))

  if (expiredIds.length > 0) {
    const { error } = await supabase.from("push_subscriptions").delete().in("id", expiredIds)
    if (error) console.error("Nie udało się usunąć wygasłych subskrypcji:", error)
    // Usunięte nie trafią do kolejnych wysyłek w tym samym wywołaniu
    expiredIds.forEach((id) => {
      const idx = subscriptions.findIndex((s) => s.id === id)
      if (idx >= 0) subscriptions.splice(idx, 1)
    })
    stats.removed = expiredIds.length
  }

  return stats
}

/** Nowa tajemnica — każdy dostaje swoją */
async function sendMystery(supabase: SupabaseClient, subscriptions: PushSubscriptionRow[]): Promise<SendStats> {
  const userIds = [...new Set(subscriptions.map((s) => s.user_id))]
  const { data: mysteryIds, error: rpcError } = await supabase
    .rpc("get_mystery_ids_for_users", { p_user_ids: userIds })
  if (rpcError) throw rpcError

  const { data: mysteries, error } = await supabase.from("mysteries").select("id, name")
  if (error) throw error

  const nameById = new Map((mysteries ?? []).map((m: { id: number; name: string }) => [m.id, m.name]))
  const nameByUser = new Map(
    (mysteryIds ?? []).map((r: { user_id: string; mystery_id: number }) => [r.user_id, nameById.get(r.mystery_id)]),
  )

  return sendToAll(supabase, subscriptions, (sub) => {
    const name = nameByUser.get(sub.user_id)
    // Użytkownik bez pozycji w Róży nie ma tajemnicy
    if (!name) return null
    return {
      title: "Nowa tajemnica różańcowa",
      body: `Twoja tajemnica: ${name}. Wejdź, aby ją potwierdzić.`,
      url: "/user",
      tag: "mystery",
    }
  })
}

async function sendIntention(
  supabase: SupabaseClient,
  subscriptions: PushSubscriptionRow[],
  intention: { title: string | null; content: string },
  month: number,
): Promise<SendStats> {
  return sendToAll(supabase, subscriptions, () => ({
    title: `Nowa intencja na ${MONTHS[month - 1]}`,
    body: truncate(intention.title || intention.content),
    url: "/user",
    tag: "intention",
  }))
}

async function sendIndulgence(
  supabase: SupabaseClient,
  subscriptions: PushSubscriptionRow[],
  namesFor: (userId: string) => string[],
): Promise<SendStats> {
  return sendToAll(supabase, subscriptions, (sub) => {
    const names = namesFor(sub.user_id)
    if (names.length === 0) return null
    return {
      title: "Dziś możesz zyskać odpust",
      body: truncate(`${names.join(", ")}. Wejdź, aby zobaczyć warunki.`),
      url: "/user",
      tag: "indulgence",
    }
  })
}

serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET")
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return new Response(JSON.stringify({ error: "Brak uprawnień" }), { status: 401, headers: jsonHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const type: NotificationType = body.type ?? "daily"
    const force = body.force === true

    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT") ?? "",
      Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
      Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
    )

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
    if (subError) throw subError
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ results: {} }), { headers: jsonHeaders })
    }

    const today = warsawToday()
    const results: Record<string, SendStats> = {}

    // Tajemnica — pierwsza niedziela miesiąca
    const isFirstSunday = today.isSunday && today.day <= 7
    if ((type === "mystery" && force) || (type === "daily" && isFirstSunday)) {
      if (await claim(supabase, `mystery:${today.ym}`, force)) {
        results.mystery = await sendMystery(supabase, subscriptions)
      }
    }

    // Intencja na bieżący miesiąc — raz, gdy tylko się pojawi
    if (type === "daily" || type === "intention") {
      const { data: intention, error } = await supabase
        .from("intentions")
        .select("title, content")
        .eq("month", today.month)
        .eq("year", today.year)
        .maybeSingle()
      if (error) throw error

      if (intention && await claim(supabase, `intention:${today.ym}`, force)) {
        results.intention = await sendIntention(supabase, subscriptions, intention, today.month)
      }
    }

    // Odpust — stałe daty i Wielkanoc z indulgence_days + dzień przyjęcia Róży użytkownika
    if (type === "daily" || type === "indulgence") {
      const easter = getEasterDate(today.year)
      const isEasterToday = easter.month === today.month && easter.day === today.day
      const dateFilter = `and(month.eq.${today.month},day.eq.${today.day},or(year.is.null,year.eq.${today.year}))`

      const { data: indulgences, error } = await supabase
        .from("indulgence_days")
        .select("name")
        .or(isEasterToday ? `${dateFilter},is_easter.eq.true` : dateFilter)
      if (error) throw error
      const globalNames = (indulgences ?? []).map((i: { name: string }) => i.name)
      // Test ręczny w dzień bez odpustu
      if (force && globalNames.length === 0) globalNames.push("Test powiadomienia o odpuście")

      // Róże, które dziś obchodzą dzień przyjęcia do Stowarzyszenia
      const { data: admissionGroups, error: groupsError } = await supabase
        .from("groups")
        .select("id")
        .eq("admission_month", today.month)
        .eq("admission_day", today.day)
      if (groupsError) throw groupsError

      const admissionGroupIds = new Set((admissionGroups ?? []).map((g: { id: number }) => g.id))
      const admissionUsers = new Set<string>()
      if (admissionGroupIds.size > 0) {
        const { data: members, error: membersError } = await supabase
          .from("profiles")
          .select("id")
          .in("group_id", [...admissionGroupIds])
        if (membersError) throw membersError
        ;(members ?? []).forEach((m: { id: string }) => admissionUsers.add(m.id))
      }

      const namesFor = (userId: string) =>
        admissionUsers.has(userId) ? [...globalNames, ADMISSION_INDULGENCE_NAME] : globalNames

      const hasRecipients = globalNames.length > 0 || subscriptions.some((s) => admissionUsers.has(s.user_id))
      if (hasRecipients && await claim(supabase, `indulgence:${today.ymd}`, force)) {
        results.indulgence = await sendIndulgence(supabase, subscriptions, namesFor)
      }
    }

    return new Response(JSON.stringify({ date: today.ymd, results }), { headers: jsonHeaders })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Nieznany błąd"
    console.error(error)
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: jsonHeaders })
  }
})

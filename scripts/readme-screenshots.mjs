// Zrzuty ekranu do README (docs/screenshots) na danych przykładowych.
// Aplikacja działa na serwerze Vite z fałszywym adresem Supabase, a Playwright odpowiada na zapytania
// do API zamiast bazy — bez konta, bez zapisów i bez połączenia z produkcyjną bazą.
// Z sieci pobierane są tylko publiczne grafiki tajemnic (adresy z supabase/seed.sql).
// Uruchomienie po zmianie wyglądu: node scripts/readme-screenshots.mjs
import { chromium } from "@playwright/test"
import { spawn } from "node:child_process"
import { mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "docs", "screenshots")
const PORT = 5199
const APP = `http://localhost:${PORT}`
const SUPABASE = "https://demo-roza.supabase.co"
const STORAGE_KEY = "sb-demo-roza-auth-token"

// --- Dane przykładowe ---

// Tajemnice z seed.sql: nazwa, część, rozważanie i grafika
const seed = readFileSync(join(root, "supabase", "seed.sql"), "utf8")
const imageBase = seed.match(/base_url[^']*'(https:[^']+)'/)[1]
const images = Object.fromEntries([...seed.matchAll(/'([\w]+\.webp)' WHERE id = (\d+);/g)].map((m) => [m[2], imageBase + m[1]]))
const mysteries = Object.fromEntries(
  [...seed.matchAll(/^\((\d+), '([^']+)', '([^']+)', '((?:[^']|'')*)'\)/gm)].map((m) => [
    m[1],
    { id: Number(m[1]), part: m[2], name: m[3], meditation: m[4].replaceAll("''", "'"), image_url: images[m[1]] ?? null },
  ])
)

const today = new Date()
const MYSTERY_ID = 3
const groups = [
  { id: 1, name: "Róża św. Jana Pawła II", admission_month: 10, admission_day: 7, created_at: "2025-12-10T10:00:00Z" },
  { id: 2, name: "Róża Matki Bożej Fatimskiej", admission_month: 5, admission_day: 13, created_at: "2025-12-10T10:00:00Z" },
  { id: 3, name: "Róża św. Faustyny", admission_month: null, admission_day: null, created_at: "2026-01-05T10:00:00Z" },
]
const names = [
  "Anna Kowalska", "Maria Nowak", "Teresa Wiśniewska", "Krystyna Wójcik", "Barbara Kamińska",
  "Halina Lewandowska", "Elżbieta Zielińska", "Janina Szymańska", "Zofia Woźniak", "Jadwiga Dąbrowska",
  "Irena Kozłowska", "Danuta Jankowska", "Helena Mazur", "Stanisława Kwiatkowska", "Wanda Krawczyk",
  "Genowefa Piotrowska", "Bożena Grabowska", "Alicja Nowakowska", "Lucyna Pawłowska", "Regina Michalska",
]
// Róża 1: pełna (20 osób), Róża 2: 17 osób, Róża 3: 9 osób — imiona i nazwiska z listy w innym zestawieniu
const firstNames = names.map((n) => n.split(" ")[0])
const lastNames = names.map((n) => n.split(" ")[1])
const roster = [
  ...names.map((full_name, i) => ({ full_name, group: groups[0], pos: i + 1 })),
  ...Array.from({ length: 17 }, (_, i) => ({ full_name: `${firstNames[(i + 7) % 20]} ${lastNames[(i * 3 + 2) % 20]}`, group: groups[1], pos: i + 1 })),
  ...Array.from({ length: 9 }, (_, i) => ({ full_name: `${firstNames[(i + 13) % 20]} ${lastNames[(i * 7 + 5) % 20]}`, group: groups[2], pos: i + 1 })),
]
const members = roster.map(({ full_name, group, pos }, i) => {
  const mysteryId = ((pos + MYSTERY_ID - 2) % 20) + 1
  return {
    id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    full_name,
    login: full_name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replaceAll("ł", "l").replace(" ", "."),
    role: "user",
    rose_pos: pos,
    created_at: "2026-01-05T10:00:00Z",
    group_id: group.id,
    group_name: group.name,
    current_mystery_id: mysteryId,
    current_mystery_name: mysteries[mysteryId]?.name ?? null,
    acknowledged_at: i % 3 === 1 ? null : "2026-10-04T18:00:00Z",
  }
})

const users = {
  user: { ...members[0], profile: { id: members[0].id, full_name: members[0].full_name, login: members[0].login, role: "user", rose_pos: 1, groups: groups[0] } },
  admin: {
    id: "00000000-0000-4000-8000-0000000000aa",
    profile: { id: "00000000-0000-4000-8000-0000000000aa", full_name: "Administrator", login: "admin", role: "admin", rose_pos: null, groups: null },
  },
}

const intention = {
  id: 10,
  month: today.getMonth() + 1,
  year: today.getFullYear(),
  title: "Intencja papieska",
  content: "Módlmy się za rodziny, aby w codziennej modlitwie różańcowej odnajdywały jedność, pokój i siłę do wzajemnego przebaczania.",
  created_at: "2026-09-28T10:00:00Z",
}
const intentionHistory = [
  intention,
  { id: 9, month: 9, year: 2026, title: "Za Kościół", content: "Za Ojca Świętego, biskupów i kapłanów — o wierność Ewangelii.", created_at: "2026-08-30T10:00:00Z" },
  { id: 8, month: 8, year: 2026, title: "Za chorych", content: "Za chorych i cierpiących w naszej parafii.", created_at: "2026-07-30T10:00:00Z" },
]
const indulgences = [
  ["Narodzenie Pańskie", 12, 25], ["Ofiarowanie Pańskie (Matki Bożej Gromnicznej)", 2, 2],
  ["Zmartwychwstanie Pańskie (Wielkanoc)", null, null], ["Zwiastowanie Pańskie", 3, 25],
  ["Wniebowzięcie Najświętszej Maryi Panny", 8, 15], ["Najświętszej Maryi Panny Różańcowej", 10, 7],
  ["Niepokalane Poczęcie Najświętszej Maryi Panny", 12, 8],
].map(([name, month, day], i) => ({
  id: i + 1, name, month, day, year: null, is_easter: month === null,
  description: "Zwykłe warunki odpustu zupełnego: spowiedź sakramentalna, Komunia święta, modlitwa w intencjach Ojca Świętego oraz wolność od przywiązania do jakiegokolwiek grzechu, nawet powszedniego.",
}))

// --- Atrapa Supabase ---

function fakeSession(user) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url")
  const exp = Math.floor(Date.now() / 1000) + 24 * 3600
  const authUser = { id: user.id, aud: "authenticated", role: "authenticated", email: `${user.profile.login}@noemail.local`, app_metadata: {}, user_metadata: {}, created_at: "2026-01-05T10:00:00Z" }
  return {
    access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: user.id, role: "authenticated", aud: "authenticated", exp })}.demo`,
    token_type: "bearer",
    expires_in: 24 * 3600,
    expires_at: exp,
    refresh_token: "demo",
    user: authUser,
  }
}

function restData(table, url, user) {
  const params = url.searchParams
  switch (table) {
    case "profiles": return user.profile
    case "intentions": return params.has("month") ? intention : intentionHistory
    case "mysteries": return mysteries[params.get("id")?.replace("eq.", "")]
    case "indulgence_days": return params.has("or") ? [] : indulgences
    case "groups": return groups
    default: return [] // notification_preferences, prayer_reminders, push_subscriptions
  }
}

function rpcData(fn, body) {
  switch (fn) {
    case "get_mystery_id_for_user": return MYSTERY_ID
    case "is_mystery_acknowledged": return false
    case "get_members_overview": return body?.p_group_id ? members.filter((m) => m.group_id === body.p_group_id) : members
    default: return null
  }
}

async function mockSupabase(page, user) {
  await page.route(`${SUPABASE}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const json = (body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) })

    if (url.pathname.startsWith("/auth/v1/")) return json(url.pathname.endsWith("/user") ? fakeSession(user).user : {})
    if (url.pathname.startsWith("/rest/v1/rpc/")) return json(rpcData(url.pathname.split("/").pop(), request.postDataJSON()))
    if (url.pathname.startsWith("/rest/v1/")) {
      if (request.method() !== "GET") return json([], 201)
      const data = restData(url.pathname.split("/").pop(), url, user)
      const single = (request.headers()["accept"] ?? "").includes("vnd.pgrst.object")
      return json(single || !Array.isArray(data) ? (single ? data : [data]) : data)
    }
    return json({}, 404)
  })
}

// --- Zrzuty ---

async function newPage(browser, { user, theme = "light" } = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: theme,
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw",
    serviceWorkers: "block",
  })
  await context.addInitScript(
    ([key, session, theme]) => {
      localStorage.setItem("vite-ui-theme", theme)
      if (session) localStorage.setItem(key, JSON.stringify(session))
    },
    [STORAGE_KEY, user ? fakeSession(user) : null, theme]
  )
  const page = await context.newPage()
  page.on("pageerror", (error) => console.error(`  błąd strony: ${error.message}`))
  await mockSupabase(page, user ?? users.user)
  return page
}

async function shot(page, name) {
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400) // animacje wejścia
  await page.screenshot({ path: join(outDir, `${name}.png`) })
  console.log(`docs/screenshots/${name}.png`)
}

const vite = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], {
  cwd: root,
  shell: true,
  // Zmienne z procesu mają pierwszeństwo przed .env.local — aplikacja nie zna adresu prawdziwej bazy
  env: { ...process.env, VITE_SUPABASE_URL: SUPABASE, VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: "demo-key" },
  stdio: "ignore",
})

try {
  for (let i = 0; i < 60; i++) {
    if (await fetch(APP).then((r) => r.ok, () => false)) break
    await new Promise((r) => setTimeout(r, 500))
  }
  mkdirSync(outDir, { recursive: true })
  // Chrome zainstalowany w systemie: nie trzeba pobierać przeglądarek Playwrighta
  const browser = await chromium.launch({ channel: "chrome" })

  let page = await newPage(browser)
  await page.goto(APP, { waitUntil: "domcontentloaded", timeout: 90_000 })
  await page.getByRole("button", { name: /zaloguj/i }).waitFor()
  await shot(page, "login")

  for (const theme of ["light", "dark"]) {
    page = await newPage(browser, { user: users.user, theme })
    await page.goto(`${APP}/user`, { waitUntil: "domcontentloaded", timeout: 90_000 })
    await page.getByText(mysteries[MYSTERY_ID].name).first().waitFor()
    await page.locator("img[src*='.webp']").last().evaluate((img) => img.decode?.())
    // Jasny: góra panelu (intencja, grafika); ciemny: dół (rozważanie, potwierdzenie, licznik)
    if (theme === "dark") await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await shot(page, `dashboard-${theme}`)
  }

  await page.locator(".header-user-info").click()
  await page.getByRole("dialog").waitFor()
  await page.getByText(members[5].full_name).first().waitFor()
  await shot(page, "account-dark")

  page = await newPage(browser, { user: users.admin })
  await page.goto(`${APP}/admin/members`, { waitUntil: "domcontentloaded", timeout: 90_000 })
  // Akordeon otwiera pierwszą Różę tylko, gdy lista Róż jest już w cache — tu trzeba kliknąć
  await page.getByRole("button", { name: new RegExp(groups[0].name) }).click()
  await page.getByText(members[1].full_name).first().waitFor()
  await shot(page, "admin-members")

  await browser.close()
} finally {
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(vite.pid), "/T", "/F"], { stdio: "ignore" })
  else vite.kill()
}

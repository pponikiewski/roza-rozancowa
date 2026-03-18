import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { requireAdmin, AuthorizationError } from "../_shared/auth.ts"
import { corsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts"

/**
 * Generuje login z imienia i nazwiska (format: imie.nazwisko)
 * Polskie znaki → ASCII, lowercase, spacja → kropka
 */
function generateBaseLogin(fullName: string): string {
  const polishMap: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  }

  return fullName
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (ch) => polishMap[ch] || ch)
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.\-]/g, '')
}

serve(async (req) => {
  // Obsługa CORS
  const corsResponse = handleCorsPreflightRequest(req)
  if (corsResponse) return corsResponse

  try {
    // WERYFIKACJA ROLI ADMINISTRATORA
    const { adminClient: supabaseAdmin } = await requireAdmin(req)

    const { password, fullName, groupId } = await req.json()

    if (!password || !fullName) throw new Error('Brakuje danych (hasło lub imię).')

    // Walidacja wejścia
    if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 100) {
      throw new Error('Nieprawidłowe imię (min. 2, max. 100 znaków)')
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      throw new Error('Hasło musi mieć od 6 do 128 znaków')
    }
    if (groupId !== null && groupId !== undefined && (!Number.isInteger(groupId) || groupId < 1)) {
      throw new Error('Nieprawidłowy identyfikator grupy')
    }

    let assignedPos = null;

    // --- LOGIKA PRZYDZIAŁU MIEJSCA W RÓŻY ---
    if (groupId) {
      // 1. Pobierz zajęte pozycje
      const { data: members, error: groupError } = await supabaseAdmin
        .from('profiles')
        .select('rose_pos')
        .eq('group_id', groupId)
      
      if (groupError) {
        throw new Error("Błąd bazy danych przy sprawdzaniu grupy.")
      }

      // 2. Znajdź wolne miejsce
      const takenPositions = members.map((m: { rose_pos: number }) => m.rose_pos)
      for (let i = 1; i <= 20; i++) {
        if (!takenPositions.includes(i)) {
          assignedPos = i;
          break;
        }
      }

      // 3. Jeśli null -> brak miejsca
      if (assignedPos === null) {
        throw new Error("Ta Róża jest już pełna (ma 20 członków)! Wybierz inną grupę lub stwórz nową.")
      }
    }
    // ------------------------------------------

    // --- GENEROWANIE LOGINU ---
    const baseLogin = generateBaseLogin(fullName)
    let login = baseLogin
    let counter = 2

    // Sprawdź unikalność loginu (max 100 prób, by uniknąć nieskończonej pętli)
    const MAX_LOGIN_ITERATIONS = 100
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('login', login)
        .maybeSingle()

      if (!existing) break
      if (counter > MAX_LOGIN_ITERATIONS) {
        throw new Error('Nie można wygenerować unikalnego loginu. Skontaktuj się z administratorem.')
      }
      login = baseLogin + counter
      counter++
    }
    // ---------------------------

    // Email wewnętrzny — Supabase Auth wymaga emaila, ale użytkownicy go nie widzą
    const internalEmail = `${login}@noemail.local`

    // Tworzenie usera w Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (userError) {
      throw new Error(userError.message)
    }

    // Tworzenie Profilu
    if (userData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userData.user.id,
          full_name: fullName,
          login: login,
          role: 'user',
          group_id: groupId || null,
          rose_pos: assignedPos
        })
      
      if (profileError) {
        throw new Error("Konto utworzone, ale błąd przy przypisywaniu do grupy: " + profileError.message)
      }
    }

    return new Response(JSON.stringify({ 
      user: userData.user, 
      message: "User created",
      position: assignedPos,
      login: login
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nieznany błąd'
    const status = error instanceof AuthorizationError ? error.status : 500
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }
})
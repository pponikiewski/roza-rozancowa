// supabase/functions/update-user-login/index.ts
// Aktualizuje wewnętrzny email w auth.users przy zmianie loginu
// (Supabase Auth wymaga emaila, używamy formatu: login@noemail.local)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { requireAdmin, AuthorizationError } from "../_shared/auth.ts"
import { corsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts"

serve(async (req) => {
  // 1. Obsługa zapytań OPTIONS (CORS Preflight)
  const corsResponse = handleCorsPreflightRequest(req)
  if (corsResponse) return corsResponse

  try {
    // 2. WERYFIKACJA ROLI ADMINISTRATORA
    const { adminClient: supabaseAdmin } = await requireAdmin(req)

    // 3. Pobieramy dane z żądania
    const { user_id, new_internal_email } = await req.json()

    if (!user_id || !new_internal_email) {
      throw new Error("Brak user_id lub nowego wewnętrznego emaila")
    }

    // Walidacja formatu email
    if (!new_internal_email.includes('@')) {
      throw new Error("Nieprawidłowy format wewnętrznego emaila")
    }

    // 4. Zmiana wewnętrznego emaila użytkownika w auth.users
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { email: new_internal_email, email_confirm: true }
    )

    if (error) throw error

    // 5. Zwracamy sukces
    return new Response(JSON.stringify({ success: true, user: data.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    // Obsługa błędów
    const message = error instanceof Error ? error.message : 'Nieznany błąd'
    const status = error instanceof AuthorizationError ? error.status : 400
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }
})

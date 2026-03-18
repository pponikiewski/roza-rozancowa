import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { requireAdmin, AuthorizationError } from "../_shared/auth.ts"
import { corsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts"

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req)
  if (corsResponse) return corsResponse

  try {
    // WERYFIKACJA ROLI ADMINISTRATORA
    const { adminClient: supabaseAdmin } = await requireAdmin(req)

    const { user_id } = await req.json()

    if (!user_id) throw new Error("Brak user_id")

    // Usuwamy użytkownika z Auth (kaskadowo usunie też profil)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (error) throw error

    return new Response(JSON.stringify({ message: "Usunięto" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nieznany błąd'
    const status = error instanceof AuthorizationError ? error.status : 400
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }
})
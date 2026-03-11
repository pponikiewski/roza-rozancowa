// supabase/functions/update-user-password/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { requireAdmin, AuthorizationError } from "../_shared/auth.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Obsługa zapytań OPTIONS (CORS Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. WERYFIKACJA ROLI ADMINISTRATORA
    const { adminClient: supabaseAdmin } = await requireAdmin(req)

    // 3. Pobieramy dane z żądania
    const { user_id, new_password } = await req.json()

    if (!user_id || !new_password) {
      throw new Error("Brak user_id lub nowego hasła")
    }

    if (new_password.length < 6) {
      throw new Error("Hasło musi mieć minimum 6 znaków")
    }

    // 4. Inicjalizacja klienta Supabase z uprawnieniami ADMINA (Service Role)
    // To pozwala zmieniać dane innych użytkowników
    // (adminClient został już zainicjowany przez requireAdmin)

    // 5. Zmiana hasła użytkownika
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    )

    if (error) throw error

    // 6. Zwracamy sukces
    return new Response(JSON.stringify(data), {
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
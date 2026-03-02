// supabase/functions/update-user-login/index.ts
// Aktualizuje wewnętrzny email w auth.users przy zmianie loginu
// (Supabase Auth wymaga emaila, używamy formatu: login@noemail.local)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // 2. Pobieramy dane z żądania
    const { user_id, new_internal_email } = await req.json()

    if (!user_id || !new_internal_email) {
      throw new Error("Brak user_id lub nowego wewnętrznego emaila")
    }

    // Walidacja formatu email
    if (!new_internal_email.includes('@')) {
      throw new Error("Nieprawidłowy format wewnętrznego emaila")
    }

    // 3. Inicjalizacja klienta Supabase z uprawnieniami ADMINA (Service Role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

  } catch (error: any) {
    // Obsługa błędów
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

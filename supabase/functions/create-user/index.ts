import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Obsługa CORS (dla przeglądarki)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Inicjalizacja klienta Supabase z uprawnieniami Admina (Service Role)
    // UWAGA: Te zmienne są wstrzykiwane automatycznie na produkcji w Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Pobranie danych z żądania
    const { email, password, fullName, role } = await req.json()

    if (!email || !password || !fullName) {
      return new Response(JSON.stringify({ error: 'Brakuje danych (email, password, fullName)' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. Tworzenie użytkownika w Auth (to nie loguje, tylko tworzy konto)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatycznie potwierdź email
      user_metadata: { full_name: fullName }
    })

    if (userError) throw userError

    // 4. Utworzenie wpisu w tabeli public.profiles
    if (userData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userData.user.id,
          full_name: fullName,
          role: role || 'user'
        })
      
      if (profileError) throw profileError
    }

    return new Response(JSON.stringify({ user: userData.user, message: "User created successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
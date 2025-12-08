import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Obsługa CORS
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, fullName, groupId } = await req.json()

    console.log(`Próba dodania usera: ${email}, grupa: ${groupId}`)

    if (!email || !password || !fullName) throw new Error('Brakuje danych (email, hasło lub imię).')

    let assignedPos = null;

    // --- LOGIKA PRZYDZIAŁU MIEJSCA W RÓŻY ---
    if (groupId) {
      // 1. Pobierz zajęte pozycje
      const { data: members, error: groupError } = await supabaseAdmin
        .from('profiles')
        .select('rose_pos')
        .eq('group_id', groupId)
      
      if (groupError) {
        console.error("Błąd pobierania grupy:", groupError)
        throw new Error("Błąd bazy danych przy sprawdzaniu grupy.")
      }

      // 2. Znajdź wolne miejsce
      const takenPositions = members.map((m: any) => m.rose_pos)
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

    // Tworzenie usera w Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (userError) {
      console.error("Błąd auth:", userError)
      throw new Error(userError.message) // Np. "Email already registered"
    }

    // Tworzenie Profilu
    if (userData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userData.user.id,
          full_name: fullName,
          email: email,
          role: 'user',
          group_id: groupId || null,
          rose_pos: assignedPos
        })
      
      if (profileError) {
        console.error("Błąd profilu:", profileError)
        // Jeśli profil się nie udał, to i tak user w Auth powstał. 
        // W idealnym świecie powinniśmy go usunąć (rollback), ale tu wystarczy rzucić błąd.
        throw new Error("Konto utworzone, ale błąd przy przypisywaniu do grupy: " + profileError.message)
      }
    }

    return new Response(JSON.stringify({ 
      user: userData.user, 
      message: "User created",
      position: assignedPos 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Create User Logic Error:", error.message)
    // ZWRACAMY 200 Z BŁĘDEM W BODY - dzięki temu frontend może wyświetlić komunikat
    // zamiast generycznego błędu sieci 400.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    })
  }
})
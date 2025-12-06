import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, fullName, groupId } = await req.json()

    if (!email || !password || !fullName) throw new Error('Brakuje danych')

    let assignedPos = null;

    // --- LOGIKA PRZYDZIAŁU MIEJSCA W RÓŻY ---
    if (groupId) {
      // 1. Pobierz zajęte pozycje w tej grupie
      const { data: members, error: groupError } = await supabaseAdmin
        .from('profiles')
        .select('rose_pos')
        .eq('group_id', groupId)
      
      if (groupError) throw groupError

      // 2. Znajdź pierwsze wolne miejsce (1-20)
      const takenPositions = members.map((m: any) => m.rose_pos)
      for (let i = 1; i <= 20; i++) {
        if (!takenPositions.includes(i)) {
          assignedPos = i;
          break;
        }
      }

      // 3. Jeśli nie znaleziono miejsca -> Błąd
      if (assignedPos === null) {
        throw new Error("Ta Róża jest już pełna (ma 20 członków)!")
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

    if (userError) throw userError

    // Tworzenie Profilu z przypisaną pozycją
    if (userData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userData.user.id,
          full_name: fullName,
          role: 'user',
          group_id: groupId || null,
          rose_pos: assignedPos // ZAPISUJEMY NUMER KRZESŁA
        })
      
      if (profileError) throw profileError
    }

    return new Response(JSON.stringify({ 
      user: userData.user, 
      message: "User created",
      position: assignedPos 
    }), {
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
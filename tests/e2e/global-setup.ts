/**
 * Global Setup dla testów E2E
 * 
 * Automatycznie tworzy użytkowników testowych przed uruchomieniem testów
 * Uruchamia się raz przed wszystkimi testami
 */

import { createClient } from '@supabase/supabase-js'
import { TEST_USER, TEST_ADMIN, TEST_USER_NO_ASSIGNMENT } from './fixtures/test-data'

async function globalSetup() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Brak VITE_SUPABASE_URL lub VITE_SUPABASE_SERVICE_ROLE_KEY')
    console.error('')
    console.error('💡 Dodaj do pliku .env.local:')
    console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY=twoj-service-role-key')
    console.error('')
    console.error('📍 Znajdziesz go w Supabase Dashboard:')
    console.error('   https://supabase.com/dashboard/project/jjlxuqnwbakmiwqfycha/settings/api')
    console.error('   → service_role (secret) → kliknij "Reveal" → skopiuj klucz')
    console.error('')
    throw new Error('Missing Supabase configuration')
  }

  // Supabase Admin Client (z service_role key)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🔧 Tworzenie użytkowników testowych...')

  const testUsers = [
    { ...TEST_USER, isAdmin: false },
    { ...TEST_ADMIN, isAdmin: true },
    { ...TEST_USER_NO_ASSIGNMENT, isAdmin: false },
  ]

  for (const user of testUsers) {
    // Aplikacja używa formatu login@noemail.local jako email w Supabase Auth
    const email = `${user.login}@noemail.local`
    try {
      // Sprawdź czy użytkownik już istnieje
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find((u) => u.email === email)

      if (existingUser) {
        console.log(`🗑️  Usuwam użytkownika ${email} (zostanie utworzony ponownie)`)
        await supabase.auth.admin.deleteUser(existingUser.id)
      }

      // Utwórz użytkownika przez Admin API
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
        },
      })

      if (createError) {
        console.error(`❌ Błąd tworzenia ${email}:`, createError.message)
        continue
      }

      console.log(`✅ Utworzono użytkownika ${email}`)

      // Dodaj wpis do tabeli profiles
      if (newUser.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: newUser.user.id,
          full_name: `${user.firstName} ${user.lastName}`,
          email,
          login: user.login,
          role: user.isAdmin ? 'admin' : 'user',
        }, {
          onConflict: 'id'
        })

        if (profileError) {
          console.error(`❌ Błąd dodawania do profiles ${email}:`, profileError.message)
        } else {
          console.log(`✅ Dodano ${email} do tabeli profiles${user.isAdmin ? ' (ADMIN)' : ''}`)
        }
      }
    } catch (error) {
      console.error(`❌ Błąd dla ${email}:`, error)
    }
  }

  console.log('✅ Setup użytkowników zakończony')
}

export default globalSetup

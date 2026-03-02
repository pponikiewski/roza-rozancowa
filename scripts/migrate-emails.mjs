/**
 * Skrypt aktualizujący emaile w auth.users na ${login}@noemail.local
 * Uruchom: node scripts/migrate-emails.mjs
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Brak VITE_SUPABASE_URL lub VITE_SUPABASE_SERVICE_ROLE_KEY w .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function migrateEmails() {
    console.log('🔄 Aktualizacja emaili w auth.users...\n')

    // 1. Pobierz wszystkie profile z loginami
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, login, full_name')

    if (error) {
        console.error('❌ Błąd pobierania profili:', error.message)
        process.exit(1)
    }

    for (const profile of profiles) {
        if (!profile.login) {
            console.log(`⚠️  Pomijam ${profile.full_name} — brak loginu`)
            continue
        }

        const newEmail = `${profile.login}@noemail.local`

        const { error: updateError } = await supabase.auth.admin.updateUserById(
            profile.id,
            { email: newEmail }
        )

        if (updateError) {
            console.error(`❌ Błąd dla ${profile.login}:`, updateError.message)
        } else {
            console.log(`✅ ${profile.login} → ${newEmail}`)
        }
    }

    console.log('\n✅ Migracja zakończona!')
}

migrateEmails()

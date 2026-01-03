import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Brakuje zmiennych środowiskowych! Sprawdź plik .env.local')
}

// Inicjalizacja klienta Supabase z typami bazy danych
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
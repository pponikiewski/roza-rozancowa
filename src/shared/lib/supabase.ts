import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Brakuje zmiennych środowiskowych! Sprawdź plik .env.local')
}

// Inicjalizacja klienta Supabase do komunikacji z bazą danych
export const supabase = createClient(supabaseUrl, supabaseKey)
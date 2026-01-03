import { supabase } from './supabase'

/**
 * Wywołuje RPC function `get_mystery_id_for_user` która oblicza aktualną
 * tajemnicę dla użytkownika na podstawie daty i pozycji w kole (modulo 20)
 * 
 * @param userId - UUID użytkownika
 * @returns ID tajemnicy (1-20) lub null w przypadku błędu
 */
export async function getMysteryIdForUser(userId: string): Promise<number | null> {
    const { data, error } = await supabase.rpc('get_mystery_id_for_user', { 
        p_user_id: userId 
    })

    if (error) {
        console.error('Error calling get_mystery_id_for_user:', error)
        return null
    }

    return data
}

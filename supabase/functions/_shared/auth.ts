import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * Błąd autoryzacji — zawiera kod HTTP (401 lub 403).
 */
export class AuthorizationError extends Error {
  constructor(message: string, public readonly status: 401 | 403) {
    super(message)
    this.name = "AuthorizationError"
  }
}

/**
 * Weryfikuje, że wywołujący jest zalogowanym administratorem.
 *
 * Rzuca AuthorizationError (401) gdy brak/nieważny token.
 * Rzuca AuthorizationError (403) gdy użytkownik nie ma roli 'admin'.
 *
 * @returns adminClient — klient Supabase z Service Role (pełne uprawnienia)
 */
export async function requireAdmin(req: Request): Promise<{ adminClient: SupabaseClient }> {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    throw new AuthorizationError("Brak tokenu autoryzacyjnego", 401)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""

  // Klient z uprawnieniami administratora — używany do operacji na danych
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // Klient z tokenem wywołującego — używany TYLKO do weryfikacji tożsamości
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: { user }, error: userError } = await callerClient.auth.getUser()
  if (userError || !user) {
    throw new AuthorizationError("Nieważny lub wygasły token", 401)
  }

  // Sprawdź rolę w tabeli profiles (source of truth dla ról aplikacji)
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    throw new AuthorizationError("Brak uprawnień administratora", 403)
  }

  return { adminClient }
}

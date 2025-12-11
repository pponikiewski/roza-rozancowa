import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

// Komponent chroniący trasy dostępne tylko dla zalogowanych użytkowników
// Jeśli użytkownik nie jest zalogowany, przekierowuje na stronę główną
export const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Sprawdź aktualną sesję (z localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Nasłuchuj zmian w autoryzacji (np. odświeżenie tokena, wylogowanie)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return user ? <Outlet /> : <Navigate to="/" replace />
}

// Komponent chroniący trasy administracyjne
// Sprawdza, czy użytkownik jest zalogowany ORAZ czy ma rolę 'admin' w tabeli profiles
export const AdminRoute = () => {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      // Używamy getSession zamiast getUser dla lepszej obsługi persystencji
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setLoading(false)
        return
      }

      // Sprawdzamy rolę w tabeli profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile && profile.role === 'admin') {
        setIsAdmin(true)
      }
      setLoading(false)
    }
    checkAdmin()
  }, [])

  if (loading) return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  // Jeśli admin -> wpuść, jeśli nie -> wyślij do dashboardu użytkownika
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />
}
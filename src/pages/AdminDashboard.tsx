import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState<string | undefined>("")

  useEffect(() => {
    // Sprawdzamy, czy ktoś jest zalogowany
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login") // Jak nie, to wykopujemy do logowania
      } else {
        setUserEmail(user.email)
      }
    }
    checkUser()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Panel Administratora</h1>
      <p className="mb-4">Zalogowano jako: {userEmail}</p>
      <Button variant="destructive" onClick={handleLogout}>Wyloguj się</Button>
    </div>
  )
}
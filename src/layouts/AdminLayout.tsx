import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Users, Settings, LogOut, LayoutDashboard } from "lucide-react"

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  // Klasy dla linków (aktywny vs nieaktywny)
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
      isActive 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`

  return (
    <div className="flex h-screen w-full bg-background">
      {/* PASEK BOCZNY (SIDEBAR) */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin/members" className={linkClasses}>
            <Users className="h-4 w-4" />
            Użytkownicy
          </NavLink>
          
          <NavLink to="/admin/settings" className={linkClasses}>
            <Settings className="h-4 w-4" />
            Ustawienia
          </NavLink>
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Wyloguj
          </Button>
        </div>
      </aside>

      {/* GŁÓWNA TREŚĆ (Zmienia się w zależności od podstrony) */}
      <main className="flex-1 overflow-auto bg-muted/10 p-8">
        <Outlet />
      </main>
    </div>
  )
}
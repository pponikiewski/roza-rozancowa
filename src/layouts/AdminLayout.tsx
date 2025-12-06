import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Potrzebujemy tego do menu mobilnego
import { Users, Settings, LogOut, LayoutDashboard, Menu } from "lucide-react"
import { useState } from "react"

export default function AdminLayout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false) // Stan otwarcia menu mobilnego

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  // --- KOMPONENT NAWIGACJI (Wspólny dla Desktop i Mobile) ---
  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Admin Panel
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink 
          to="/admin/members" 
          onClick={() => setOpen(false)} // Zamyka menu po kliknięciu (mobile)
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          <Users className="h-4 w-4" />
          Użytkownicy
        </NavLink>
        
        <NavLink 
          to="/admin/settings" 
          onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
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
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-background">
      
      {/* 1. SIDEBAR DESKTOPOWY (Ukryty na mobile 'hidden md:flex') */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        <NavContent />
      </aside>

      {/* 2. MENU MOBILNE (Widoczne tylko na mobile 'md:hidden') */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* 3. GŁÓWNA TREŚĆ */}
      <main className="flex-1 overflow-auto bg-muted/10 p-4 md:p-8 pt-16 md:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
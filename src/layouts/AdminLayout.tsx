import { Outlet, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, Settings, LayoutDashboard, Menu, Rose } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [adminProfile, setAdminProfile] = useState<{full_name: string} | null>(null)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
         const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
         setAdminProfile(data)
      }
    }
    getProfile()
  }, [])

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
          Intencja
        </NavLink>

                <NavLink 
          to="/admin/groups" 
          onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          <Rose className="h-4 w-4" />
          Róże
        </NavLink>
      </nav>

      {/* USUNIĘTO SEKCJĘ LOGOUT Z DOŁU */}
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-background flex-col md:flex-row">
      
      {/* 1. SIDEBAR DESKTOPOWY (Ukryty na mobile 'hidden md:flex') */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        <NavContent />
      </aside>

      {/* 2. HEADER MOBILNY (Widoczny tylko na mobile 'md:hidden') */}
      <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {adminProfile?.full_name?.substring(0,1).toUpperCase() || "A"}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none">{adminProfile?.full_name || "Administrator"}</span>
                <span className="text-[10px] text-muted-foreground font-medium">Panel Zarządzania</span>
            </div>
        </div>
      </div>

      {/* 3. GŁÓWNA TREŚĆ */}
      <main className="flex-1 overflow-auto bg-muted/10 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
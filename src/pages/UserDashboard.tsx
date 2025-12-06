import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Interfejs opisujący strukturę tajemnicy
interface Mystery {
  id: number
  part: string
  name: string
  meditation: string
  image_url: string
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [groupName, setGroupName] = useState("")
  const [mystery, setMystery] = useState<Mystery | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login")
        return
      }

      // 1. Pobierz profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, groups(name)')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        // @ts-ignore
        if (profileData.groups) setGroupName(profileData.groups.name)
      }

      // 2. Pobierz tajemnicę (Na razie na sztywno ID = 1, potem zrobimy rotację)
      const { data: mysteryData } = await supabase
        .from('mysteries')
        .select('*')
        .eq('id', 1) 
        .single()
      
      setMystery(mysteryData)
      setLoading(false)
    }

    fetchData()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Ładowanie modlitwy...</div>

  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/20 p-4 gap-6">
      {/* Nagłówek */}
      <div className="w-full max-w-md flex justify-between items-center py-2 border-b">
        <div>
          <h1 className="text-xl font-bold text-primary">Róża Różańcowa</h1>
          <p className="text-xs text-muted-foreground">Witaj, {profile?.full_name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>Wyloguj</Button>
      </div>

      {/* Karta Główna */}
      <Card className="w-full max-w-md overflow-hidden shadow-lg border-none">
        
        {/* Obrazek na górze karty */}
        {mystery?.image_url && (
          <div className="relative h-48 w-full bg-gray-200">
            <img 
              src={mystery.image_url} 
              alt={mystery.name} 
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                {mystery.part}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-serif text-primary">
            {mystery?.name}
          </CardTitle>
          <CardDescription className="text-sm uppercase tracking-widest font-semibold mt-1">
             Róża: {groupName || "Brak grupy"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="relative">
            {/* Ozdobny cytat */}
            <span className="text-4xl text-muted-foreground/20 absolute -top-4 -left-2 font-serif">“</span>
            <p className="text-lg italic text-muted-foreground px-4 leading-relaxed font-serif">
              {mystery?.meditation}
            </p>
            <span className="text-4xl text-muted-foreground/20 absolute -bottom-8 -right-2 font-serif">”</span>
          </div>

          <div className="pt-4">
            <Button className="w-full" size="lg" onClick={() => alert("Tu będzie np. odznaczanie 'Zmówiłem'")}>
              Rozpocznij modlitwę
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
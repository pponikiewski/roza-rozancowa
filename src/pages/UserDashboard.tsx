import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface Mystery {
  id: number
  part: string
  name: string
  meditation: string
  image_url: string
}

interface Profile {
  id: string
  full_name: string
  rose_pos: number | null
  groups: { name: string } | null
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mystery, setMystery] = useState<Mystery | null>(null)
  const [isAcknowledged, setIsAcknowledged] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login")
        return
      }

      // 1. Pobierz Profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, rose_pos, groups(name)')
        .eq('id', user.id)
        .single()

      if (profileData) {
        // @ts-ignore
        setProfile(profileData)
      }

      // 2. Oblicz aktualną tajemnicę
      // ZMIANA: Nie ustawiamy domyślnie 1. Domyślnie jest null.
      let currentMysteryId: number | null = null
      
      const { data: calculatedId } = await supabase
        .rpc('get_mystery_id_for_user', { p_user_id: user.id })
      
      if (calculatedId) {
        currentMysteryId = calculatedId
      }

      // Jeśli user nie ma przypisanej tajemnicy (brak grupy), kończymy ładowanie
      if (!currentMysteryId) {
        setMystery(null)
        setLoading(false)
        return
      }

      // 3. Pobierz treść tajemnicy (tylko jeśli mamy ID)
      const { data: mysteryData } = await supabase
        .from('mysteries')
        .select('*')
        .eq('id', currentMysteryId) 
        .single()
      
      setMystery(mysteryData)

      // 4. Sprawdź status
      const { data: ackData } = await supabase
        .from('acknowledgments')
        .select('*')
        .eq('user_id', user.id)
        .eq('mystery_id', currentMysteryId)
        .single()
      
      setIsAcknowledged(!!ackData)
      setLoading(false)
    }

    fetchData()
  }, [navigate])

  const handleAcknowledge = async () => {
    if (!profile || !mystery) return
    const { error } = await supabase.from('acknowledgments').insert({ user_id: profile.id, mystery_id: mystery.id })
    if (error) alert("Błąd: " + error.message)
    else setIsAcknowledged(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Ładowanie...</div>

  // --- WIDOK DLA OSOBY BEZ GRUPY ---
  if (!mystery) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-muted/20 p-4 gap-6">
        <div className="w-full max-w-md flex justify-between items-center py-2 border-b">
          <div>
            <h1 className="text-xl font-bold text-primary">Róża Różańcowa</h1>
            <p className="text-xs text-muted-foreground">Witaj, {profile?.full_name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Wyloguj</Button>
        </div>
        
        <Card className="w-full max-w-md text-center py-8">
          <CardHeader>
            <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Brak przypisanej Róży</CardTitle>
            <CardDescription>
              Nie jesteś obecnie przypisany do żadnej grupy modlitewnej.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Skontaktuj się z administratorem, aby dołączyć do Żywego Różańca i otrzymać swoją tajemnicę.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- WIDOK STANDARDOWY (Z TAJEMNICĄ) ---
  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/20 p-4 gap-6">
      <div className="w-full max-w-md flex justify-between items-center py-2 border-b">
        <div>
          <h1 className="text-xl font-bold text-primary">Róża Różańcowa</h1>
          <p className="text-xs text-muted-foreground">Witaj, {profile?.full_name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>Wyloguj</Button>
      </div>

      <Card className="w-full max-w-md overflow-hidden shadow-lg border-none">
        {mystery?.image_url && (
          <div className="relative w-full bg-black">
            <img 
              src={mystery.image_url} 
              alt={mystery.name} 
              className="w-full h-auto max-h-[50vh] object-contain mx-auto"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                {mystery.part}
              </Badge>
              {profile?.rose_pos && (
                <Badge className="bg-primary text-primary-foreground">#{profile.rose_pos}</Badge>
              )}
            </div>
          </div>
        )}

        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-serif text-primary">{mystery?.name}</CardTitle>
          <CardDescription className="text-sm uppercase tracking-widest font-semibold mt-1">
             {profile?.groups?.name}
             {profile?.rose_pos && <span className="block text-xs normal-case opacity-70 mt-1">(Miejsce: {profile.rose_pos}/20)</span>}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="relative">
            <span className="text-4xl text-muted-foreground/20 absolute -top-4 -left-2 font-serif">“</span>
            <p className="text-lg italic text-muted-foreground px-4 leading-relaxed font-serif">{mystery?.meditation}</p>
            <span className="text-4xl text-muted-foreground/20 absolute -bottom-8 -right-2 font-serif">”</span>
          </div>

          <div className="pt-6">
            {isAcknowledged ? (
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default" size="lg">
                <CheckCircle2 className="mr-2 h-5 w-5" /> Zapoznałem się z tajemnicą
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={handleAcknowledge}>
                Potwierdzam zapoznanie się
              </Button>
            )}
            {isAcknowledged && <p className="text-xs text-muted-foreground mt-2">Dziękujemy. Potwierdzenie zapisane.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
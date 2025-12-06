import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

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
  
  // Nowy stan: czy zapoznano się
  const [isAcknowledged, setIsAcknowledged] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login")
        return
      }

      // 1. Profil
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

      // 2. Tajemnica (ID=1 na sztywno, niedługo to zmienimy na rotację)
      const currentMysteryId = 1
      
      const { data: mysteryData } = await supabase
        .from('mysteries')
        .select('*')
        .eq('id', currentMysteryId) 
        .single()
      
      setMystery(mysteryData)

      // 3. Sprawdź czy już odhaczone
      const { data: ackData } = await supabase
        .from('acknowledgments')
        .select('*')
        .eq('user_id', user.id)
        .eq('mystery_id', currentMysteryId)
        .single()
      
      if (ackData) setIsAcknowledged(true)

      setLoading(false)
    }

    fetchData()
  }, [navigate])

  const handleAcknowledge = async () => {
    if (!profile || !mystery) return

    const { error } = await supabase
      .from('acknowledgments')
      .insert({
        user_id: profile.id,
        mystery_id: mystery.id
      })

    if (error) {
      alert("Błąd: " + error.message)
    } else {
      setIsAcknowledged(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Ładowanie...</div>

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
        
        {/* ZMIANA OBRAZKA: remove h-48, add h-auto w-full object-contain */}
        {mystery?.image_url && (
          <div className="relative w-full bg-black">
            <img 
              src={mystery.image_url} 
              alt={mystery.name} 
              className="w-full h-auto max-h-[50vh] object-contain mx-auto"
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
            <span className="text-4xl text-muted-foreground/20 absolute -top-4 -left-2 font-serif">“</span>
            <p className="text-lg italic text-muted-foreground px-4 leading-relaxed font-serif">
              {mystery?.meditation}
            </p>
            <span className="text-4xl text-muted-foreground/20 absolute -bottom-8 -right-2 font-serif">”</span>
          </div>

          <div className="pt-6">
            {isAcknowledged ? (
              <Button className="w-full bg-green-600 hover:bg-green-700 cursor-default" size="lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Zapoznałem się z tajemnicą
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={handleAcknowledge}>
                Potwierdzam zapoznanie się
              </Button>
            )}
            
            {isAcknowledged && (
              <p className="text-xs text-muted-foreground mt-2">
                Dziękujemy. Twoje potwierdzenie zostało zapisane.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
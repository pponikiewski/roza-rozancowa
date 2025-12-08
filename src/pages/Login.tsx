import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, Mail } from "lucide-react"

// Baza cytatów
const ROSARY_QUOTES = [
  { text: "Różaniec to potężna broń. Używaj go z ufnością, a zobaczysz cuda.", author: "Św. Josemaria Escriva" },
  { text: "Nie ma takiego problemu, ani osobistego, ani rodzinnego, ani narodowego, ani międzynarodowego, którego nie można byłoby rozwiązać przy pomocy Różańca.", author: "Siostra Łucja z Fatimy" },
  { text: "Uciekajcie się do Maryi... i odmawiajcie codziennie Różaniec.", author: "Św. Jan Bosko" },
  { text: "Różaniec jest moją ulubioną modlitwą.", author: "Św. Jan Paweł II" },
  { text: "Kto trzyma w ręku Różaniec, ten trzyma dłoń Matki Bożej.", author: "Św. Ojciec Pio" },
  { text: "Kochajcie Maryję i czyńcie wszystko, by Ją kochano. Odmawiajcie zawsze Jej Różaniec.", author: "Św. Ojciec Pio" },
  { text: "Zdrowaś Maryjo dobrze odmawiane, czyli z uwagą, nabożeństwem i skromnością, jest - według świętych - nieprzyjacielem szatana.", author: "Św. Ludwik Maria Grignion de Montfort" }
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState(ROSARY_QUOTES[0]) // Domyślny pierwszy
  const navigate = useNavigate()

  // 1. Inicjalizacja (Sprawdzenie sesji + Losowanie cytatu)
  useEffect(() => {
    // Losuj cytat
    const randomQuote = ROSARY_QUOTES[Math.floor(Math.random() * ROSARY_QUOTES.length)]
    setQuote(randomQuote)

    // Sprawdź sesję
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        checkRoleAndRedirect(session.user.id)
      }
    }
    checkSession()
  }, [])

  const checkRoleAndRedirect = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (profile?.role === 'admin') navigate("/admin", { replace: true })
    else navigate("/dashboard", { replace: true })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert("Błąd logowania: " + error.message)
      setLoading(false)
    } else if (data.user) {
      await checkRoleAndRedirect(data.user.id)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      
      {/* LOGO / NAGŁÓWEK */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Róża Różańcowa</h1>
        <p className="text-muted-foreground text-sm">Aplikacja dla Żywego Różańca</p>
      </div>

      {/* KARTA LOGOWANIA */}
      <Card className="w-full max-w-sm shadow-lg border-muted">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Zaloguj się</CardTitle>
          <CardDescription className="text-center">
            Wpisz email i hasło, aby sprawdzić tajemnicę
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="nazwa@przyklad.pl"
                  type="email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Hasło</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zaloguj się
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SEKCJA CYTATU (FOOTER) */}
      <div className="mt-12 max-w-sm text-center px-4">
        <blockquote className="italic text-muted-foreground">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <p className="text-xs text-primary mt-2 font-medium">
          — {quote.author}
        </p>
      </div>

    </div>
  )
}
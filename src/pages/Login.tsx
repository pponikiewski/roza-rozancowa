import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase"
import { loginSchema, type LoginFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { HeaderControls } from "@/components/header-controls"
import { useAuth } from "@/context/AuthContext"

// Baza cytatów wyświetlanych losowo na stronie logowania
const ROSARY_QUOTES = [
  { text: "Różaniec to potężna broń. Używaj go z ufnością, a zobaczysz cuda.", author: "Św. Josemaria Escriva" },
  { text: "Nie ma takiego problemu, ani osobistego, ani rodzinnego, ani narodowego, ani międzynarodowego, którego nie można byłoby rozwiązać przy pomocy Różańca.", author: "Siostra Łucja z Fatimy" },
  { text: "Uciekajcie się do Maryi... i odmawiajcie codziennie Różaniec.", author: "Św. Jan Bosko" },
  { text: "Różaniec jest moją ulubioną modlitwą.", author: "Św. Jan Paweł II" },
  { text: "Kto trzyma w ręku Różaniec, ten trzyma dłoń Matki Bożej.", author: "Św. Ojciec Pio" },
  { text: "Kochajcie Maryję i czyńcie wszystko, by Ją kochano. Odmawiajcie zawsze Jej Różaniec.", author: "Św. Ojciec Pio" },
  { text: "Zdrowaś Maryjo dobrze odmawiane, czyli z uwagą, nabożeństwem i skromnością, jest - według świętych - nieprzyjacielem szatana.", author: "Św. Ludwik Maria Grignion de Montfort" }
]

// Komponent strony logowania
// Obsługuje uwierzytelnianie użytkowników i przekierowanie w zależności od roli (admin/user)
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const [quote, setQuote] = useState(ROSARY_QUOTES[0])

  const { loading: authLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    // Losowanie cytatu przy załadowaniu komponentu
    const randomQuote = ROSARY_QUOTES[Math.floor(Math.random() * ROSARY_QUOTES.length)]
    setQuote(randomQuote)
  }, [])

  // Obsługa procesu logowania
  const onSubmit = async (data: LoginFormData) => {
    setInternalLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error("Błąd logowania", {
        description: error.message || "Sprawdź poprawność adresu email i hasła."
      })
      setInternalLoading(false)
    } else {
      // Redirect będzie obsłużony przez useNavigateOnAuthChange w App.tsx
      toast.success("Zalogowano pomyślnie")
    }
  }

  return (
    <main className="login-container min-h-screen flex flex-col items-center justify-center p-10 bg-background relative">
      <HeaderControls className="absolute top-4 right-4" />

      {/* LOGO / NAGŁÓWEK */}
      <div className="mb-8 text-center space-y-2 flex flex-col items-center">
        <img
          src="/roseb.svg"
          alt="Logo"
          className="w-24 h-24 mb-2"
          fetchPriority="high"
        />
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="nazwa@przyklad.pl"
                  type="email"
                  autoComplete="email"
                  className="pl-9"
                  {...register("email")}
                  disabled={internalLoading || authLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Hasło</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-9 pr-10"
                  {...register("password")}
                  disabled={internalLoading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button className="w-full" disabled={internalLoading || authLoading}>
              {(internalLoading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

    </main>
  )
}
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authService } from "@/features/auth/api/auth.service"
import { loginSchema, type LoginFormData } from "@/shared/validation/auth.schema"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader } from "@/shared/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { HeaderControls, PasswordInput } from "@/shared/components/common"
import { useAuth } from "@/features/auth/context/AuthContext"
import { ROSARY_QUOTES } from "@/shared/lib/constants"
import { getErrorMessage } from "@/shared/lib/utils"

// Losowanie cytatu - wykonywane raz przy imporcie modułu
const getRandomQuote = () => ROSARY_QUOTES[Math.floor(Math.random() * ROSARY_QUOTES.length)]

// Komponent strony logowania
// Obsługuje uwierzytelnianie użytkowników i przekierowanie w zależności od roli (admin/user)
export default function LoginPage() {
  const [internalLoading, setInternalLoading] = useState(false)
  const [quote] = useState(getRandomQuote)

  const { loading: authLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Obsługa procesu logowania
  const onSubmit = async (data: LoginFormData) => {
    setInternalLoading(true)

    try {
      await authService.signIn(data.login, data.password)
      toast.success("Zalogowano pomyślnie")
      // Redirect będzie obsłużony przez useNavigateOnAuthChange w App.tsx
    } catch (error) {
      toast.error("Błąd logowania", {
        description: getErrorMessage(error) || "Sprawdź poprawność loginu i hasła."
      })
      setInternalLoading(false)
    }
  }

  return (
    <main className="login-container min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background relative">
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
        <p className="text-muted-foreground text-base">Aplikacja Żywego Różańca</p>
      </div>

      {/* KARTA LOGOWANIA */}
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardDescription className="text-center text-base">
            Wpisz login i hasło, aby sprawdzić tajemnicę.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                aria-invalid={!!errors.login}
                {...register("login")}
                disabled={internalLoading || authLoading}
              />
              {errors.login && (
                <p className="text-sm text-destructive">{errors.login.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
                disabled={internalLoading || authLoading}
                hasError={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button size="lg" className="w-full font-semibold" disabled={internalLoading || authLoading}>
              {(internalLoading || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zaloguj się
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SEKCJA CYTATU (FOOTER) */}
      <div className="mt-12 max-w-sm text-center px-4">
        <blockquote className="italic text-[0.9375rem] leading-relaxed text-muted-foreground">
          „{quote.text}”
        </blockquote>
        <p className="text-sm text-primary mt-2 font-semibold">
          {quote.author}
        </p>
      </div>

    </main>
  )
}
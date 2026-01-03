import { useState, forwardRef } from "react"
import { Input } from "@/shared/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/shared/lib/utils"

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Czy pokazywać przycisk toggle widoczności hasła */
  showToggle?: boolean
  /** Czy pole ma błąd walidacji */
  hasError?: boolean
}

/**
 * Reużywalny komponent pola hasła z przyciskiem show/hide
 * 
 * @example
 * <PasswordInput 
 *   placeholder="Wpisz hasło..." 
 *   hasError={!!errors.password}
 *   {...register("password")}
 * />
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, hasError, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn(
            "pr-10",
            hasError && "border-destructive",
            className
          )}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

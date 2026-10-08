import type { CSSProperties } from "react"
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from "lucide-react"
import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/shared/context/ThemeContext"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toasty w stylu kart aplikacji: tło karty, obramowanie, rounded-xl, font Inter.
 * Typ powiadomienia rozróżnia kolor ikony (tokeny success/destructive/warning/primary),
 * a nie kolorowe tło. Kolory sonnera zastępujemy zmiennymi motywu, więc toast
 * zmienia się razem z motywem i trybem seniora.
 */
const themeVars = {
  "--normal-bg": "hsl(var(--card))",
  "--normal-text": "hsl(var(--card-foreground))",
  "--normal-border": "hsl(var(--border))",
  "--normal-bg-hover": "hsl(var(--accent))",
  "--normal-border-hover": "hsl(var(--border))",
  "--border-radius": "0.75rem",
  // Wymuszamy bardzo wysoki z-index, aby toasty były nad Dialogami (z-index: 50)
  zIndex: 99999,
} as CSSProperties

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={themeVars}
      // Na telefonie powiadomienie pod paskiem statusu, nie na zegarze (aplikacja na ekranie głównym)
      mobileOffset={{ top: "calc(env(safe-area-inset-top) + 16px)" }}
      icons={{
        success: <CircleCheck className="h-5 w-5 text-success" />,
        error: <CircleAlert className="h-5 w-5 text-destructive" />,
        warning: <TriangleAlert className="h-5 w-5 text-warning" />,
        info: <Info className="h-5 w-5 text-primary" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:items-start group-[.toaster]:gap-3 group-[.toaster]:p-4 group-[.toaster]:font-sans group-[.toaster]:text-sm group-[.toaster]:shadow-lg",
          icon: "group-[.toast]:!mx-0 group-[.toast]:!h-5 group-[.toast]:!w-5",
          title: "group-[.toast]:!font-semibold group-[.toast]:leading-5",
          description: "group-[.toast]:!text-muted-foreground group-[.toast]:leading-snug",
          actionButton:
            "group-[.toast]:!rounded-md group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground",
          cancelButton:
            "group-[.toast]:!rounded-md group-[.toast]:!bg-muted group-[.toast]:!text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

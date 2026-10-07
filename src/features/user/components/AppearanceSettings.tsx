import { OptionGroup } from "@/shared/components/common/OptionGroup"
import { useTheme, type SeniorMode } from "@/shared/context/ThemeContext"

type ResolvedTheme = "light" | "dark"

/** Motyw "system" pokazujemy jako ten, który faktycznie jest teraz widoczny */
function resolveTheme(theme: string): ResolvedTheme {
  if (theme === "light" || theme === "dark") return theme
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * Ustawienia wyglądu w panelu konta: motyw i wielkość tekstu (tryby seniora)
 */
export function AppearanceSettings() {
  const { theme, setTheme, seniorMode, setSeniorMode } = useTheme()

  return (
    <div className="space-y-3">
      <OptionGroup<ResolvedTheme>
        label="Motyw"
        value={resolveTheme(theme)}
        onChange={setTheme}
        options={[
          { value: "light", label: "Jasny" },
          { value: "dark", label: "Ciemny" },
        ]}
      />
      <OptionGroup<SeniorMode>
        label="Tekst"
        value={seniorMode}
        onChange={setSeniorMode}
        options={[
          { value: "normal", label: "Zwykły" },
          { value: "senior", label: "Duży" },
          { value: "ultra", label: "Największy", ariaLabel: "Największy, z wysokim kontrastem" },
        ]}
      />
    </div>
  )
}

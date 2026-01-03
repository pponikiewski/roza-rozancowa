import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"
export type SeniorMode = "normal" | "senior" | "ultra"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  seniorMode: SeniorMode
  toggleSeniorMode: () => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  seniorMode: "normal",
  toggleSeniorMode: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

/**
 * Provider motywu zarządzający zmianą klas CSS na elemencie root oraz zapisem w localStorage
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  const [seniorMode, setSeniorMode] = useState<SeniorMode>(
    () => (localStorage.getItem("vite-ui-senior-mode") as SeniorMode) || "normal"
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("senior-mode", "ultra-senior-mode")
    
    if (seniorMode === "senior") {
      root.classList.add("senior-mode")
    } else if (seniorMode === "ultra") {
      root.classList.add("senior-mode", "ultra-senior-mode")
    }
    
    localStorage.setItem("vite-ui-senior-mode", seniorMode)
  }, [seniorMode])

  const toggleSeniorMode = () => {
    setSeniorMode((prev) => {
      if (prev === "normal") return "senior"
      if (prev === "senior") return "ultra"
      return "normal"
    })
  }

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    seniorMode,
    toggleSeniorMode,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * Hook ułatwiający dostęp do kontekstu motywu w komponentach
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

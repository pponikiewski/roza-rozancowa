import { useEffect } from "react"
import { useTheme } from "@/shared/context/ThemeContext"
import { setStatusBarColor } from "@/shared/lib/statusBar"

/**
 * Pasek statusu w kolorze nagłówka, dopóki nagłówek jest na ekranie.
 * Po zmianie motywu kolor liczony od nowa (ThemeProvider zmienia klasy w efekcie layoutu, wcześniej)
 */
export function useStatusBarColor(token: "background" | "card") {
  const { theme, seniorMode } = useTheme()

  useEffect(() => {
    setStatusBarColor(token)
    return () => setStatusBarColor("background")
  }, [token, theme, seniorMode])
}

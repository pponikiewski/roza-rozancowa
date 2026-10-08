/**
 * Kolor paska statusu telefonu (meta theme-color) z bieżącego motywu, a nie z ustawień systemu.
 * Na Androidzie po instalacji pasek ma kolor tła strony albo nagłówka
 */
export function setStatusBarColor(token: "background" | "card") {
  const meta = document.querySelector('meta[name="theme-color"]')
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim()
  if (meta && value) meta.setAttribute("content", `hsl(${value})`)
}

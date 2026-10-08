/**
 * Ekran startowy aplikacji: logo na środku, kółko ładowania po chwili.
 * Ten sam układ jest w index.html (zanim wczyta się JavaScript) i na obrazkach startowych iOS,
 * więc po otwarciu z ekranu głównego logo stoi w miejscu aż do pokazania strony.
 * Style: klasa .app-splash w index.css
 */
export function AppSplash() {
  return (
    <div className="app-splash" role="status" aria-label="Ładowanie">
      <img src="/logo-288.webp" alt="" width={96} height={96} className="app-splash-logo" />
      <span className="app-splash-loader" />
    </div>
  )
}

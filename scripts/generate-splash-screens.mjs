// Obrazki startowe iOS (apple-touch-startup-image) dla aplikacji dodanej do ekranu głównego.
// Bez nich iPhone pokazuje przy starcie biały ekran. Układ jak .app-splash w src/index.css:
// logo 128 px na środku, tło jak motyw ciemny (#151619, background_color w manifeście).
// Uruchomienie po zmianie logo: node scripts/generate-splash-screens.mjs
// Wypisuje znaczniki <link> do wklejenia w index.html
import { chromium } from "@playwright/test"
import { mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "public", "splash")
const logo = readFileSync(join(root, "public", "logo-384.webp")).toString("base64")

// Ekrany w orientacji pionowej: szerokość i wysokość w punktach CSS, gęstość pikseli
const devices = [
  // iPhone
  [440, 956, 3], // 16 Pro Max, 17 Pro Max
  [430, 932, 3], // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [428, 926, 3], // 12 Pro Max, 13 Pro Max, 14 Plus
  [420, 912, 3], // Air
  [414, 896, 3], // XS Max, 11 Pro Max
  [414, 896, 2], // XR, 11
  [414, 736, 3], // 6 Plus – 8 Plus
  [402, 874, 3], // 16 Pro, 17, 17 Pro
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [390, 844, 3], // 12, 13, 14, 16e
  [375, 812, 3], // X, XS, 11 Pro, 12 mini, 13 mini
  [375, 667, 2], // 6 – 8, SE 2. i 3. generacji
  [320, 568, 2], // SE 1. generacji
  // iPad
  [1032, 1376, 2], // Pro 13"
  [1024, 1366, 2], // Pro 12,9"
  [834, 1210, 2], // Pro 11" (M4)
  [834, 1194, 2], // Pro 11"
  [834, 1112, 2], // Air 10,5"
  [820, 1180, 2], // Air 10,9", iPad 10. generacji
  [810, 1080, 2], // iPad 10,2"
  [768, 1024, 2], // mini 5, iPad 9,7"
  [744, 1133, 2], // mini 6
]

const html = `<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#151619">
<img src="data:image/webp;base64,${logo}" width="128" height="128" alt=""></body></html>`

mkdirSync(outDir, { recursive: true })
// Chrome zainstalowany w systemie: nie trzeba pobierać przeglądarek Playwrighta
const browser = await chromium.launch({ channel: "chrome" })
const links = []

for (const [width, height, scale] of devices) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale })
  await page.setContent(html)
  const file = `apple-splash-${width * scale}-${height * scale}.png`
  await page.screenshot({ path: join(outDir, file) })
  await page.close()
  links.push(
    `<link rel="apple-touch-startup-image" media="(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${scale}) and (orientation: portrait)" href="/splash/${file}" />`
  )
}

await browser.close()
console.log(links.join("\n"))

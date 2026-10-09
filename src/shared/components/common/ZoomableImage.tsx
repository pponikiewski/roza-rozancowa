import { lazy, Suspense, useRef, useState } from "react"
import { Expand } from "lucide-react"

// Podgląd pełnoekranowy (Radix Dialog) ładowany przy pierwszym kliknięciu — nie obciąża startu panelu
const ImageViewer = lazy(() => import("./ImageViewer"))

interface ZoomableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

/**
 * Obraz otwierany kliknięciem na pełnym ekranie, jak zdjęcie w galerii (podgląd w ImageViewer)
 */
export function ZoomableImage({ src, alt, className, ...props }: ZoomableImageProps) {
  const [open, setOpen] = useState(false)
  // Raz otwarty podgląd zostaje zamontowany — animacja zamknięcia działa normalnie
  const [viewerMounted, setViewerMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const openViewer = () => {
    setViewerMounted(true)
    setOpen(true)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openViewer}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Powiększ obraz: ${alt}`}
        title="Kliknij obraz, aby go powiększyć"
        className="group relative h-full max-w-full cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img src={src} alt={alt} className={className} {...props} />
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors group-hover:bg-black/60"
        >
          <Expand className="h-4 w-4" />
        </span>
      </button>

      {viewerMounted && (
        <Suspense fallback={null}>
          <ImageViewer
            open={open}
            onOpenChange={setOpen}
            src={src}
            alt={alt}
            crossOrigin={props.crossOrigin}
            returnFocusRef={triggerRef}
          />
        </Suspense>
      )}
    </>
  )
}

import { useLayoutEffect, useRef, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Expand, X } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface ZoomableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

const ZOOM_SCALE = 2.5

interface ZoomState {
  width: number
  height: number
  // Punkt kliknięcia jako ułamek szerokości/wysokości obrazu (0–1)
  originX: number
  originY: number
}

/**
 * Obraz otwierany kliknięciem na pełnym ekranie, jak zdjęcie w galerii.
 * W podglądzie kliknięcie w obraz przybliża go w miejscu kliknięcia, kolejne oddala.
 */
export function ZoomableImage({ src, alt, className, ...props }: ZoomableImageProps) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState<ZoomState | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setZoom(null)
  }

  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation()
    if (zoom) {
      setZoom(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setZoom({
      width: rect.width * ZOOM_SCALE,
      height: rect.height * ZOOM_SCALE,
      originX: (e.clientX - rect.left) / rect.width,
      originY: (e.clientY - rect.top) / rect.height,
    })
  }

  // Po przybliżeniu przewija widok tak, by kliknięty punkt był na środku ekranu
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || !zoom) return
    el.scrollLeft = zoom.originX * zoom.width - el.clientWidth / 2
    el.scrollTop = zoom.originY * zoom.height - el.clientHeight / 2
  }, [zoom])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
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
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

          {/* Kliknięcie w tło zamyka podgląd */}
          <div
            ref={scrollRef}
            onClick={() => handleOpenChange(false)}
            className={cn(
              "absolute inset-0 flex overscroll-contain",
              zoom
                ? "overflow-auto"
                : "overflow-hidden px-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pt-[calc(env(safe-area-inset-top)+4rem)]"
            )}
          >
            <img
              src={src}
              alt={alt}
              onClick={toggleZoom}
              style={zoom ? { width: zoom.width, height: zoom.height } : undefined}
              className={cn(
                "m-auto shrink-0 select-none object-contain",
                zoom ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in"
              )}
              draggable={false}
            />
          </div>

          <DialogPrimitive.Close className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[calc(env(safe-area-inset-top)+1rem)] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="h-6 w-6" />
            <span className="sr-only">Zamknij</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

import { useLayoutEffect, useRef, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface ImageViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
  crossOrigin?: React.ImgHTMLAttributes<HTMLImageElement>["crossOrigin"]
  /** Miniatura, która otworzyła podgląd — dostaje fokus po zamknięciu */
  returnFocusRef: React.RefObject<HTMLElement | null>
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
 * Podgląd obrazu na pełnym ekranie, jak zdjęcie w galerii (otwierany z ZoomableImage).
 * Kliknięcie w obraz przybliża go w miejscu kliknięcia, kolejne oddala.
 */
export default function ImageViewer({ open, onOpenChange, src, alt, crossOrigin, returnFocusRef }: ImageViewerProps) {
  const [zoom, setZoom] = useState<ZoomState | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
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
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          // Bez DialogPrimitive.Trigger Radix nie wie, dokąd oddać fokus
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            returnFocusRef.current?.focus()
          }}
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
              // Ten sam tryb co miniatura — obraz z cache, bez ponownego pobrania
              crossOrigin={crossOrigin}
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

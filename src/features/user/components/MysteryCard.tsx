import { memo } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { ResizableText } from "@/shared/components/common/ResizableText"
import { ZoomableImage } from "@/shared/components/common/ZoomableImage"
import { formatTimeLeft } from "@/shared/lib/formatters"
import type { Mystery } from "@/features/mysteries/types/mystery.types"

interface MysteryCardProps {
  mystery: Mystery
  isAcknowledged: boolean
  actionLoading: boolean
  timeLeft: { days: number; hours: number; minutes: number }
  onAcknowledge: () => void
}

/**
 * Sekcja wyświetlająca tajemnicę różańcową z obrazem, medytacją i przyciskiem potwierdzenia
 * Zmemoizowana - rerenderuje tylko gdy zmienia się mystery, status potwierdzenia lub timer
 */
export const MysteryCard = memo(function MysteryCard({
  mystery,
  isAcknowledged,
  actionLoading,
  timeLeft,
  onAcknowledge,
}: MysteryCardProps) {
  return (
    <section className="py-6">
      <div className="w-full flex items-center justify-center aspect-[3/4] max-h-[50vh]">
        {mystery.image_url ? (
          <ZoomableImage
            src={mystery.image_url}
            alt={mystery.name}
            width={600}
            height={800}
            fetchPriority="high"
            className="h-full w-auto max-w-full object-contain rounded-lg"
          />
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Brak wizualizacji
          </div>
        )}
      </div>

      <div className="mt-6 space-y-1">
        <p className="text-sm font-medium text-primary">{mystery.part}</p>
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">{mystery.name}</h2>
      </div>

      <div className="mt-3">
        <ResizableText className="text-base text-foreground leading-7">{mystery.meditation}</ResizableText>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {isAcknowledged ? (
          <Button
            className="w-full h-12 text-base font-semibold bg-success-soft text-success shadow-none disabled:opacity-100"
            disabled
          >
            Potwierdzone
          </Button>
        ) : (
          <Button
            onClick={onAcknowledge}
            disabled={actionLoading}
            className="w-full h-12 text-base font-semibold shadow-none transition-all active:scale-[0.98]"
          >
            {actionLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Potwierdzam zapoznanie się"
            )}
          </Button>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>Do zmiany tajemnic:</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatTimeLeft(timeLeft)}
          </span>
        </div>
      </div>
    </section>
  )
})

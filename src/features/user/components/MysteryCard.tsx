import { memo } from "react"
import { CheckCircle2, Timer, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { ResizableText } from "@/shared/components/common/ResizableText"
import { getOptimizedImageUrl } from "@/shared/lib/utils"
import type { Mystery } from "@/features/mysteries/types/mystery.types"

interface MysteryCardProps {
  mystery: Mystery
  isAcknowledged: boolean
  actionLoading: boolean
  timeLeft: { days: number; hours: number; minutes: number }
  onAcknowledge: () => void
}

/**
 * Karta wyświetlająca tajemnicę różańcową z obrazem, medytacją i przyciskiem potwierdzenia
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
    <Card className="overflow-hidden">
      <div className="w-full bg-muted flex items-center justify-center p-4 relative aspect-[3/4] max-h-[50vh] border-b">
        {mystery.image_url ? (
          <img
            src={getOptimizedImageUrl(mystery.image_url, 800)}
            srcSet={`
              ${getOptimizedImageUrl(mystery.image_url, 300)} 300w,
              ${getOptimizedImageUrl(mystery.image_url, 500)} 500w,
              ${getOptimizedImageUrl(mystery.image_url, 800)} 800w
            `}
            sizes="(max-width: 550px) 90vw, 500px"
            alt={mystery.name}
            width={600}
            height={800}
            fetchPriority="high"
            className="w-auto h-auto max-h-full object-contain shadow-md rounded-lg"
          />
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Brak wizualizacji
          </div>
        )}
      </div>

      <CardHeader className="px-5 pb-3 pt-5 space-y-2">
        <Badge variant="soft" className="w-fit uppercase tracking-wider">
          {mystery.part}
        </Badge>
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">{mystery.name}</h2>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <div className="pl-4 border-l-2 border-primary/50">
          <ResizableText className="text-base text-foreground leading-7">{mystery.meditation}</ResizableText>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-5 flex flex-col gap-4 border-t">
        {isAcknowledged ? (
          <Button
            className="w-full h-12 text-base font-semibold bg-success-soft text-success shadow-none disabled:opacity-100"
            disabled
          >
            <CheckCircle2 className="mr-1 h-5 w-5" />
            Potwierdzone
          </Button>
        ) : (
          <Button
            onClick={onAcknowledge}
            disabled={actionLoading}
            className="w-full h-12 text-base font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            {actionLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Zapoznałem się z tajemnicą <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>Do zmiany tajemnic:</span>
          <span className="font-semibold tabular-nums text-foreground">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>
      </CardFooter>
    </Card>
  )
})

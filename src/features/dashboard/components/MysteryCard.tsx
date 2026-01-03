import { memo } from "react"
import { CheckCircle2, Timer, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
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
    <Card className="overflow-hidden shadow-lg border-border/60">
      <div className="w-full bg-black/5 dark:bg-black/20 flex items-center justify-center p-4 relative min-h-[200px]">
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
            fetchPriority="high"
            className="w-auto h-auto max-h-[50vh] object-contain shadow-sm rounded-md"
          />
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Brak wizualizacji
          </div>
        )}
      </div>

      <CardHeader className="pb-2 pt-5">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase text-[10px] tracking-wider">
            {mystery.part}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{mystery.name}</h2>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="relative pl-4 border-l-2 border-primary/20">
          <ResizableText className="text-muted-foreground text-sm leading-6">{mystery.meditation}</ResizableText>
        </div>
      </CardContent>

      <Separator className="my-4 opacity-50" />

      <CardFooter className="pb-6 pt-0 flex flex-col gap-4">
        {isAcknowledged ? (
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md h-12 text-sm font-medium transition-all" disabled>
            <CheckCircle2 className="mr-2 h-5 w-5" />
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
                Zapoznałem się z tajemnicą <ChevronRight className="ml-1 h-4 w-4 opacity-70" />
              </span>
            )}
          </Button>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <Timer className="h-3 w-3" />
          <span>Do zmiany tajemnic:</span>
          <span className="font-mono font-medium tabular-nums text-foreground/80">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>
      </CardFooter>
    </Card>
  )
})

import { memo } from "react"
import { ResizableText } from "@/shared/components/common/resizable-text"

interface IntentionCardProps {
  title?: string
  content: string
  month: string
}

/**
 * Karta wyświetlająca intencję modlitewną na bieżący miesiąc
 * Zmemoizowana dla lepszej wydajności - rerenderuje tylko gdy zmienia się intencja
 */
export const IntentionCard = memo(function IntentionCard({ title, content, month }: IntentionCardProps) {
  return (
    <div className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-background border border-rose-100 dark:border-rose-900/50 rounded-xl p-5 shadow-sm">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Intencja na {month}
          </span>
        </div>
        {title && (
          <h3 className="text-sm font-semibold mb-1 text-foreground/90">{title}</h3>
        )}
        <ResizableText className="text-sm text-muted-foreground/90 italic leading-relaxed">
          "{content}"
        </ResizableText>
      </div>
    </div>
  )
})

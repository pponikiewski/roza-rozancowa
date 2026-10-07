import { memo } from "react"
import { CardLabel } from "@/shared/components/common/CardLabel"
import { ResizableText } from "@/shared/components/common/ResizableText"

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
    <section className="py-6">
      <CardLabel className="mb-2">Intencja na {month}</CardLabel>
      {title && (
        <h3 className="text-base font-semibold leading-snug mb-1.5 text-foreground">{title}</h3>
      )}
      <ResizableText className="text-[0.9375rem] text-foreground leading-relaxed">
        „{content}”
      </ResizableText>
    </section>
  )
})

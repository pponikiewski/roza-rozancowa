import { memo } from "react"
import { Sparkles } from "lucide-react"
import { CardLabel } from "@/shared/components/common/CardLabel"
import { ResizableText } from "@/shared/components/common/ResizableText"
import type { IndulgenceDay } from "@/shared/types/domain.types"

interface IndulgenceCardProps {
  indulgences: IndulgenceDay[]
}

/**
 * Karta informująca o odpuście możliwym do uzyskania dzisiaj
 */
export const IndulgenceCard = memo(function IndulgenceCard({ indulgences }: IndulgenceCardProps) {
  return (
    <section className="rounded-xl border border-warning/40 bg-warning-soft p-5 shadow-sm">
      <CardLabel icon={Sparkles} tone="warning" className="mb-3">Dziś możesz zyskać odpust</CardLabel>
      <div className="flex flex-col gap-3">
        {indulgences.map((item) => (
          <div key={item.id}>
            <h3 className="text-base font-semibold leading-snug mb-1 text-foreground">{item.name}</h3>
            {item.description && (
              <ResizableText className="text-[0.9375rem] text-foreground leading-relaxed whitespace-pre-line">
                {item.description}
              </ResizableText>
            )}
          </div>
        ))}
      </div>
    </section>
  )
})

import { memo } from "react"
import { Sparkles } from "lucide-react"
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
    <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-background border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          <Sparkles className="h-3 w-3" /> Dziś możesz zyskać odpust
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {indulgences.map((item) => (
          <div key={item.id}>
            <h3 className="text-sm font-semibold mb-1 text-foreground/90">{item.name}</h3>
            {item.description && (
              <ResizableText className="text-sm text-muted-foreground/90 leading-relaxed whitespace-pre-line">
                {item.description}
              </ResizableText>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

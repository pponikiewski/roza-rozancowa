import { cn } from "@/shared/lib/utils"

interface CollapsibleProps {
  open: boolean
  id?: string
  children: React.ReactNode
  className?: string
}

/**
 * Obszar zwijany z płynną zmianą wysokości (grid-rows 0fr -> 1fr).
 * Zwinięta treść zostaje w DOM, ale jest niedostępna z klawiatury i dla czytników ekranu (inert)
 */
export function Collapsible({ open, id, children, className }: CollapsibleProps) {
  return (
    <div
      id={id}
      className={cn(
        "grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className
      )}
    >
      <div className="overflow-hidden" inert={!open}>
        {children}
      </div>
    </div>
  )
}

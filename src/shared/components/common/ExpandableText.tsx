import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/shared/lib/utils"

interface ExpandableTextProps {
  children: React.ReactNode
  className?: string
}

/**
 * Tekst skrócony do 2 linii; kliknięcie w tekst pokazuje całość i zwija z powrotem.
 * Klikalny tylko wtedy, gdy tekst faktycznie się nie mieści
 */
export function ExpandableText({ children, className }: ExpandableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1)
    measure()
    // Szerokość zmienia się np. przy obrocie telefonu albo zmianie wielkości tekstu
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded, children])

  const clickable = overflows || expanded
  const toggle = () => setExpanded((v) => !v)

  return (
    <p
      ref={ref}
      className={cn(
        "whitespace-pre-line",
        !expanded && "line-clamp-2",
        clickable && "cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...(clickable && {
        role: "button",
        tabIndex: 0,
        "aria-expanded": expanded,
        title: expanded ? "Kliknij, aby zwinąć" : "Kliknij, aby przeczytać całość",
        onClick: toggle,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggle()
          }
        },
      })}
    >
      {children}
    </p>
  )
}

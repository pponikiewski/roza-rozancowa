import { cn } from "@/shared/lib/utils"

/** Szary zarys elementu, który się wczytuje. Pulsuje tylko, gdy system nie ogranicza animacji */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-md bg-muted motion-safe:animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }

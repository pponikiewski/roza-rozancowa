import { useState } from "react"
import { cn } from "@/lib/utils"

interface ResizableTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
}

// Definicje poziomów powiększenia
// Używamy tailwind-merge w cn(), więc te klasy nadpiszą text-sm z className
const sizeClasses = {
  0: "",
  1: "text-base leading-relaxed font-medium",
  2: "text-lg leading-loose font-semibold"
}

export function ResizableText({
  children,
  className,
  as: Component = "p",
  ...props
}: ResizableTextProps) {
  const [level, setLevel] = useState(0)

  const toggleSize = (e: React.MouseEvent) => {
    // Zapobiegamy propagacji, jeśli tekst jest wewnątrz innego elementu klikalnego (choć tu raczej nie będzie)
    e.stopPropagation()
    setLevel((prev) => (prev + 1) % 3)
  }

  return (
    <Component
      {...props}
      onClick={toggleSize}
      className={cn(
        "cursor-pointer transition-all duration-200 select-none hover:opacity-80 active:scale-[0.99]",
        className,
        sizeClasses[level as keyof typeof sizeClasses]
      )}
      title="Kliknij tekst, aby go powiększyć (3 poziomy)"
    >
      {children}
    </Component>
  )
}

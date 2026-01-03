import { useState } from "react"
import { cn } from "@/shared/lib/utils"
import { useTheme } from "@/shared/context/ThemeContext"

interface ResizableTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
}

export function ResizableText({
  children,
  className,
  as: Component = "p",
  ...props
}: ResizableTextProps) {
  const [level, setLevel] = useState(0)
  const { seniorMode } = useTheme()
  const isUltra = seniorMode === "ultra"

  const sizeClasses = {
    0: "", // Base size (original)
    // In Ultra mode, base size is already large. We start scaling from text-xl to ensure visible difference.
    1: isUltra ? "text-xl leading-loose font-semibold" : "text-base leading-relaxed font-medium",
    2: isUltra ? "text-2xl leading-loose font-bold" : "text-lg leading-loose font-semibold"
  }

  const toggleSize = (e: React.MouseEvent) => {
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

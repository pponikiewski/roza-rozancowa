import { cn } from "@/shared/lib/utils"

interface Option<T extends string> {
  value: T
  label: string
  /** Pełny opis dla czytników ekranu, gdy etykieta jest skrócona */
  ariaLabel?: string
}

interface OptionGroupProps<T extends string> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/**
 * Wiersz ustawienia: podpis po lewej, przełącznik segmentowy po prawej.
 * Aktualny wybór zawsze widoczny (zamiast przycisku przełączającego w kółko).
 * Gdy brakuje miejsca, przełącznik przechodzi pod podpis
 */
export function OptionGroup<T extends string>({ label, options, value, onChange }: OptionGroupProps<T>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <span className="text-[0.9375rem] text-foreground">{label}</span>
      {/* flex-wrap: przy dużym tekście segmenty przechodzą do nowej linii zamiast łamać słowa */}
      <div role="radiogroup" aria-label={label} className="flex max-w-full flex-wrap gap-0.5 rounded-lg border bg-muted/50 p-0.5">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.ariaLabel}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-9 flex-auto whitespace-nowrap rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Funkcja pomocnicza do łączenia klas CSS (Tailwind) z obsługą warunków i konfliktów
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

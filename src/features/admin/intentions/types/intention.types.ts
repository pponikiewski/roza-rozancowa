/**
 * Typy dla zarządzania intencjami (admin)
 */
export interface Intention {
  title: string
  content: string
}

export interface IntentionHistory extends Intention {
  id: number
  month: number
  year: number
}

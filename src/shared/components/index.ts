// Shared components - public exports

// UI primitives (shadcn)
export * from './ui/accordion'
export * from './ui/badge'
export * from './ui/button'
export * from './ui/card'
export * from './ui/dialog'
export * from './ui/input'
export * from './ui/label'
export * from './ui/select'
export * from './ui/separator'
export * from './ui/sheet'
export * from './ui/sonner'
export * from './ui/table'
export * from './ui/textarea'

// Common application components
export { HeaderControls } from './common/HeaderControls'
export { ModeToggle } from './common/ModeToggle'
export { ResizableText } from './common/ResizableText'
export { SeniorModeToggle } from './common/SeniorModeToggle'

// Re-export ThemeProvider from context
export { ThemeProvider, useTheme } from '@/shared/context/ThemeContext'

// Feedback components
export { ConfirmationDialog, useConfirmation } from './feedback'
export { LoadingScreen } from './feedback'

// Layout components
export { ErrorBoundary } from './layout/ErrorBoundary'

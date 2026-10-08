// Auth feature - public exports
export { AuthProvider, useAuth } from './context/AuthContext'
export { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
export { useNavigateOnAuthChange } from './hooks/useNavigateOnAuthChange'
export { useLogout } from './hooks/useLogout'
export { authService } from './api/auth.service'
// LoginPage celowo poza barrelem — ładowana leniwie (routes.tsx); eksport stąd wciągałby
// schemat zod do głównej paczki razem z każdym importem useLogout
export type * from './types/auth.types'

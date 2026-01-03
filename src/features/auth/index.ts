// Auth feature - public exports
export { AuthProvider, useAuth } from './context/AuthContext'
export { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
export { useNavigateOnAuthChange } from './hooks/useNavigateOnAuthChange'
export { authService } from './api/auth.service'
export { default as LoginPage } from './pages/LoginPage'
export type * from './types/auth.types'

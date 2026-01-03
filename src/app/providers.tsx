import type { ReactNode } from "react"
import { ThemeProvider } from "@/shared/components/common/ThemeProvider"
import { AuthProvider } from "@/features/auth/context/AuthContext"
import { Toaster } from "@/shared/components/ui/sonner"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/shared/lib/queryClient"

interface ProvidersProps {
  children: ReactNode
}

/**
 * Centralny komponent zarządzający wszystkimi providerami aplikacji
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import type { ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { authService } from "@/features/auth/api/auth.service"
import { userService } from "@/features/user/api/user.service"
import { AppSplash } from "@/shared/components/feedback"
import { QUERY_KEYS } from "@/shared/lib/constants"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isAdmin: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext } // Export AuthContext

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    // Użytkownik, dla którego ustalono rolę (undefined = sesja jeszcze nie sprawdzona)
    const currentUserId = useRef<string | null | undefined>(undefined)

    /**
     * Sprawdzenie roli admina. Pobiera cały profil i zapisuje go w cache React Query,
     * więc panel użytkownika nie pyta o profil drugi raz
     */
    const loadRole = useCallback(async (userId: string) => {
        let admin = false
        try {
            const profile = await queryClient.fetchQuery({
                queryKey: QUERY_KEYS.PROFILE(userId),
                queryFn: () => userService.getProfile(userId),
            })
            admin = profile?.role === 'admin'
        } catch {
            // Błąd sprawdzania roli — użytkownik nie dostanie uprawnień admina
        }
        // W międzyczasie mógł zalogować się ktoś inny
        if (currentUserId.current !== userId) return
        setIsAdmin(admin)
        setLoading(false)
    }, [queryClient])

    /**
     * Czyści Supabase tokens z localStorage - fix dla "ghost sessions" na mobile
     */
    const clearSupabaseStorage = () => {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
                localStorage.removeItem(key)
            }
        })
    }

    useEffect(() => {
        // Pierwsze zdarzenie to INITIAL_SESSION, więc osobne getSession() nie jest potrzebne
        const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
            const userId = session?.user?.id ?? null
            setSession(session)
            setUser(session?.user ?? null)

            // Odświeżenie tokenu lub powrót do aplikacji — ten sam użytkownik, rola się nie zmienia.
            // Bez ekranu ładowania, inaczej cała aplikacja montowałaby się od nowa
            if (userId === currentUserId.current) return
            currentUserId.current = userId

            if (userId) {
                setLoading(true)
                loadRole(userId)
            } else {
                setIsAdmin(false)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [loadRole])

    const signOut = useCallback(async () => {
        try {
            await authService.signOut()
        } catch {
            // Błąd wylogowania — localStorage zostanie wyczyszczony w finally
        } finally {
            // Nuclear option for mobile devices with aggressive caching
            clearSupabaseStorage()
            // State will be cleared by onAuthStateChange listener
        }
    }, [])

    const value = useMemo(
        () => ({ user, session, loading, isAdmin, signOut }),
        [user, session, loading, isAdmin, signOut]
    )

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <AppSplash />
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { ReactNode } from "react"
import { supabase } from "@/shared/lib/supabase"
import { authService } from "@/features/auth/api/auth.service"
import { LoadingScreen } from "@/shared/components/feedback"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isAdmin: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    /**
     * Sprawdzenie roli admina dla użytkownika
     */
    const checkAdminRole = useCallback(async (userId: string, isMounted: () => boolean) => {
        try {
            const role = await authService.checkUserRole(userId)
            if (isMounted()) {
                setIsAdmin(role === 'admin')
            }
        } catch (e) {
            console.error("Error checking role", e)
        } finally {
            if (isMounted()) {
                setLoading(false)
            }
        }
    }, [])

    /**
     * Centralna funkcja do obsługi sesji - deduplikuje logikę używaną
     * przez getSession() i onAuthStateChange()
     * @param isMounted - funkcja sprawdzająca czy komponent jest zamontowany
     */
    const handleSession = useCallback(async (session: Session | null, isMounted: () => boolean) => {
        if (!isMounted()) return
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
            setLoading(true)
            await checkAdminRole(session.user.id, isMounted)
        } else {
            setIsAdmin(false)
            setLoading(false)
        }
    }, [checkAdminRole])

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
        let mounted = true
        const isMounted = () => mounted

        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session, isMounted)
        })

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
            handleSession(session, isMounted)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [handleSession])

    const signOut = async () => {
        try {
            await authService.signOut()
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            // Nuclear option for mobile devices with aggressive caching
            clearSupabaseStorage()
            // State will be cleared by onAuthStateChange listener
        }
    }

    const value = {
        user,
        session,
        loading,
        isAdmin,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <LoadingScreen fullScreen />
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

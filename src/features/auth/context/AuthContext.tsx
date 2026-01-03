import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { supabase } from "@/shared/lib/supabase"
import { authService } from "@/features/auth/api/auth.service"
import type { User, Session } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

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
     * Centralna funkcja do obsługi sesji - deduplikuje logikę używaną
     * przez getSession() i onAuthStateChange()
     */
    const handleSession = async (session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
            setLoading(true)
            await checkAdminRole(session.user.id)
        } else {
            setIsAdmin(false)
            setLoading(false)
        }
    }

    const checkAdminRole = async (userId: string) => {
        try {
            const role = await authService.checkUserRole(userId)
            setIsAdmin(role === 'admin')
        } catch (e) {
            console.error("Error checking role", e)
        } finally {
            setLoading(false)
        }
    }

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
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session)
        })

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
            handleSession(session)
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // handleSession is stable, no need to include

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
                <div className="flex h-screen w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
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

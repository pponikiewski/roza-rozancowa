import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { supabase } from "@/lib/supabase"
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

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) checkAdminRole(session.user.id)
            else setLoading(false)
        })

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) checkAdminRole(session.user.id)
            else {
                setIsAdmin(false)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const checkAdminRole = async (userId: string) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            setIsAdmin(profile?.role === 'admin')
        } catch (e) {
            console.error("Error checking role", e)
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setIsAdmin(false)
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

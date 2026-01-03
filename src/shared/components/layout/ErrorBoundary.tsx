import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <div className="max-w-md w-full border rounded-xl p-8 bg-card shadow-lg text-center space-y-4">
                        <div className="mx-auto bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-fit">
                            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-2">Coś poszło nie tak</h1>
                            <p className="text-muted-foreground text-sm">
                                Wystąpił nieoczekiwany błąd aplikacji. Spróbuj odświeżyć stronę.
                            </p>
                        </div>
                        {this.state.error && (
                            <div className="p-3 bg-muted/50 rounded-md text-left overflow-auto max-h-32 text-xs font-mono text-muted-foreground break-all">
                                {this.state.error.message}
                            </div>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full gap-2"
                        >
                            <RefreshCw className="h-4 w-4" /> Odśwież aplikację
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

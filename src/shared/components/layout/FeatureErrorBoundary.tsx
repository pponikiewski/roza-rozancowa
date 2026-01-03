import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface FeatureErrorBoundaryProps {
  children: ReactNode
  /** Nazwa feature'a do wyświetlenia w komunikacie błędu */
  featureName?: string
  /** Własny komponent fallback */
  fallback?: ReactNode
  /** Callback wywoływany przy błędzie */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Granularny Error Boundary dla poszczególnych feature'ów
 * Pozwala na izolację błędów bez crashowania całej aplikacji
 * 
 * @example
 * <FeatureErrorBoundary featureName="Panel użytkowników">
 *   <AdminMembersPage />
 * </FeatureErrorBoundary>
 */
export class FeatureErrorBoundary extends Component<FeatureErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[FeatureErrorBoundary] Error in ${this.props.featureName || 'feature'}:`, error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center p-8 min-h-[300px]">
          <div className="max-w-sm w-full border rounded-xl p-6 bg-card shadow-sm text-center space-y-4">
            <div className="mx-auto bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full w-fit">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-1">
                Wystąpił błąd
              </h2>
              <p className="text-muted-foreground text-sm">
                {this.props.featureName 
                  ? `Nie udało się załadować: ${this.props.featureName}`
                  : "Nie udało się załadować tej sekcji"
                }
              </p>
            </div>
            {this.state.error && (
              <div className="p-2 bg-muted/50 rounded-md text-left overflow-auto max-h-20 text-xs font-mono text-muted-foreground break-all">
                {this.state.error.message}
              </div>
            )}
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Spróbuj ponownie
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

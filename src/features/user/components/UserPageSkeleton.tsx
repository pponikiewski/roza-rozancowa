import { Skeleton } from "@/shared/components/ui/skeleton"

/**
 * Zarys strony użytkownika na czas wczytywania danych:
 * header, sekcja intencji i sekcja tajemnicy w tych samych wymiarach co docelowe
 */
export function UserPageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col" aria-busy="true">
      <span className="sr-only">Ładowanie...</span>

      <div className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto px-5 py-2 md:px-8 md:py-4 flex flex-col divide-y">
        <div className="py-6 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="py-6">
          <Skeleton className="w-full aspect-[3/4] max-h-[50vh] rounded-lg" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </main>
    </div>
  )
}

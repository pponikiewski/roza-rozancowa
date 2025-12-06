import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ustawienia</h1>
      <Card>
        <CardHeader><CardTitle>Konfiguracja Aplikacji</CardTitle></CardHeader>
        <CardContent>
          Tu w przyszłości będą ustawienia np. zarządzanie grupami albo ręczna zmiana tajemnic.
        </CardContent>
      </Card>
    </div>
  )
}
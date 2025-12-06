import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

function App() {
  const [message, setMessage] = useState('Łączenie z bazą...')

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('groups').select('name').limit(1).single()
      if (error) setMessage('Błąd: ' + error.message)
      else if (data) setMessage(data.name)
    }
    fetchData()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Dodajemy pasek nawigacyjny z przyciskiem zmiany motywu */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-6 p-4 transition-colors duration-300">
        <h1 className="text-4xl font-bold text-primary">Róża Różańcowa</h1>
        
        <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground max-w-md w-full text-center">
          <p className="text-lg mb-4">Status bazy: <span className="font-semibold">{message}</span></p>
          
          <div className="flex justify-center gap-4">
            <Button onClick={() => alert("Działa!")}>
              Akcja
            </Button>
            <Button variant="secondary">
              Szczegóły
            </Button>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
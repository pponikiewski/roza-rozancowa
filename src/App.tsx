import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Button } from "@/components/ui/button" // Zwróć uwagę na import z @

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-6 p-4">
      <h1 className="text-4xl font-bold text-rose-600">Róża Różańcowa</h1>
      
      <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
        <p className="text-lg mb-4">Status bazy: <span className="font-semibold">{message}</span></p>
        
        <Button onClick={() => alert("UI działa!")}>
          Testowy Przycisk
        </Button>
      </div>
    </div>
  )
}

export default App
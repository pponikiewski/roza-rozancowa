import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [message, setMessage] = useState('Łączenie z bazą...')

  useEffect(() => {
    const fetchData = async () => {
      // Pobieramy pierwszą grupę z bazy
      const { data, error } = await supabase
        .from('groups')
        .select('name')
        .limit(1)
        .single()

      if (error) {
        console.error(error)
        setMessage('Błąd połączenia: ' + error.message)
      } else if (data) {
        setMessage('Baza działa: ' + data.name)
      }
    }

    fetchData()
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '2rem' }}>Róża</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>{message}</p>
    </div>
  )
}

export default App
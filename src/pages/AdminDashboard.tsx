import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Group {
  id: number
  name: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  
  // Stan formularza
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    groupId: ""
  })

  // 1. Sprawdź uprawnienia i pobierz grupy
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login")
        return
      }

      // Pobierz grupy do listy rozwijanej
      const { data: groupsData } = await supabase.from('groups').select('*')
      if (groupsData) setGroups(groupsData)
    }
    init()
  }, [navigate])

  // 2. Obsługa tworzenia użytkownika
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Wywołanie naszej Edge Function
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          groupId: formData.groupId ? parseInt(formData.groupId) : null
        }
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      alert("Użytkownik utworzony pomyślnie!")
      // Wyczyść formularz
      setFormData({ email: "", password: "", fullName: "", groupId: "" })

    } catch (err: any) {
      alert("Błąd: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel Administratora</h1>
        <Button variant="outline" onClick={async () => {
           await supabase.auth.signOut()
           navigate("/login")
        }}>
          Wyloguj
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dodaj nowego członka</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            
            <div className="space-y-2">
              <Label>Imię i Nazwisko</Label>
              <Input 
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="np. Anna Nowak"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="anna@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Hasło (tymczasowe)</Label>
                <Input 
                  type="text" required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Min. 6 znaków"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Przypisz do Róży (Grupy)</Label>
              {/* Prosty select stylizowany na shadcn */}
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.groupId}
                onChange={e => setFormData({...formData, groupId: e.target.value})}
              >
                <option value="">-- Wybierz grupę --</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Tworzenie..." : "Stwórz konto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
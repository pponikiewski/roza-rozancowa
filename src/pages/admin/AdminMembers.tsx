import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle } from "lucide-react"

// Typy
interface Group { id: number; name: string }
interface Member {
  id: string; full_name: string; role: string; groups: { name: string } | null;
  acknowledgments: { created_at: string; mystery_id: number }[]
}

export default function AdminMembers() {
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "", groupId: "" })

  useEffect(() => {
    const init = async () => {
      const { data: groupsData } = await supabase.from('groups').select('*')
      if (groupsData) setGroups(groupsData)
      fetchMembers()
    }
    init()
  }, [])

  const fetchMembers = async () => {
    const currentMysteryId = 1 
    const { data: allMembers, error } = await supabase
      .from('profiles')
      .select(`id, full_name, role, groups(name), acknowledgments(created_at, mystery_id)`)
    
    if (error) return console.error(error)

    if (allMembers) {
      const processed = allMembers.map((m: any) => ({
        ...m,
        acknowledgments: m.acknowledgments.filter((a: any) => a.mystery_id === currentMysteryId)
      })) as Member[]
      
      processed.sort((a, b) => {
         const aAck = a.acknowledgments.length > 0
         const bAck = b.acknowledgments.length > 0
         if (aAck === bAck) return 0
         return aAck ? -1 : 1
      })
      setMembers(processed)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
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
      alert("Użytkownik utworzony!")
      setFormData({ email: "", password: "", fullName: "", groupId: "" })
      fetchMembers()
    } catch (err: any) {
      alert("Błąd: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Użytkownicy</h1>
        <p className="text-muted-foreground">Zarządzaj członkami Róż.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEWA STRONA (SZEROKA): TABELA */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Modlitwy (Tajemnica #1)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Członek</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const hasAck = member.acknowledgments.length > 0
                  const ackDate = hasAck ? new Date(member.acknowledgments[0].created_at).toLocaleString('pl-PL', { 
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                  }) : null

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="font-medium">{member.full_name}</div>
                        <div className="text-xs text-muted-foreground">{member.groups?.name || "-"}</div>
                      </TableCell>
                      <TableCell>
                        {hasAck ? (
                          <div className="flex flex-col text-green-600">
                             <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Tak</div>
                             <span className="text-[10px] text-muted-foreground">{ackDate}</span>
                          </div>
                        ) : (
                           <div className="flex items-center gap-1 text-red-500 opacity-50"><XCircle className="w-4 h-4" /> Nie</div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* PRAWA STRONA (WĄSKA): DODAWANIE */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader><CardTitle>Dodaj nowego</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2"><Label>Imię</Label><Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Hasło</Label><Input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
              <div className="space-y-2"><Label>Grupa</Label>
                <select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})}>
                  <option value="">-- Wybierz --</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "..." : "Dodaj"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, MoreHorizontal, Trash2, Save, User, Calendar, Shield } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// --- TYPY ---
interface Group { id: number; name: string }
interface Member {
  id: string; full_name: string; role: string; groups: { id: number, name: string } | null; email?: string; created_at: string;
  acknowledgments: { created_at: string; mystery_id: number }[]
}

export default function AdminMembers() {
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")

  // Stan Dialogu (Dodawanie)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "", groupId: "" })

  // Stan Sheeta (Edycja)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [editGroupId, setEditGroupId] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: g } = await supabase.from('groups').select('*'); if(g) setGroups(g)
    
    // Pobieramy userów (musimy pobrać też email z auth.users, ale Supabase API publiczne tego nie zwraca wprost w joinie, 
    // więc emaila tu nie wyświetlimy łatwo bez funkcji admina, ale to nie szkodzi na ten moment)
    const currentMysteryId = 1
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, groups(id, name), acknowledgments(created_at, mystery_id)`)
      .order('created_at', { ascending: false })

    if (data) {
      const processed = data.map((m: any) => ({
        ...m,
        acknowledgments: m.acknowledgments.filter((a: any) => a.mystery_id === currentMysteryId)
      }))
      setMembers(processed)
    }
  }

  // --- LOGIKA DODAWANIA ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...formData, groupId: formData.groupId ? parseInt(formData.groupId) : null }
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      
      alert("Dodano użytkownika!")
      setIsAddOpen(false)
      setFormData({ email: "", password: "", fullName: "", groupId: "" })
      fetchData()
    } catch (err: any) { alert("Błąd: " + err.message) } finally { setLoading(false) }
  }

  // --- LOGIKA EDYCJI (ZMIANA GRUPY) ---
  const handleUpdateGroup = async () => {
    if (!selectedMember) return
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ group_id: parseInt(editGroupId) }).eq('id', selectedMember.id)
    
    setLoading(false)
    if (error) alert("Błąd: " + error.message)
    else {
      alert("Grupa zmieniona")
      fetchData()
      setSelectedMember(null) // Zamykamy sheet
    }
  }

  // --- LOGIKA USUWANIA ---
  const handleDeleteUser = async () => {
    if (!selectedMember || !confirm("Czy na pewno chcesz usunąć tego użytkownika? To nieodwracalne.")) return
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', { body: { user_id: selectedMember.id } })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      
      alert("Użytkownik usunięty")
      setSelectedMember(null)
      fetchData()
    } catch (err: any) { alert("Błąd: " + err.message) } finally { setLoading(false) }
  }

  // Filtrowanie listy
  const filteredMembers = members.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* --- NAGŁÓWEK --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pr-16">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Użytkownicy</h1>
          <p className="text-muted-foreground">Baza wszystkich członków Żywego Różańca.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Dodaj nowego
        </Button>
      </div>

      {/* --- FILTRY I WYSZUKIWANIE --- */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Szukaj po nazwisku..." 
            className="pl-9" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABELA --- */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Członek</TableHead>
              <TableHead>Róża (Grupa)</TableHead>
              <TableHead>Status (Tajemnica #1)</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => {
              const hasAck = member.acknowledgments.length > 0
              return (
                <TableRow 
                  key={member.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedMember(member)
                    setEditGroupId(member.groups?.id.toString() || "")
                  }}
                >
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{member.full_name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.full_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {member.role === 'admin' && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Admin</Badge>}
                        <span>Dołączył: {new Date(member.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.groups ? <Badge variant="secondary">{member.groups.name}</Badge> : <span className="text-muted-foreground text-sm">-</span>}
                  </TableCell>
                  <TableCell>
                    {hasAck ? <Badge className="bg-green-600 hover:bg-green-700">Odhaczone</Badge> : <Badge variant="outline" className="text-muted-foreground">Oczekuje</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* --- MODAL DODAWANIA (DIALOG) --- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nowego członka</DialogTitle>
            <DialogDescription>Utwórz konto i przypisz do grupy.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-2"><Label>Imię i Nazwisko</Label><Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Hasło</Label><Input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Grupa</Label>
              <select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})}>
                <option value="">-- Wybierz --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "..." : "Utwórz konto"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- PANEL BOCZNY SZCZEGÓŁÓW (SHEET) --- */}
      <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Szczegóły użytkownika</SheetTitle>
            <SheetDescription>Edytuj dane lub usuń konto.</SheetDescription>
          </SheetHeader>
          
          {selectedMember && (
            <div className="space-y-6 py-6">
              {/* Info Karta */}
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                <Avatar className="h-12 w-12">
                   <AvatarFallback className="text-lg">{selectedMember.full_name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{selectedMember.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Calendar className="h-4 w-4" /> Utworzono: {new Date(selectedMember.created_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Shield className="h-4 w-4" /> ID: <span className="font-mono text-xs">{selectedMember.id.substring(0,8)}...</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Zmień Grupę</Label>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={editGroupId}
                    onChange={(e) => setEditGroupId(e.target.value)}
                  >
                    <option value="">-- Brak grupy --</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <Button size="icon" onClick={handleUpdateGroup} disabled={loading}><Save className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="mt-8">
             <Button variant="destructive" className="w-full gap-2" onClick={handleDeleteUser} disabled={loading}>
               <Trash2 className="h-4 w-4" /> Usuń trwale użytkownika
             </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
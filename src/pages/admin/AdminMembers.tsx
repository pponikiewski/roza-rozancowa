import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, MoreHorizontal, Trash2, Save, Calendar, Shield } from "lucide-react"

// --- TYPY DANYCH ---
interface Group { id: number; name: string }

interface Member {
  id: string
  full_name: string
  role: string
  rose_pos: number | null
  created_at: string
  groups: { id: number, name: string } | null
  acknowledgments: { created_at: string; mystery_id: number }[]
  // Pole obliczane na froncie:
  current_mystery_id: number | null
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

  // --- INICJALIZACJA ---
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // 1. Pobierz Grupy
    const { data: g } = await supabase.from('groups').select('*'); 
    if(g) setGroups(g)
    
    // 2. Pobierz Członków (wraz z pozycją, grupą i potwierdzeniami)
    const { data: allMembers, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, role, rose_pos, created_at,
        groups(id, name), 
        acknowledgments(created_at, mystery_id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error); return;
    }

    if (allMembers) {
      // 3. Przetwarzanie danych (Obliczanie tajemnicy dla każdego usera)
      const processed = await Promise.all(allMembers.map(async (m: any) => {
        // Domyślnie null (zakładamy że nie ma tajemnicy)
        let currentMysteryId: number | null = null
        
        // Wywołujemy funkcję SQL (logika Żywego Różańca - indywidualna dla usera)
        const { data: calcId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: m.id })
        
        // Jeśli funkcja zwróciła ID (czyli user jest w róży), przypisujemy je
        if (calcId) currentMysteryId = calcId

        // Filtrujemy potwierdzenia tylko dla TEJ tajemnicy (jeśli user ją posiada)
        const relevantAcks = currentMysteryId 
            ? m.acknowledgments.filter((a: any) => a.mystery_id === currentMysteryId)
            : []
        
        return {
          ...m,
          current_mystery_id: currentMysteryId,
          acknowledgments: relevantAcks
        }
      })) as Member[]
      
      // Sortowanie: Najpierw ci co zrobili (zieloni), potem reszta
      processed.sort((a, b) => {
         const aAck = a.acknowledgments.length > 0
         const bAck = b.acknowledgments.length > 0
         if (aAck === bAck) return 0
         return aAck ? -1 : 1
      })

      setMembers(processed)
    }
  }

  // --- DODAWANIE UŻYTKOWNIKA ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Wywołanie Edge Function (ona dba o to, by nie przekroczyć 20 osób w róży)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...formData, groupId: formData.groupId ? parseInt(formData.groupId) : null }
      })
      
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      
      alert(`Dodano użytkownika! Przypisana pozycja w róży: ${data.position ? "#"+data.position : "Brak"}`)
      setIsAddOpen(false)
      setFormData({ email: "", password: "", fullName: "", groupId: "" })
      fetchData()
    } catch (err: any) { 
      alert("Błąd: " + err.message) 
    } finally { 
      setLoading(false) 
    }
  }

  // --- ZMIANA GRUPY (OPTIMIZED RPC) ---
  const handleUpdateGroup = async () => {
    if (!selectedMember) return
    setLoading(true)

    try {
      // Parsujemy ID grupy (lub null jeśli wybrano "Brak grupy")
      const targetGroupId = editGroupId ? parseInt(editGroupId) : null

      // Wywołujemy funkcję SQL 'move_user_to_group', która:
      // 1. Znajduje wolne miejsce
      // 2. Przenosi usera
      // 3. Czyści stare potwierdzenia
      const { data: newPos, error } = await supabase.rpc('move_user_to_group', {
        p_user_id: selectedMember.id,
        p_group_id: targetGroupId
      })

      if (error) throw error

      alert(targetGroupId 
        ? `Zaktualizowano! Nowa pozycja w róży: #${newPos}`
        : "Usunięto z grupy (status zresetowany)."
      )
      
      fetchData()
      setSelectedMember(null)

    } catch (err: any) {
      alert("Błąd: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- USUWANIE UŻYTKOWNIKA ---
  const handleDeleteUser = async () => {
    if (!selectedMember || !confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return
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
      {/* NAGŁÓWEK (RESPONSYWNY) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pr-0 sm:pr-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Użytkownicy</h1>
          <p className="text-sm text-muted-foreground">Baza wszystkich członków Żywego Różańca.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Dodaj nowego
        </Button>
      </div>

      {/* WYSZUKIWARKA */}
      <div className="flex items-center gap-2 w-full sm:max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Szukaj po nazwisku..." 
            className="pl-9 w-full" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA (RESPONSYWNA Z SCROLLEM) */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]"> {/* Minimalna szerokość zapobiega zgniataniu kolumn */}
            <TableHeader>
              <TableRow>
                <TableHead>Członek</TableHead>
                <TableHead>Róża (Grupa)</TableHead>
                <TableHead>Tajemnica i Status</TableHead>
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
                        <div className="font-medium text-sm sm:text-base">{member.full_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {member.role === 'admin' && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Admin</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.groups ? (
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="secondary" className="whitespace-nowrap">{member.groups.name}</Badge>
                          <span className="text-[10px] text-muted-foreground ml-1">
                             Pozycja: {member.rose_pos ? <b>#{member.rose_pos}</b> : "Brak"}
                          </span>
                        </div>
                      ) : <span className="text-muted-foreground text-sm">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {member.current_mystery_id ? (
                          <>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Tajemnica #{member.current_mystery_id}</span>
                            {hasAck ? (
                              /* POPRAWIONY BADGE: Zielony, bez efektu hover zmieniającego kolor */
                              <Badge className="bg-green-600 hover:bg-green-700 text-white cursor-default w-fit whitespace-nowrap">
                                Zrobione
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="w-fit text-muted-foreground whitespace-nowrap">
                                Oczekuje
                              </Badge>
                            )}
                          </>
                        ) : (
                          /* JEŚLI BRAK GRUPY/TAJEMNICY */
                          <span className="text-xs text-muted-foreground italic whitespace-nowrap">Brak przydziału</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    
      {/* DIALOG DODAWANIA */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nowego członka</DialogTitle>
            <DialogDescription>System automatycznie przypisze pierwsze wolne miejsce w Róży (1-20).</DialogDescription>
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

      {/* SHEET SZCZEGÓŁÓW (EDYCJA - RESPONSYWNY) */}
      <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent className="w-[90%] sm:w-[540px]"> {/* ZMIANA: Na mobile zajmuje 90% */}
           <SheetHeader>
            <SheetTitle>Szczegóły użytkownika</SheetTitle>
            <SheetDescription>Edytuj dane lub usuń konto.</SheetDescription>
          </SheetHeader>
          
          {selectedMember && (
            <div className="space-y-6 py-6">
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
                   <Calendar className="h-4 w-4" /> Dołączył: {new Date(selectedMember.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Shield className="h-4 w-4" /> Miejsce w róży: 
                   <Badge variant="outline">{selectedMember.rose_pos ? `#${selectedMember.rose_pos}` : "Brak"}</Badge>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Zmień Grupę (Resetuje status!)</Label>
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
                <p className="text-xs text-muted-foreground mt-1">
                  System automatycznie znajdzie pierwsze wolne miejsce (1-20) w nowej grupie. Stare potwierdzenia zostaną usunięte.
                </p>
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
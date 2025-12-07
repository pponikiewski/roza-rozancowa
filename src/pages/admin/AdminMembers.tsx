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
// UWAGA: Upewnij się, że wykonałeś: npx shadcn@latest add alert
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, Search, MoreHorizontal, Trash2, AlertTriangle, Users, RefreshCcw, ScrollText, Shield } from "lucide-react"

// --- TYPY DANYCH ---
interface Group { id: number; name: string }
interface Mystery { id: number; name: string }

interface Member {
  id: string
  full_name: string
  role: string
  rose_pos: number | null
  created_at: string
  groups: { id: number, name: string } | null
  acknowledgments: { created_at: string; mystery_id: number }[]
  current_mystery_id: number | null
}

export default function AdminMembers() {
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [mysteries, setMysteries] = useState<Mystery[]>([])
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
    // 1. Grupy
    const { data: g } = await supabase.from('groups').select('*'); 
    if(g) setGroups(g)

    // 2. Tajemnice (do nazw)
    const { data: m } = await supabase.from('mysteries').select('id, name');
    if(m) setMysteries(m)
    
    // 3. Członkowie
    const { data: allMembers, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, role, rose_pos, created_at,
        groups(id, name), 
        acknowledgments(created_at, mystery_id)
      `)
      .order('created_at', { ascending: false })

    if (error) { console.error(error); return; }

    if (allMembers) {
      const processed = await Promise.all(allMembers.map(async (m: any) => {
        let currentMysteryId: number | null = null
        const { data: calcId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: m.id })
        if (calcId) currentMysteryId = calcId

        const relevantAcks = currentMysteryId 
            ? m.acknowledgments.filter((a: any) => a.mystery_id === currentMysteryId)
            : []
        
        return { ...m, current_mystery_id: currentMysteryId, acknowledgments: relevantAcks }
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

  const getMysteryName = (id: number | null) => {
    if (!id) return "Brak przydziału"
    const found = mysteries.find(m => m.id === id)
    return found ? found.name : `Tajemnica #${id}`
  }

  // --- LOGIKA ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...formData, groupId: formData.groupId ? parseInt(formData.groupId) : null }
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      
      alert(`Dodano użytkownika!`)
      setIsAddOpen(false)
      setFormData({ email: "", password: "", fullName: "", groupId: "" })
      fetchData()
    } catch (err: any) { alert("Błąd: " + err.message) } finally { setLoading(false) }
  }

  const handleUpdateGroup = async () => {
    if (!selectedMember) return
    setLoading(true)
    try {
      const targetGroupId = editGroupId ? parseInt(editGroupId) : null
      const { data: newPos, error } = await supabase.rpc('move_user_to_group', {
        p_user_id: selectedMember.id,
        p_group_id: targetGroupId
      })
      if (error) throw error
      alert(targetGroupId ? `Zaktualizowano! Nowa pozycja: #${newPos}` : "Usunięto z grupy.")
      fetchData()
      setSelectedMember(null)
    } catch (err: any) { alert("Błąd: " + err.message) } finally { setLoading(false) }
  }

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

  const filteredMembers = members.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pr-0 sm:pr-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Użytkownicy</h1>
          <p className="text-sm text-muted-foreground">Baza wszystkich członków Żywego Różańca.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Dodaj nowego
        </Button>
      </div>

      {/* FILTRY */}
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

      {/* TABELA */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
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
                    <TableCell>
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
                        </div>
                      ) : <span className="text-muted-foreground text-sm">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {member.current_mystery_id ? (
                          <>
                            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                              {getMysteryName(member.current_mystery_id)}
                            </span>
                            {hasAck ? (
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

      {/* SHEET SZCZEGÓŁÓW */}
      <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent className="w-[90%] sm:w-[540px] flex flex-col h-full"> 
           <SheetHeader className="mb-4">
            <SheetTitle>Profil Użytkownika</SheetTitle>
            <SheetDescription>Zarządzaj danymi i przypisaniem do Róży.</SheetDescription>
          </SheetHeader>
          
          {selectedMember && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* WIZYTÓWKA */}
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 border-2 border-dashed rounded-xl gap-3">
                <div className="text-center">
                  <h3 className="font-bold text-2xl">{selectedMember.full_name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                     <Badge variant="outline" className="capitalize">{selectedMember.role}</Badge>
                  </div>
                </div>
              </div>

              {/* INFO SIATKA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-card space-y-1">
                   <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                      <Shield className="h-3 w-3" /> Pozycja
                   </div>
                   <div className="font-medium text-sm">
                      {selectedMember.rose_pos ? `#${selectedMember.rose_pos} w Róży` : "Brak miejsca"}
                   </div>
                </div>
                <div className="p-4 border rounded-lg bg-card space-y-1">
                   <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                      <ScrollText className="h-3 w-3" /> Tajemnica
                   </div>
                   <div className="font-medium text-sm text-primary">
                      {getMysteryName(selectedMember.current_mystery_id)}
                   </div>
                </div>
              </div>

              {/* ZARZĄDZANIE */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                   <Users className="h-5 w-5 text-primary" />
                   <h4 className="font-semibold">Zarządzanie Różą</h4>
                </div>
                
                <div className="space-y-3">
                   <Label className="text-xs text-muted-foreground">PRZYPISZ DO GRUPY</Label>
                   <div className="flex gap-2">
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={editGroupId}
                        onChange={(e) => setEditGroupId(e.target.value)}
                      >
                        <option value="">-- Brak grupy (Usuń z Róży) --</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                   </div>
                   
                   <Alert variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Uwaga!</AlertTitle>
                      <AlertDescription className="text-xs">
                        Zmiana grupy spowoduje reset potwierdzeń. System automatycznie znajdzie nowe wolne miejsce.
                      </AlertDescription>
                   </Alert>

                   <Button className="w-full gap-2" onClick={handleUpdateGroup} disabled={loading}>
                      <RefreshCcw className="h-4 w-4" /> 
                      {editGroupId ? "Zapisz i Przenieś" : "Zapisz i Usuń z grupy"}
                   </Button>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="mt-auto pt-6 border-t">
             <div className="w-full space-y-2">
               <Label className="text-xs text-muted-foreground uppercase font-bold">Strefa niebezpieczna</Label>
               <Button variant="destructive" className="w-full gap-2" onClick={handleDeleteUser} disabled={loading}>
                 <Trash2 className="h-4 w-4" /> Usuń trwale konto
               </Button>
             </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
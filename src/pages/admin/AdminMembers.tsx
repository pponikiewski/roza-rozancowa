import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Plus, Search, Trash2, Users, RefreshCcw, ScrollText, 
  Shield, User, CheckCircle2, Circle, AlertCircle, CalendarClock, ArrowRightLeft 
} from "lucide-react"

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

  // Dialogi
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "", groupId: "" })
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [editGroupId, setEditGroupId] = useState<string>("")

  // --- INICJALIZACJA ---
  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: g } = await supabase.from('groups').select('*').order('id'); if(g) setGroups(g)
    const { data: m } = await supabase.from('mysteries').select('id, name'); if(m) setMysteries(m)
    
    const { data: allMembers, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, role, rose_pos, created_at,
        groups(id, name), acknowledgments(created_at, mystery_id)
      `)
      .order('rose_pos', { ascending: true })

    if (error) { console.error(error); return; }

    if (allMembers) {
      const processed = await Promise.all(allMembers.map(async (m: any) => {
        let currentMysteryId: number | null = null
        const { data: calcId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: m.id })
        if (calcId) currentMysteryId = calcId

        const relevantAcks = currentMysteryId 
            ? m.acknowledgments.filter((a: any) => Number(a.mystery_id) === Number(currentMysteryId))
            : []
        
        return { ...m, current_mystery_id: currentMysteryId, acknowledgments: relevantAcks }
      })) as Member[]
      
      setMembers(processed)
    }
  }

  const getMysteryName = (id: number | null) => {
    if (!id) return "Brak przydziału"
    const found = mysteries.find(m => m.id === id)
    return found ? found.name : `Tajemnica #${id}`
  }

  // FORMATOWANIE DATY (Pełna data i godzina)
  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // --- HANDLERY ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...formData, groupId: formData.groupId ? parseInt(formData.groupId) : null }
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)
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
      const { error } = await supabase.rpc('move_user_to_group', {
        p_user_id: selectedMember.id,
        p_group_id: targetGroupId
      })
      if (error) throw error
      alert("Zaktualizowano pomyślnie.")
      fetchData()
      setSelectedMember(null)
    } catch (err: any) { alert("Błąd: " + err.message) } finally { setLoading(false) }
  }

  const handleDeleteUser = async () => {
    if (!selectedMember || !confirm("Usunąć trwale?")) return
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', { body: { user_id: selectedMember.id } })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      alert("Usunięto")
      setSelectedMember(null)
      fetchData()
    } catch (err: any) { alert("Błąd: " + err.message) } finally { setLoading(false) }
  }

  // --- GRUPOWANIE ---
  const filteredAllMembers = members.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()))

  const groupedData = useMemo(() => {
    const map = new Map<number, Member[]>()
    const unassigned: Member[] = []

    filteredAllMembers.forEach(m => {
      if (m.groups?.id) {
        if (!map.has(m.groups.id)) map.set(m.groups.id, [])
        map.get(m.groups.id)!.push(m)
      } else {
        unassigned.push(m)
      }
    })
    return { map, unassigned }
  }, [filteredAllMembers])


  // --- KOMPONENT LISTY ---
  const MembersList = ({ list }: { list: Member[] }) => {
    if (list.length === 0) return <div className="p-4 text-center text-sm text-muted-foreground">Brak członków w tej grupie.</div>

    return (
      <div className="w-full">
        {/* MOBILE */}
        <div className="grid grid-cols-1 gap-2 sm:hidden">
          {list.map(member => {
             const hasAck = member.acknowledgments.length > 0
             return (
              <div 
                key={member.id} 
                onClick={() => { setSelectedMember(member); setEditGroupId(member.groups?.id.toString() || "") }}
                className="flex items-center justify-between p-3 bg-card border rounded-md active:bg-muted cursor-pointer"
              >
                <div className="flex items-center gap-3">
                   {member.rose_pos ? (
                     <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full border-primary/20 bg-primary/5 text-primary">{member.rose_pos}</Badge>
                   ) : <div className="h-6 w-6" />}
                   <div>
                     <div className="font-medium text-sm">{member.full_name}</div>
                     <div className="text-xs text-muted-foreground line-clamp-1">{getMysteryName(member.current_mystery_id)}</div>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  {hasAck ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : <Circle className="h-5 w-5 text-slate-300" />}
                </div>
              </div>
             )
          })}
        </div>

        {/* DESKTOP */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[10%]">Poz.</TableHead>
                <TableHead className="w-[35%]">Członek</TableHead>
                <TableHead className="w-[40%]">Tajemnica</TableHead>
                <TableHead className="w-[15%] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map(member => {
                const hasAck = member.acknowledgments.length > 0
                return (
                  <TableRow 
                    key={member.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => { setSelectedMember(member); setEditGroupId(member.groups?.id.toString() || "") }}
                  >
                    <TableCell>
                      {member.rose_pos ? <Badge variant="outline">#{member.rose_pos}</Badge> : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{member.full_name}</span>
                      {member.role === 'admin' && <Badge variant="secondary" className="ml-2 text-[10px]">Admin</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getMysteryName(member.current_mystery_id)}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasAck ? (
                        <Badge className="bg-green-600 hover:bg-green-700 cursor-default border-transparent text-white">Potwierdzone</Badge>
                      ) : <span className="text-xs text-muted-foreground">Oczekuje</span>}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pr-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Struktura Róż</h1>
          <p className="text-muted-foreground">Przeglądaj członków z podziałem na grupy.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Dodaj osobę
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Znajdź osobę..." className="pl-9 bg-card" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* LISTA (Accordion) */}
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={groups.length > 0 ? [`group-${groups[0].id}`] : []}>
        {groups.map(group => {
          const groupMembers = groupedData.map.get(group.id) || []
          const count = groupMembers.length
          const completed = groupMembers.filter(m => m.acknowledgments.length > 0).length
          const isFull = count >= 20

          return (
            <AccordionItem key={group.id} value={`group-${group.id}`} className="border rounded-lg bg-card px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">{group.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isFull ? "destructive" : "secondary"} className="text-xs">{count}/20</Badge>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" /> {completed}/{count}
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 border-t mt-2">
                <MembersList list={groupMembers} />
              </AccordionContent>
            </AccordionItem>
          )
        })}

        <AccordionItem value="unassigned" className="border rounded-lg bg-muted/30 border-dashed px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Nieprzypisani</span>
              <Badge variant="outline" className="ml-2">{groupedData.unassigned.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 border-t mt-2">
             <MembersList list={groupedData.unassigned} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* DIALOG DODAWANIA */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nowy członek</DialogTitle>
            <DialogDescription>System przydzieli wolne miejsce.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-2"><Label>Imię i Nazwisko</Label><Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Hasło</Label><Input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Grupa</Label>
              <select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})}>
                <option value="">-- Wybierz grupę --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>Utwórz</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG SZCZEGÓŁÓW (UI REDESIGN) --- */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
           
           <div className="p-6 pb-4 border-b bg-muted/20">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {selectedMember?.full_name}
                </DialogTitle>
                <DialogDescription>
                  {selectedMember?.role === 'admin' ? 'Administrator' : 'Użytkownik'} 
                  {selectedMember?.groups && ` • ${selectedMember.groups.name}`}
                </DialogDescription>
              </DialogHeader>
           </div>
          
          {selectedMember && (
            <div className="p-6 space-y-6">
              
              {/* 1. SEKCJA INFORMACYJNA (KAFELKI) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground uppercase">Pozycja</Label>
                   <div className="flex items-center gap-2 font-medium">
                      <Shield className="h-4 w-4 text-primary" />
                      {selectedMember.rose_pos ? `#${selectedMember.rose_pos}` : "Brak"}
                   </div>
                </div>
                <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground uppercase">Tajemnica</Label>
                   <div className="flex items-center gap-2 font-medium text-sm line-clamp-1" title={getMysteryName(selectedMember.current_mystery_id)}>
                      <ScrollText className="h-4 w-4 text-primary" />
                      {getMysteryName(selectedMember.current_mystery_id)}
                   </div>
                </div>
              </div>

              {/* 2. SEKCJA STATUSU (WYRÓŻNIONA) */}
              <div className={`rounded-lg border p-4 ${selectedMember.acknowledgments.length > 0 ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/30'}`}>
                 <div className="flex items-start gap-3">
                    {selectedMember.acknowledgments.length > 0 ? (
                       <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                    ) : (
                       <Circle className="h-6 w-6 text-slate-400 mt-0.5" />
                    )}
                    <div className="space-y-1">
                       <h4 className="font-semibold text-sm">Status Modlitwy</h4>
                       {selectedMember.acknowledgments.length > 0 ? (
                          <div className="text-sm text-muted-foreground flex flex-col">
                             <span className="text-green-700 dark:text-green-400 font-medium">Potwierdzone</span>
                             <span className="flex items-center gap-1.5 mt-1 text-xs">
                                <CalendarClock className="h-3 w-3" />
                                {formatFullDate(selectedMember.acknowledgments[0].created_at)}
                             </span>
                          </div>
                       ) : (
                          <p className="text-sm text-muted-foreground">Oczekuje na potwierdzenie.</p>
                       )}
                    </div>
                 </div>
              </div>

              {/* 3. SEKCJA ZMIANY GRUPY (PANEL AKCJI) */}
              <div className="space-y-3 pt-2">
                 <Label className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" /> Zarządzanie członkostwem
                 </Label>
                 <div className="p-4 border rounded-lg bg-card space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">PRZENIEŚ DO GRUPY</Label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={editGroupId}
                            onChange={(e) => setEditGroupId(e.target.value)}
                        >
                            <option value="">-- Wybierz nową grupę (lub usuń) --</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    
                    <Button className="w-full" onClick={handleUpdateGroup} disabled={loading} variant="secondary">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        {editGroupId ? "Zapisz i Przenieś" : "Zapisz i Usuń z grupy"}
                    </Button>
                    
                    <p className="text-[10px] text-muted-foreground text-center">
                        Uwaga: Zmiana grupy resetuje status modlitwy w bieżącym miesiącu.
                    </p>
                 </div>
              </div>

              {/* 4. FOOTER (USUWANIE) */}
              <div className="pt-2 flex justify-center">
                 <Button variant="link" className="text-red-500 hover:text-red-700 h-auto py-2 text-xs" onClick={handleDeleteUser} disabled={loading}>
                   <Trash2 className="h-3 w-3 mr-1.5" /> Usuń konto użytkownika trwale
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
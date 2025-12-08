import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  UserPlus, Search, Trash2, Users, RefreshCcw, ScrollText, 
  Shield, User, CheckCircle2, Circle, AlertCircle, CalendarClock, ArrowRightLeft, Mail, Lock, KeyRound 
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

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
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
      
      setIsAddOpen(false)
      setFormData({ email: "", password: "", fullName: "", groupId: "" })
      fetchData()
      alert(`Pomyślnie dodano użytkownika!`)
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
      fetchData()
      setSelectedMember(null)
    } catch (err: any) { alert("Błąd: " + err.message) } finally { setLoading(false) }
  }

  const handleDeleteUser = async () => {
    if (!selectedMember || !confirm("Czy na pewno chcesz trwale usunąć tego użytkownika? Tej operacji nie można cofnąć.")) return
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', { body: { user_id: selectedMember.id } })
      if (error || data?.error) throw new Error(error?.message || data?.error)
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
    if (list.length === 0) return <div className="p-8 text-center text-sm text-muted-foreground bg-muted/10 rounded-lg border border-dashed">Brak członków w tej grupie.</div>

    return (
      <div className="w-full">
        {/* MOBILE VIEW */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {list.map(member => {
             const hasAck = member.acknowledgments.length > 0
             return (
              <div 
                key={member.id} 
                onClick={() => { setSelectedMember(member); setEditGroupId(member.groups?.id.toString() || "") }}
                className="relative overflow-hidden flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                {/* Status Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasAck ? 'bg-green-500' : 'bg-muted'}`} />

                <div className="flex items-center gap-3 pl-2">
                   {member.rose_pos ? (
                     <div className="flex flex-col items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                        {member.rose_pos}
                     </div>
                   ) : <div className="h-8 w-8 flex items-center justify-center bg-muted text-muted-foreground rounded-full text-[10px]">-</div>}
                   
                   <div>
                     <div className="font-semibold text-sm">{member.full_name}</div>
                     <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <ScrollText className="h-3 w-3" />
                        {getMysteryName(member.current_mystery_id)}
                     </div>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  {hasAck ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : <Circle className="h-5 w-5 text-muted-foreground/30" />}
                </div>
              </div>
             )
          })}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden sm:block border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] text-center">Poz.</TableHead>
                <TableHead className="w-[30%]">Członek</TableHead>
                <TableHead className="w-[40%]">Aktualna Tajemnica</TableHead>
                <TableHead className="text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map(member => {
                const hasAck = member.acknowledgments.length > 0
                return (
                  <TableRow 
                    key={member.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => { setSelectedMember(member); setEditGroupId(member.groups?.id.toString() || "") }}
                  >
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {member.rose_pos || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          <span className="font-medium">{member.full_name}</span>
                          {member.role === 'admin' && <Badge variant="secondary" className="text-[10px] px-1 h-5">Admin</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getMysteryName(member.current_mystery_id)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {hasAck ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Potwierdzone
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Oczekuje</span>
                      )}
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
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      
      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Struktura Róż</h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Zarządzaj członkami, monitoruj postępy modlitwy i edytuj przypisania do grup różańcowych.
          </p>
        </div>
        
        {/* Przycisk DODAJ OSOBĘ (Lepszy UX) */}
        <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto shadow-md gap-2 font-semibold">
          <UserPlus className="h-4 w-4" />
          Dodaj Członka
        </Button>
      </div>

      {/* --- FILTRY I SZUKANIE --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Szukaj po imieniu lub nazwisku..." 
                className="pl-9 h-10 bg-background/50 border-input focus:bg-background transition-all" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
            />
        </div>
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Łącznie: {members.length} osób
        </div>
      </div>

      {/* --- LISTA GRUP (ACCORDION) --- */}
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={groups.length > 0 ? [`group-${groups[0].id}`] : []}>
        {groups.map(group => {
          const groupMembers = groupedData.map.get(group.id) || []
          const count = groupMembers.length
          const completed = groupMembers.filter(m => m.acknowledgments.length > 0).length
          const isFull = count >= 20

          return (
            <AccordionItem key={group.id} value={`group-${group.id}`} className="border rounded-xl bg-card px-1 overflow-hidden shadow-sm">
              <AccordionTrigger className="hover:no-underline px-4 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-4 text-left justify-between pr-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <span className="font-semibold text-lg block leading-none mb-1">{group.name}</span>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                             <span>Zajętość: {count}/20</span>
                             <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                             <span className={isFull ? "text-amber-600 font-medium" : "text-green-600 font-medium"}>
                                {isFull ? "Grupa Pełna" : "Miejsca dostępne"}
                             </span>
                        </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar Mini */}
                  <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border">
                    <div className="text-xs font-medium text-muted-foreground">Modlitwa:</div>
                    <div className="text-sm font-bold flex items-center gap-1">
                        <span className={completed === count && count > 0 ? "text-green-600" : ""}>{completed}</span>
                        <span className="text-muted-foreground/50">/</span>
                        <span>{count}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 border-t border-dashed">
                <MembersList list={groupMembers} />
              </AccordionContent>
            </AccordionItem>
          )
        })}

        {/* UNASSIGNED SECTION */}
        <AccordionItem value="unassigned" className="border rounded-xl bg-muted/20 border-dashed px-1">
          <AccordionTrigger className="hover:no-underline px-4 py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="bg-muted p-2 rounded-lg">
                 <AlertCircle className="h-5 w-5" />
              </div>
              <span className="font-semibold">Osoby nieprzypisane</span>
              <Badge variant="secondary" className="ml-2">{groupedData.unassigned.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 border-t border-dashed">
             <MembersList list={groupedData.unassigned} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* --- DIALOG DODAWANIA --- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj nowego członka</DialogTitle>
            <DialogDescription>
              Utwórz konto dla nowej osoby. Hasło będzie wymagane przy pierwszym logowaniu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="space-y-2">
                <Label>Imię i Nazwisko</Label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input required className="pl-9" placeholder="np. Jan Kowalski" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Adres Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="email" required className="pl-9" placeholder="email@domena.pl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hasło startowe</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input required className="pl-9" placeholder="min. 6 znaków" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Wybierz Grupę</Label>
              {/* STYLED SELECT TO MATCH SHADCN */}
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.groupId} 
                onChange={e => setFormData({...formData, groupId: e.target.value})}
              >
                <option value="">-- Bez grupy (nieprzypisany) --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Anuluj</Button>
              <Button type="submit" disabled={loading}>
                 {loading ? "Tworzenie..." : "Utwórz konto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG SZCZEGÓŁÓW I EDYCJI --- */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-0">
           
           <div className="p-6 pb-6 bg-gradient-to-b from-muted/50 to-background border-b">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span>{selectedMember?.full_name}</span>
                    <span className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                        {selectedMember?.role === 'admin' ? 'Administrator' : 'Użytkownik'} 
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {selectedMember?.groups ? selectedMember.groups.name : "Brak grupy"}
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>
           </div>
          
          {selectedMember && (
            <div className="p-6 space-y-6 bg-card">
              
              {/* INFO GRID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border">
                   <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pozycja w Róży</Label>
                   <div className="flex items-center gap-2 font-medium">
                      <Shield className="h-4 w-4 text-primary" />
                      {selectedMember.rose_pos ? `Miejsce #${selectedMember.rose_pos}` : "Nie dotyczy"}
                   </div>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border">
                   <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Aktualna Tajemnica</Label>
                   <div className="flex items-center gap-2 font-medium text-sm line-clamp-1">
                      <ScrollText className="h-4 w-4 text-primary" />
                      {getMysteryName(selectedMember.current_mystery_id).split(' ')[0]}...
                   </div>
                </div>
              </div>

              {/* STATUS CARD */}
              <div className={`rounded-xl border p-4 transition-colors ${selectedMember.acknowledgments.length > 0 ? 'bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-muted/10 border-border'}`}>
                 <div className="flex items-start gap-3">
                    {selectedMember.acknowledgments.length > 0 ? (
                       <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                       <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div className="space-y-1">
                       <h4 className="font-semibold text-sm">Status Modlitwy (Bieżący miesiąc)</h4>
                       {selectedMember.acknowledgments.length > 0 ? (
                          <div className="text-sm text-muted-foreground flex flex-col">
                             <span className="text-green-700 dark:text-green-400 font-medium text-xs uppercase tracking-wide">Potwierdzone</span>
                             <span className="flex items-center gap-1.5 mt-1 text-xs opacity-80">
                                <CalendarClock className="h-3 w-3" />
                                {formatFullDate(selectedMember.acknowledgments[0].created_at)}
                             </span>
                          </div>
                       ) : (
                          <p className="text-xs text-muted-foreground">Użytkownik nie potwierdził jeszcze modlitwy w tym miesiącu.</p>
                       )}
                    </div>
                 </div>
              </div>

              {/* MOVE ACTION */}
              <div className="space-y-3 pt-2">
                 <Label className="flex items-center gap-2 text-xs uppercase font-bold text-muted-foreground">
                    <ArrowRightLeft className="h-3 w-3" /> Zmień przypisanie
                 </Label>
                 <div className="flex gap-2">
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={editGroupId}
                        onChange={(e) => setEditGroupId(e.target.value)}
                    >
                        <option value="">-- Wybierz (lub usuń z grupy) --</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <Button onClick={handleUpdateGroup} disabled={loading}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                 </div>
                 <p className="text-[10px] text-muted-foreground ml-1">
                    * Zmiana grupy spowoduje wyczyszczenie statusu modlitwy.
                 </p>
              </div>

              {/* DANGER ZONE */}
              <div className="pt-4 mt-2 border-t flex justify-center">
                 <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs h-9" 
                    onClick={handleDeleteUser} 
                    disabled={loading}
                 >
                   <Trash2 className="h-3 w-3 mr-2" /> 
                   Trwale usuń konto użytkownika
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
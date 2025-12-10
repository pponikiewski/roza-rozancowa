import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { 
  UserPlus, Search, Trash2, Users, RefreshCcw, ScrollText, 
  User, CheckCircle2, Circle, AlertCircle, CalendarClock, ArrowRightLeft, Mail, Lock, Eye, EyeOff
} from "lucide-react"
import { toast } from "sonner"

// --- TYPY DANYCH ---
interface Group { id: number; name: string }
interface Mystery { id: number; name: string }

interface Member {
  id: string
  full_name: string
  email?: string
  role: string
  rose_pos: number | null
  created_at: string
  groups: { id: number, name: string } | null
  acknowledgments: { created_at: string; mystery_id: number }[]
  current_mystery_id: number | null
}

export default function AdminMembers() {
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [mysteries, setMysteries] = useState<Mystery[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")

  // Dialogi i Formularze
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "", groupId: "" })
  
  // Edycja Usera
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [editGroupId, setEditGroupId] = useState<string>("")
  
  // Zmiana hasła
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // --- INICJALIZACJA ---
  useEffect(() => { fetchData() }, [])

  // Resetowanie stanów przy zamknięciu dialogu
  useEffect(() => {
    if (!selectedMember) {
        setNewPassword("")
        setShowPassword(false)
        setEditGroupId("")
    }
  }, [selectedMember])

  const fetchData = async () => {
    const { data: g } = await supabase.from('groups').select('*').order('id'); if(g) setGroups(g)
    const { data: m } = await supabase.from('mysteries').select('id, name'); if(m) setMysteries(m)
    
    const { data: allMembers, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, role, rose_pos, created_at,
        groups(id, name), acknowledgments(created_at, mystery_id)
      `)
      .order('full_name', { ascending: true }) 

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
      toast.success("Sukces!", { description: `Dodano użytkownika: ${formData.fullName}` })
    } catch (err: any) { 
      console.error("Błąd dodawania użytkownika:", err)
      toast.error("Błąd tworzenia", { description: err.message || "Wystąpił nieznany błąd" })
    } finally { setLoading(false) }
  }

  const handleUpdateGroup = async () => {
    if (!selectedMember) return
    setActionLoading(true)
    try {
      const targetGroupId = editGroupId ? parseInt(editGroupId) : null
      const { error } = await supabase.rpc('move_user_to_group', {
        p_user_id: selectedMember.id,
        p_group_id: targetGroupId
      })
      if (error) throw error
      await fetchData()
      toast.success("Zaktualizowano", { description: "Przypisanie do grupy zostało zmienione." })
      setSelectedMember(null)
    } catch (err: any) { 
      toast.error("Błąd aktualizacji", { description: err.message })
    } finally { setActionLoading(false) }
  }

  const handlePasswordChange = async () => {
    if (!selectedMember || !newPassword) return
    if (newPassword.length < 6) { 
      toast.warning("Hasło za krótkie", { description: "Hasło musi mieć minimum 6 znaków." })
      return 
    }
    
    setActionLoading(true)
    try {
        const { data, error } = await supabase.functions.invoke('update-user-password', {
            body: { user_id: selectedMember.id, new_password: newPassword }
        })

        if (error || data?.error) throw new Error(error?.message || data?.error)
        
        toast.success("Hasło zmienione", { description: "Nowe hasło zostało ustawione pomyślnie." })
        setNewPassword("")
    } catch (err: any) {
        toast.error("Błąd zmiany hasła", { description: err.message })
    } finally {
        setActionLoading(false)
    }
  }

  // --- USUWANIE Z TOASTEM (Custom UI) ---
  const handleDeleteUser = () => {
    if (!selectedMember) return
    
    // 1. Zapisujemy referencję do użytkownika, bo zaraz zamkniemy modal
    const userToDelete = selectedMember
    
    // 2. Zamykamy modal natychmiast, aby odblokować interakcję z Toastem
    setSelectedMember(null)

    toast.custom((t) => (
      <div className="bg-background border border-border p-4 rounded-xl shadow-xl flex flex-col gap-3 w-full max-w-[340px]">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full shrink-0">
             <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
          </div>
          <div className="space-y-1">
             <h3 className="font-semibold text-sm leading-none pt-1">Usunąć użytkownika?</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Czy na pewno chcesz trwale usunąć konto <b>{userToDelete.full_name}</b>? Tej operacji nie można cofnąć.
             </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t)} className="h-8 text-xs">Anuluj</Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-8 text-xs shadow-sm"
            onClick={async () => {
               toast.dismiss(t)
               setActionLoading(true)
               try {
                 const { data, error } = await supabase.functions.invoke('delete-user', { body: { user_id: userToDelete.id } })
                 if (error || data?.error) throw new Error(error?.message || data?.error)
                 
                 toast.success("Użytkownik usunięty", { description: "Konto zostało trwale usunięte." })
                 // Modal już zamknięty, więc tylko odświeżamy listę
                 fetchData()
               } catch (err: any) { 
                 toast.error("Błąd usuwania", { description: err.message })
               } finally { 
                 setActionLoading(false) 
               }
            }}
          >
            Potwierdź usunięcie
          </Button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  // --- UI LISTY ---
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
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasAck ? 'bg-green-500' : 'bg-muted'}`} />
                <div className="flex items-center gap-3 pl-2">
                   <div>
                     <div className="font-semibold text-sm">{member.full_name}</div>
                     <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <ScrollText className="h-3 w-3" />
                        {getMysteryName(member.current_mystery_id)}
                     </div>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  {hasAck ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground/30" />}
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
                <TableHead className="pl-6 w-[40%]">Członek</TableHead>
                <TableHead className="w-[45%]">Tajemnica</TableHead>
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
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                          <span className="font-medium">{member.full_name}</span>
                          {member.role === 'admin' && <Badge variant="secondary" className="text-[10px] px-1 h-5">Admin</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{getMysteryName(member.current_mystery_id)}</TableCell>
                    <TableCell className="text-right pr-6">
                      {hasAck ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Potwierdzone
                        </div>
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

  // --- FILTROWANIE ---
  const filteredAllMembers = members.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()))
  const groupedData = useMemo(() => {
    const map = new Map<number, Member[]>()
    const unassigned: Member[] = []
    filteredAllMembers.forEach(m => {
      if (m.groups?.id) {
        if (!map.has(m.groups.id)) map.set(m.groups.id, [])
        map.get(m.groups.id)!.push(m)
      } else { 
        // Ukrywamy adminów z listy "Nieprzypisane", aby nie zaśmiecali widoku
        if (m.role !== 'admin') {
           unassigned.push(m) 
        }
      }
    })
    return { map, unassigned }
  }, [filteredAllMembers])


  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto p-6 pt-16">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Struktura Róż</h1>
          <p className="text-sm text-muted-foreground">Zarządzaj członkami, monitoruj modlitwę i edytuj dane.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto shadow-md gap-2 font-semibold">
          <UserPlus className="h-4 w-4" /> Dodaj Członka
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input placeholder="Szukaj..." className="pl-9 h-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* GROUPS ACCORDION */}
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={groups.length > 0 ? [`group-${groups[0].id}`] : []}>
        {groups.map(group => {
          const groupMembers = groupedData.map.get(group.id) || []
          const count = groupMembers.length
          const completed = groupMembers.filter(m => m.acknowledgments.length > 0).length

          return (
            <AccordionItem key={group.id} value={`group-${group.id}`} className="border rounded-xl bg-card px-1 overflow-hidden shadow-sm">
              <AccordionTrigger className="hover:no-underline px-4 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-4 text-left justify-between pr-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
                    <div>
                        <span className="font-semibold text-lg block leading-none mb-1">{group.name}</span>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                             <span>{count}/20 członków</span>
                        </div>
                    </div>
                  </div>
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
              <AccordionContent className="px-4 pb-4 pt-2 border-t border-dashed"><MembersList list={groupMembers} /></AccordionContent>
            </AccordionItem>
          )
        })}
        {/* UNASSIGNED */}
        <AccordionItem value="unassigned" className="border rounded-xl bg-muted/20 border-dashed px-1">
          <AccordionTrigger className="hover:no-underline px-4 py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="bg-muted p-2 rounded-lg"><AlertCircle className="h-5 w-5" /></div>
              <span className="font-semibold">Osoby nieprzypisane</span>
              <Badge variant="secondary" className="ml-2">{groupedData.unassigned.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 border-t border-dashed"><MembersList list={groupedData.unassigned} /></AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* --- DIALOG DODAWANIA --- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nowy członek</DialogTitle><DialogDescription>Utwórz konto dla nowej osoby.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Imię i Nazwisko</Label><Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Email</Label><Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Hasło</Label><Input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Grupa</Label>
              <select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})}>
                <option value="">-- Bez grupy --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Anuluj</Button><Button type="submit" disabled={loading}>{loading ? "Tworzenie..." : "Utwórz"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG SZCZEGÓŁÓW (Pełny) --- */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-0">
           {/* HEADER */}
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
                <DialogDescription className="sr-only">Szczegóły profilu użytkownika</DialogDescription>
              </DialogHeader>
           </div>
          
          {selectedMember && (
            <div className="
              p-6 space-y-6 bg-card max-h-[80vh] overflow-y-auto
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
              [&::-webkit-scrollbar-thumb]:rounded-full
            ">
              
              {/* INFO SECTION */}
              <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                     {/* KAFELEK EMAIL (Rozszerzalny) */}
                     <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border transition-all duration-300 ease-in-out hover:bg-muted/30 group">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                        <div className="font-medium text-sm truncate group-hover:whitespace-normal group-hover:break-all group-hover:overflow-visible">
                            {selectedMember.email || <span className="text-muted-foreground italic text-xs">Brak (zaktualizuj profiles)</span>}
                        </div>
                     </div>
                 </div>

                 <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1"><ScrollText className="h-3 w-3" /> Aktualna Tajemnica</Label>
                    <div className="font-medium text-sm whitespace-normal leading-relaxed">
                       {getMysteryName(selectedMember.current_mystery_id)}
                    </div>
                 </div>
              </div>

              {/* --- STATUS MODLITWY --- */}
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

              <Separator />

              {/* ACTION: ZMIANA GRUPY */}
              <div className="space-y-3">
                 <Label className="flex items-center gap-2 text-xs uppercase font-bold text-muted-foreground"><ArrowRightLeft className="h-3 w-3" /> Przypisanie do grupy</Label>
                 <div className="flex gap-2">
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={editGroupId}
                        onChange={(e) => setEditGroupId(e.target.value)}
                    >
                        <option value="">-- Wybierz (lub usuń z grupy) --</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <Button onClick={handleUpdateGroup} disabled={actionLoading} variant="secondary"><RefreshCcw className="h-4 w-4" /></Button>
                 </div>
              </div>

              <Separator />

              {/* ACTION: ZMIANA HASŁA */}
              <div className="space-y-3 bg-red-50/50 dark:bg-red-950/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                 <Label className="flex items-center gap-2 text-xs uppercase font-bold text-red-600 dark:text-red-400">
                    <Lock className="h-3 w-3" /> Zmień hasło użytkownika
                 </Label>
                 <div className="flex gap-2">
                    <div className="relative w-full">
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Nowe hasło..." 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-8 bg-background"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <Button onClick={handlePasswordChange} disabled={actionLoading || !newPassword} variant="destructive">Zmień</Button>
                 </div>
              </div>

              {/* FOOTER */}
              <div className="pt-2 flex justify-center">
                 <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 text-xs" onClick={handleDeleteUser} disabled={actionLoading}>
                   <Trash2 className="h-3 w-3 mr-2" /> Usuń konto trwale
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
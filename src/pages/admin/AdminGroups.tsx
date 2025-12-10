import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Rose, Loader2, Search, RotateCw, AlertCircle } from "lucide-react"

// --- TYPY ---
interface Group {
  id: number
  name: string
  created_at: string
}

export default function AdminGroups() {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [search, setSearch] = useState("")

  // Stan dla Dialogów
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({ name: "" })

  useEffect(() => {
    fetchGroups()
  }, [])

  // Pobieranie grup
  const fetchGroups = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      toast.error("Błąd pobierania grup", { description: error.message })
    } else {
      setGroups(data || [])
    }
    setLoading(false)
  }

  // Otwieranie modala
  const handleOpenDialog = (groupToEdit?: Group) => {
    if (groupToEdit) {
      setEditingGroup(groupToEdit)
      setFormData({ name: groupToEdit.name })
    } else {
      setEditingGroup(null)
      setFormData({ name: "" })
    }
    setIsDialogOpen(true)
  }

  // Zapisywanie
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setActionLoading(true)
    try {
      if (editingGroup) {
        const { error } = await supabase.from('groups').update({ name: formData.name }).eq('id', editingGroup.id)
        if (error) throw error
        toast.success("Zaktualizowano nazwę Róży")
      } else {
        const { error } = await supabase.from('groups').insert({ name: formData.name })
        if (error) throw error
        toast.success("Utworzono nową Różę")
      }
      setIsDialogOpen(false)
      fetchGroups()
    } catch (error: any) {
      toast.error("Wystąpił błąd", { description: error.message })
    } finally {
      setActionLoading(false)
    }
  }

  // Usuwanie
  const handleDelete = (group: Group) => {
    toast.custom((t) => (
      <div className="bg-background border border-border p-4 rounded-xl shadow-xl flex flex-col gap-3 w-full max-w-[340px]">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full shrink-0">
             <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
          </div>
          <div className="space-y-1">
             <h3 className="font-semibold text-sm leading-none pt-1">Usunąć Różę?</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Czy na pewno chcesz trwale usunąć Różę <b>{group.name}</b>? Tej operacji nie można cofnąć.
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
               const { error } = await supabase.from('groups').delete().eq('id', group.id)
               if (error) {
                 if (error.code === '23503') {
                   toast.error("Nie można usunąć", { description: "Ta grupa ma członków. Najpierw ich usuń lub przenieś." })
                 } else {
                   toast.error("Błąd usuwania", { description: error.message })
                 }
               } else {
                 toast.success("Róża usunięta")
                 fetchGroups()
               }
            }}
          >
            Potwierdź usunięcie
          </Button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  // --- NOWA FUNKCJA: RĘCZNA ROTACJA ---
  const handleRotate = (group: Group) => {
    toast.custom((t) => (
      <div className="bg-background border border-border p-4 rounded-xl shadow-xl flex flex-col gap-3 w-full max-w-[340px]">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full shrink-0">
             <RotateCw className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
             <h3 className="font-semibold text-sm leading-none pt-1">Rotacja tajemnic</h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Czy chcesz przesunąć tajemnice w Róży <b>{group.name}</b>? Wszyscy członkowie otrzymają nową tajemnicę, a potwierdzenia modlitwy zostaną zresetowane.
             </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t)} className="h-8 text-xs">Anuluj</Button>
          <Button 
            size="sm" 
            className="h-8 text-xs shadow-sm"
            onClick={async () => {
               toast.dismiss(t)
               const loadingToast = toast.loading("Trwa rotacja...")
            
               // Wywołujemy naszą funkcję SQL
               const { error } = await supabase.rpc('rotate_group_members', {
                   p_group_id: group.id
               })
   
               toast.dismiss(loadingToast)
   
               if (error) {
                   console.error(error)
                   toast.error("Błąd rotacji", { description: error.message })
               } else {
                   toast.success("Rotacja zakończona pomyślnie!", { 
                       description: "Wszyscy członkowie mają nowe tajemnice." 
                   })
               }
            }}
          >
            Potwierdź rotację
          </Button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rose className="h-6 w-6 text-primary" /> Zarządzanie Różami
          </h1>
          <p className="text-sm text-muted-foreground">
            Twórz nowe grupy, edytuj nazwy i zarządzaj rotacją.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-md font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Nowa Róża
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input 
            placeholder="Szukaj róży..." 
            className="pl-9 bg-background" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
         />
      </div>

      {/* LISTA GRUP */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lista Grup</CardTitle>
            <CardDescription>Aktualnie w systemie: {groups.length}</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Lp.</TableHead>
                                <TableHead>Nazwa Róży</TableHead>
                                <TableHead className="text-right">Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Brak wyników.</TableCell>
                                </TableRow>
                            ) : (
                                filteredGroups.map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {groups.findIndex(g => g.id === group.id) + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-base">{group.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {/* PRZYCISK ROTACJI */}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleRotate(group)}
                                                    title="Wymuś zmianę tajemnic (Rotacja)"
                                                >
                                                    <RotateCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                </Button>

                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(group)}>
                                                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                </Button>
                                                
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(group)}>
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>

      {/* DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingGroup ? "Edytuj Różę" : "Utwórz Nową Różę"}</DialogTitle>
                <DialogDescription>
                    {editingGroup ? "Zmień nazwę istniejącej grupy." : "Dodaj nową grupę modlitewną."}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Nazwa Róży</Label>
                    <Input 
                        placeholder="np. Róża pw. Św. Rity" 
                        value={formData.name} 
                        onChange={e => setFormData({ name: e.target.value })}
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
                    <Button type="submit" disabled={actionLoading}>
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Zapisz
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
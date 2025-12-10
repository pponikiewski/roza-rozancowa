import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { toast } from "sonner" // Import Sonnera
import { Plus, Pencil, Trash2, Flower2, Loader2, Search } from "lucide-react"

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
        toast.success("Zaktualizowano Różę")
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

  // --- NOWE USUWANIE (Toast zamiast confirm) ---
  const handleDelete = (group: Group) => {
    // Wyświetlamy toast z pytaniem
    toast("Czy na pewno chcesz usunąć?", {
      description: `Róża "${group.name}" zostanie trwale usunięta.`,
      action: {
        label: "Usuń",
        onClick: async () => {
            // Logika usuwania po kliknięciu w "Usuń" w toście
            const { error } = await supabase.from('groups').delete().eq('id', group.id)
    
            if (error) {
              if (error.code === '23503') {
                toast.error("Nie można usunąć", { 
                    description: "Ta grupa posiada członków. Najpierw ich przenieś lub usuń." 
                })
              } else {
                toast.error("Błąd usuwania", { description: error.message })
              }
            } else {
              toast.success("Róża usunięta", { description: group.name })
              fetchGroups()
            }
        },
      },
      cancel: {
        label: "Anuluj",
        onClick: () => {} // Nic nie rób, toast zniknie
      },
    })
  }

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Flower2 className="h-6 w-6 text-primary" /> Zarządzanie Różami
          </h1>
          <p className="text-sm text-muted-foreground">
            Twórz nowe grupy modlitewne i edytuj ich nazwy.
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
                                <TableHead className="w-[50px]">ID</TableHead>
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
                                        <TableCell className="font-mono text-xs text-muted-foreground">#{group.id}</TableCell>
                                        <TableCell className="font-medium text-base">{group.name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(group)}>
                                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                            </Button>
                                            
                                            {/* ZMIANA: Przekazujemy cały obiekt 'group', nie tylko id */}
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(group)}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
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

      {/* DIALOG DODAWANIA / EDYCJI */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingGroup ? "Edytuj Różę" : "Utwórz Nową Różę"}</DialogTitle>
                <DialogDescription>
                    {editingGroup ? "Zmień nazwę istniejącej grupy." : "Dodaj nową grupę modlitewną do systemu."}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Nazwa Róży</Label>
                    <Input 
                        placeholder="np. Róża pw. Św. Jana Pawła II" 
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
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { AlertCircle, CalendarClock, ChevronRight, Loader2, Pencil, Plus, Rose, RotateCw, Search, Trash2 } from "lucide-react"
import { useAdminRoses } from "@/hooks/useAdminRoses"
import type { Group } from "@/types"

export default function AdminRoses() {
  const {
    loading,
    actionLoading,
    groups,
    saveGroup,
    deleteGroup,
    rotateGroup
  } = useAdminRoses()

  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null)
  const [groupName, setGroupName] = useState("")

  const handleOpenDialog = (groupToEdit?: Group) => {
    setEditingGroup(groupToEdit || null)
    setGroupName(groupToEdit?.name || "")
    setIsDialogOpen(true)
  }

  const handleSaveWrapper = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await saveGroup(groupName, editingGroup?.id)
    if (success) {
      setIsDialogOpen(false)
    }
  }

  const handleDeleteWrapper = (group: Group) => {
    toast.custom((t) => (
      <div className="bg-background border border-border p-4 rounded-xl shadow-xl flex flex-col gap-3 w-full max-w-[340px]">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full shrink-0">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm leading-none pt-1">Usunąć Różę?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Czy na pewno chcesz trwale usunąć Różę <b>{group.name}</b>?</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t)} className="h-8 text-xs">Anuluj</Button>
          <Button variant="destructive" size="sm" className="h-8 text-xs shadow-sm" onClick={async () => {
            toast.dismiss(t)
            await deleteGroup(group.id)
          }}>Potwierdź usunięcie</Button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  const handleRotateWrapper = (group: Group) => {
    toast.custom((t) => (
      <div className="bg-background border border-border p-4 rounded-xl shadow-xl flex flex-col gap-3 w-full max-w-[340px]">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full shrink-0"><RotateCw className="h-5 w-5 text-primary" /></div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm leading-none pt-1">Rotacja tajemnic</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Przesunąć tajemnice w Róży <b>{group.name}</b>?</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t)} className="h-8 text-xs">Anuluj</Button>
          <Button size="sm" className="h-8 text-xs shadow-sm" onClick={async () => {
            toast.dismiss(t)
            await rotateGroup(group.id)
          }}>Potwierdź rotację</Button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 p-6 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Rose className="h-6 w-6 text-primary" /> Zarządzanie Różami</h1>
          <p className="text-sm text-muted-foreground">Twórz nowe grupy, edytuj nazwy i zarządzaj rotacją.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-md font-semibold"><Plus className="h-4 w-4 mr-2" /> Nowa Róża</Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Szukaj róży..." className="pl-9 bg-background" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center p-8 border rounded-xl border-dashed text-muted-foreground">Brak róż spełniających kryteria.</div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id} onClick={() => setViewingGroup(group)} className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm hover:bg-accent/50 transition-all cursor-pointer active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0"><Rose className="h-5 w-5" /></div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{group.name}</span>
                  <span className="text-xs text-muted-foreground">Kliknij, aby zarządzać</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
          ))
        )}
      </div>

      <Dialog open={!!viewingGroup} onOpenChange={(open) => !open && setViewingGroup(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-primary/10 p-2 rounded-full text-primary"><Rose className="h-5 w-5" /></div>
              {viewingGroup?.name}
            </DialogTitle>
            <DialogDescription>Szczegóły i zarządzanie Różą.</DialogDescription>
          </DialogHeader>

          {viewingGroup && (
            <div className="space-y-6 py-2">
              <div className="bg-muted/30 p-3 rounded-lg border flex items-center gap-3">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Data utworzenia</span>
                  <span className="text-sm font-medium">{viewingGroup.created_at ? new Date(viewingGroup.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : "Brak danych"}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dostępne akcje</h4>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start h-11" onClick={() => { setViewingGroup(null); handleRotateWrapper(viewingGroup) }}>
                    <RotateCw className="mr-2 h-4 w-4 text-primary" /> Wymuś rotację tajemnic
                  </Button>
                  <Button variant="outline" className="justify-start h-11" onClick={() => { setViewingGroup(null); handleOpenDialog(viewingGroup) }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edytuj nazwę
                  </Button>
                  <Button variant="destructive" className="justify-start h-11" onClick={() => { setViewingGroup(null); handleDeleteWrapper(viewingGroup) }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Usuń Różę
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edytuj Różę" : "Utwórz Nową Różę"}</DialogTitle>
            <DialogDescription>{editingGroup ? "Zmień nazwę istniejącej grupy." : "Dodaj nową grupę modlitewną."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveWrapper} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nazwa Róży</Label>
              <Input placeholder="np. Róża pw. Św. Rity" value={groupName} onChange={e => setGroupName(e.target.value)} autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Zapisz
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { Loader2, Plus, Rose, RotateCw, Search } from "lucide-react"
import { useAdminRoses } from "@/features/admin/roses/hooks/useAdminRoses"
import { RoseCard, RoseDetailsDialog, RoseFormDialog } from "@/features/admin/roses/components"
import type { Group } from "@/shared/types/domain.types"

export default function AdminRosesPage() {
  const {
    loading,
    actionLoading,
    groups,
    saveGroup,
    deleteGroup,
    rotateGroup
  } = useAdminRoses()

  const { confirm, dialogProps } = useConfirmation()

  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null)
  const [groupName, setGroupName] = useState("")

  const handleOpenForm = (groupToEdit?: Group) => {
    setEditingGroup(groupToEdit || null)
    setGroupName(groupToEdit?.name || "")
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await saveGroup(groupName, editingGroup?.id)
    if (success) {
      setIsFormOpen(false)
    }
  }

  const handleDelete = (group: Group) => {
    confirm({
      title: "Usunąć Różę?",
      description: <>Czy na pewno chcesz trwale usunąć Różę <b>{group.name}</b>?</>,
      confirmText: "Potwierdź usunięcie",
      variant: "danger",
      onConfirm: () => deleteGroup(group.id),
    })
  }

  const handleRotate = (group: Group) => {
    confirm({
      title: "Rotacja tajemnic",
      description: <>Przesunąć tajemnice w Róży <b>{group.name}</b>?</>,
      confirmText: "Potwierdź rotację",
      variant: "info",
      icon: RotateCw,
      onConfirm: () => rotateGroup(group.id),
    })
  }

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 p-6 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rose className="h-6 w-6 text-primary" />
            Zarządzanie Różami
          </h1>
          <p className="text-sm text-muted-foreground">
            Twórz nowe grupy, edytuj nazwy i zarządzaj rotacją.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="shadow-md font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Nowa Róża
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj róży..."
          className="pl-9 bg-background"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center p-8 border rounded-xl border-dashed text-muted-foreground">
            Brak róż spełniających kryteria.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <RoseCard
              key={group.id}
              group={group}
              onClick={() => setViewingGroup(group)}
            />
          ))
        )}
      </div>

      {/* Details Dialog */}
      <RoseDetailsDialog
        group={viewingGroup}
        open={!!viewingGroup}
        onOpenChange={(open) => !open && setViewingGroup(null)}
        onRotate={handleRotate}
        onEdit={handleOpenForm}
        onDelete={handleDelete}
      />

      {/* Form Dialog */}
      <RoseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingGroup={editingGroup}
        groupName={groupName}
        onGroupNameChange={setGroupName}
        onSubmit={handleSubmit}
        loading={actionLoading}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog {...dialogProps} />
    </div>
  )
}
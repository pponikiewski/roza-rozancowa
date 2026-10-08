import { useState, useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { Loader2 } from "lucide-react"
import { useAdminRoses } from "@/features/admin/roses/hooks/useAdminRoses"
import { RoseCard, RoseDetailsDialog, RoseFormDialog } from "@/features/admin/roses/components"
import type { Group } from "@/shared/types/domain.types"
import type { RoseAdmission } from "@/features/admin/roses/types/rose.types"

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

  const handleOpenForm = (groupToEdit?: Group) => {
    setEditingGroup(groupToEdit || null)
    setIsFormOpen(true)
  }

  const handleSubmit = async (name: string, admission: RoseAdmission) => {
    const success = await saveGroup(name, editingGroup?.id, admission)
    if (success) setIsFormOpen(false)
    return success
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
      onConfirm: () => rotateGroup(group.id),
    })
  }

  const filteredGroups = useMemo(
    () => groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search]
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <Button onClick={() => handleOpenForm()} className="w-full md:w-auto md:order-last font-semibold">
          Nowa Róża
        </Button>
        <Input
          placeholder="Szukaj Róży"
          aria-label="Szukaj Róży"
          className="w-full max-w-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="divide-y border-y">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <p className="py-6 text-muted-foreground">
            Brak Róż o takiej nazwie.
          </p>
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
        onSubmit={handleSubmit}
        loading={actionLoading}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog {...dialogProps} />
    </div>
  )
}
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { useAdminIndulgences } from "@/features/admin/indulgences/hooks/useAdminIndulgences"
import { IndulgenceList } from "@/features/admin/indulgences/components/IndulgenceList"
import { IndulgenceFormDialog } from "@/features/admin/indulgences/components/IndulgenceFormDialog"
import type { IndulgenceDay, IndulgenceInput } from "@/features/admin/indulgences/types/indulgence.types"

/**
 * Strona zarządzania dniami odpustów (admin)
 */
export default function AdminIndulgencesPage() {
  const {
    loading,
    saving,
    indulgences,
    createIndulgence,
    updateIndulgence,
    deleteIndulgence,
  } = useAdminIndulgences()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<IndulgenceDay | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (indulgence: IndulgenceDay) => {
    setEditing(indulgence)
    setDialogOpen(true)
  }

  const handleSave = (input: IndulgenceInput) =>
    editing ? updateIndulgence(editing.id, input) : createIndulgence(input)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button onClick={openCreate} className="w-full md:w-auto md:order-last font-semibold">
          Dodaj dzień
        </Button>
        <p className="text-sm text-muted-foreground">
          Dzień przyjęcia do Stowarzyszenia Żywego Różańca jest inny dla każdej Róży. Ustawisz go w zakładce <b>Róże</b> (edycja Róży).
        </p>
      </div>

      <IndulgenceList
        indulgences={indulgences}
        loading={loading}
        onEdit={openEdit}
        onDelete={deleteIndulgence}
      />

      <IndulgenceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        indulgence={editing}
        loading={saving}
        onSave={handleSave}
      />
    </div>
  )
}

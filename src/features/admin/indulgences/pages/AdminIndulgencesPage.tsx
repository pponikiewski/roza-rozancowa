import { useState } from "react"
import { CalendarHeart, Plus } from "lucide-react"
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
    <div className="space-y-6 max-w-2xl mx-auto p-6 pt-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarHeart className="h-6 w-6 text-primary" /> Odpusty
          </h1>
          <p className="text-muted-foreground">
            Dni, w których członkowie Róż mogą zyskać odpust. W każdy z nich wysyłane jest powiadomienie.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj dzień
        </Button>
      </div>

      <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 px-4 py-3">
        Dzień przyjęcia do Stowarzyszenia Żywego Różańca jest inny dla każdej Róży. Ustawisz go w zakładce <b>Róże</b> (edycja Róży).
      </p>

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

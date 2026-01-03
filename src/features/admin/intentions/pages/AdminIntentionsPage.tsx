import { useState } from "react"
import { HandHeart } from "lucide-react"
import { useAdminIntentions } from "@/features/admin/intentions/hooks/useAdminIntentions"
import { IntentionForm, IntentionHistory, EditIntentionDialog } from "@/features/admin/intentions/components"
import type { IntentionHistory as IntentionHistoryType } from "@/features/admin/intentions/types/intention.types"

/**
 * Strona zarządzania intencjami miesięcznymi (admin)
 */
export default function AdminIntentionsPage() {
  const {
    loading,
    history,
    saved,
    saveIntention,
    updateIntention,
    deleteIntention
  } = useAdminIntentions()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingIntention, setEditingIntention] = useState<IntentionHistoryType | null>(null)

  const handleEdit = (intention: IntentionHistoryType) => {
    setEditingIntention(intention)
    setEditDialogOpen(true)
  }

  const handleEditSave = async (id: number, title: string, content: string) => {
    const success = await updateIntention(id, title, content)
    if (success) {
      setEditingIntention(null)
    }
    return success
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HandHeart className="h-6 w-6 text-primary" /> Intencja
        </h1>
        <p className="text-muted-foreground">
          Zmiana intencji modlitwy na dany miesiąc.
        </p>
      </div>

      {/* Formularz nowej intencji */}
      <IntentionForm
        loading={loading}
        saved={saved}
        onSave={saveIntention}
      />

      {/* Historia intencji */}
      <IntentionHistory
        history={history}
        onEdit={handleEdit}
        onDelete={deleteIntention}
      />

      {/* Dialog edycji */}
      <EditIntentionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        intention={editingIntention}
        loading={loading}
        onSave={handleEditSave}
      />
    </div>
  )
}

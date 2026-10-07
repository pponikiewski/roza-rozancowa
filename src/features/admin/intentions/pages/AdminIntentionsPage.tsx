import { useState } from "react"
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

  const [editingIntention, setEditingIntention] = useState<IntentionHistoryType | null>(null)

  const handleEditSave = async (id: number, title: string, content: string) => {
    const success = await updateIntention(id, title, content)
    if (success) {
      setEditingIntention(null)
    }
    return success
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Intencja</h1>
        <p className="text-[0.9375rem] text-muted-foreground">
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
        onEdit={setEditingIntention}
        onDelete={deleteIntention}
      />

      {/* Dialog edycji */}
      <EditIntentionDialog
        open={!!editingIntention}
        onOpenChange={(open) => !open && setEditingIntention(null)}
        intention={editingIntention}
        loading={loading}
        onSave={handleEditSave}
      />
    </div>
  )
}

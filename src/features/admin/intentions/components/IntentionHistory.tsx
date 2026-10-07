import { useId, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { Collapsible } from "@/shared/components/common/Collapsible"
import { ExpandableText } from "@/shared/components/common/ExpandableText"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { getMonthName } from "@/shared/lib/formatters"
import { cn } from "@/shared/lib/utils"
import type { IntentionHistory as IntentionHistoryType } from "@/features/admin/intentions/types/intention.types"

interface IntentionHistoryProps {
  history: IntentionHistoryType[]
  onEdit: (intention: IntentionHistoryType) => void
  onDelete: (id: number) => void
}

/**
 * Historia intencji jako zwijana lista (domyślnie zwinięta)
 */
export function IntentionHistory({ history, onEdit, onDelete }: IntentionHistoryProps) {
  const { confirm, dialogProps } = useConfirmation()
  const [open, setOpen] = useState(false)
  const listId = useId()

  const handleDelete = (id: number, title: string) => {
    confirm({
      title: "Usunąć intencję?",
      description: <>Czy na pewno chcesz usunąć intencję <b>„{title}”</b>?</>,
      confirmText: "Usuń",
      variant: "danger",
      onConfirm: () => onDelete(id),
    })
  }

  return (
    <>
      <section className="border-t">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          disabled={history.length === 0}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>
            <span className="block text-lg font-semibold">Historia intencji</span>
            <span className="text-sm text-muted-foreground">
              {history.length === 0 ? "Brak wcześniejszych intencji" : `Zapisane intencje: ${history.length}`}
            </span>
          </span>
          {history.length > 0 && (
            <ChevronDown className={cn("h-5 w-5 flex-shrink-0 text-muted-foreground motion-safe:transition-transform", open && "rotate-180")} />
          )}
        </button>

        <Collapsible open={open} id={listId}>
          <ul className="divide-y border-t">
            {history.map((item) => (
              <li key={`${item.year}-${item.month}`} className="flex items-start gap-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm capitalize text-muted-foreground">
                    {getMonthName(item.month)} {item.year}
                  </p>
                  <p className="font-semibold leading-snug">{item.title}</p>
                  <ExpandableText className="mt-0.5 text-sm text-muted-foreground">{item.content}</ExpandableText>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edytuj intencję: ${item.title}`}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Usuń intencję: ${item.title}`}
                    onClick={() => handleDelete(item.id, item.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Collapsible>
      </section>

      <ConfirmationDialog {...dialogProps} />
    </>
  )
}

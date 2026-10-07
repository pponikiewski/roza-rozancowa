import { Button } from "@/shared/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { Pencil, Trash2 } from "lucide-react"
import { getMonthName } from "@/shared/lib/formatters"
import type { IntentionHistory as IntentionHistoryType } from "@/features/admin/intentions/types/intention.types"

interface IntentionHistoryProps {
  history: IntentionHistoryType[]
  onEdit: (intention: IntentionHistoryType) => void
  onDelete: (id: number) => void
}

/**
 * Komponent wyświetlający historię intencji w formie tabeli
 */
export function IntentionHistory({ history, onEdit, onDelete }: IntentionHistoryProps) {
  const { confirm, dialogProps } = useConfirmation()

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
      <section className="border-t pt-6">
        <h2 className="text-lg font-semibold">Historia intencji</h2>
        <div className="mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Miesiąc</TableHead>
                <TableHead>Intencja</TableHead>
                <TableHead className="w-[120px]">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={`${item.year}-${item.month}`}>
                  <TableCell className="font-medium capitalize">
                    {getMonthName(item.month)} {item.year}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold mb-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.content}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Brak historii intencji
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <ConfirmationDialog {...dialogProps} />
    </>
  )
}

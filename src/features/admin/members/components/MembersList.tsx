import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { CheckCircle2, Circle, ScrollText } from "lucide-react"
import type { AdminMember } from "@/features/admin/members/types/member.types"

interface MembersListProps {
  list: AdminMember[]
  onSelect: (member: AdminMember) => void
  getMysteryName: (id: number | null) => string
}

/**
 * Komponent wyświetlający listę członków grupy
 * - Widok mobilny: karty z podstawowymi informacjami
 * - Widok desktop: tabela z pełnymi danymi
 */
export function MembersList({ list, onSelect, getMysteryName }: MembersListProps) {
  if (list.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
        Brak członków w tej grupie.
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Mobile View - Cards */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {list.map((member) => {
          const hasAck = member.acknowledgments.length > 0
          return (
            <div
              key={member.id}
              onClick={() => onSelect(member)}
              className="relative overflow-hidden flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasAck ? 'bg-green-500' : 'bg-muted'}`} />
              <div className="flex items-center gap-3 pl-2">
                <div>
                  <div className="font-semibold text-sm">{member.full_name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                    <ScrollText className="h-3 w-3" />
                    {getMysteryName(member.current_mystery_id)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {hasAck ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 w-[40%]">Członek</TableHead>
              <TableHead className="w-[45%]">Tajemnica</TableHead>
              <TableHead className="text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((member) => {
              const hasAck = member.acknowledgments.length > 0
              return (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelect(member)}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.full_name}</span>
                      {member.role === 'admin' && (
                        <Badge variant="secondary" className="text-[10px] px-1 h-5">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {getMysteryName(member.current_mystery_id)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {hasAck ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> Potwierdzone
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Oczekuje</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

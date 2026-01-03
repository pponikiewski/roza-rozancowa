import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import type { AdminMember } from "@/features/admin/members/types/member.types"

interface MembersTableProps {
  members: AdminMember[]
  onSelect: (member: AdminMember) => void
  getMysteryName: (id: number | null) => string
}

/**
 * Tabela członków - widok desktop
 */
export function MembersTable({ members, onSelect, getMysteryName }: MembersTableProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6 w-[40%]">Członek</TableHead>
            <TableHead className="w-[45%]">Tajemnica</TableHead>
            <TableHead className="text-right pr-6">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
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
  )
}

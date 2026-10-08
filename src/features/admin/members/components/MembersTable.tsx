import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { AckStatus } from "./AckStatus"
import type { AdminMember } from "@/features/admin/members/types/member.types"

interface MembersTableProps {
  members: AdminMember[]
  onSelect: (member: AdminMember) => void
}

/**
 * Tabela członków - widok desktop
 */
export function MembersTable({ members, onSelect }: MembersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[40%]">Członek</TableHead>
          <TableHead className="w-[45%]">Tajemnica</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow
            key={member.id}
            className="cursor-pointer hover:bg-accent/60 transition-colors"
            onClick={() => onSelect(member)}
          >
            <TableCell>
              <span className="font-medium">{member.full_name}</span>
              {member.role === 'admin' && (
                <span className="ml-2 text-sm text-muted-foreground">(administrator)</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {member.current_mystery_name ?? "Brak przydziału"}
            </TableCell>
            <TableCell className="text-right">
              <AckStatus acknowledged={!!member.acknowledged_at} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

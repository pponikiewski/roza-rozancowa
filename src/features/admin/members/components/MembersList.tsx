import { MemberCard } from "./MemberCard"
import { MembersTable } from "./MembersTable"
import type { AdminMember } from "@/features/admin/members/types/member.types"

interface MembersListProps {
  list: AdminMember[]
  onSelect: (member: AdminMember) => void
}

/**
 * Komponent wyświetlający listę członków grupy
 * - Widok mobilny: wiersze z podstawowymi informacjami (MemberCard)
 * - Widok desktop: tabela z pełnymi danymi (MembersTable)
 */
export function MembersList({ list, onSelect }: MembersListProps) {
  if (list.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">Brak członków w tej grupie.</p>
  }

  return (
    <div className="w-full">
      {/* Mobile View - Rows */}
      <div className="divide-y sm:hidden">
        {list.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block">
        <MembersTable
          members={list}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}

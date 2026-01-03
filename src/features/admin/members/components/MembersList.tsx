import { MemberCard } from "./MemberCard"
import { MembersTable } from "./MembersTable"
import type { AdminMember } from "@/features/admin/members/types/member.types"

interface MembersListProps {
  list: AdminMember[]
  onSelect: (member: AdminMember) => void
  getMysteryName: (id: number | null) => string
}

/**
 * Komponent wyświetlający listę członków grupy
 * - Widok mobilny: karty z podstawowymi informacjami (MemberCard)
 * - Widok desktop: tabela z pełnymi danymi (MembersTable)
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
        {list.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onSelect={onSelect}
            getMysteryName={getMysteryName}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block">
        <MembersTable
          members={list}
          onSelect={onSelect}
          getMysteryName={getMysteryName}
        />
      </div>
    </div>
  )
}

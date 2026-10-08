import { AckStatus } from "./AckStatus"
import type { AdminMember } from "@/features/admin/members/types/member.types"

interface MemberCardProps {
  member: AdminMember
  onSelect: (member: AdminMember) => void
}

/**
 * Wiersz członka - widok mobilny
 */
export function MemberCard({ member, onSelect }: MemberCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(member)}
      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0">
        <div className="truncate text-[0.9375rem] font-semibold">{member.full_name}</div>
        <div className="truncate text-sm text-muted-foreground">{member.current_mystery_name ?? "Brak przydziału"}</div>
      </div>
      <AckStatus acknowledged={!!member.acknowledged_at} className="flex-shrink-0" />
    </button>
  )
}

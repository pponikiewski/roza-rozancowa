import { CheckCircle2, Circle, ScrollText } from "lucide-react"
import type { AdminMember } from "@/features/admin/members/types/member.types"

interface MemberCardProps {
  member: AdminMember
  onSelect: (member: AdminMember) => void
  getMysteryName: (id: number | null) => string
}

/**
 * Karta członka - widok mobilny
 */
export function MemberCard({ member, onSelect, getMysteryName }: MemberCardProps) {
  const hasAck = member.acknowledgments.length > 0

  return (
    <div
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
}

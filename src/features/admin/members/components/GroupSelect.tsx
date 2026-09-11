import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import type { Group } from "@/shared/types/domain.types"
import { UNASSIGNED_GROUP_VALUE } from "@/shared/lib/constants"

interface GroupSelectProps {
  value: string
  onValueChange: (value: string) => void
  groups: Group[]
  groupMemberCounts?: Record<number, number>
  currentGroupId?: number | null
  placeholder?: string
  unassignedLabel?: string
  className?: string
  triggerClassName?: string
}

/**
 * Reużywalny komponent wyboru grupy (Róży)
 * Używany w CreateUserDialog i MemberDetailsDialog
 * Zawsze zawiera opcję "bez grupy" na początku listy
 * 
 * @example
 * <GroupSelect
 *   value={selectedGroupId}
 *   onValueChange={setSelectedGroupId}
 *   groups={groups}
 * />
 */
export function GroupSelect({
  value,
  onValueChange,
  groups,
  groupMemberCounts = {},
  currentGroupId,
  placeholder = "-- Bez grupy --",
  unassignedLabel = "-- Bez grupy --",
  className,
  triggerClassName = "h-10 w-full text-sm",
}: GroupSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        <SelectItem value={UNASSIGNED_GROUP_VALUE}>{unassignedLabel}</SelectItem>
        {groups.map((g) => (
          <SelectItem
            key={g.id}
            value={g.id.toString()}
            disabled={groupMemberCounts[g.id] >= 20 && g.id !== currentGroupId}
          >
            {g.name}{groupMemberCounts[g.id] >= 20 ? " (pełna)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

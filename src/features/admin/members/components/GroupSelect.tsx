import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import type { Group } from "@/shared/types/domain.types"

interface GroupSelectProps {
  value: string
  onValueChange: (value: string) => void
  groups: Group[]
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
        <SelectItem value="unassigned">{unassignedLabel}</SelectItem>
        {groups.map((g) => (
          <SelectItem key={g.id} value={g.id.toString()}>
            {g.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

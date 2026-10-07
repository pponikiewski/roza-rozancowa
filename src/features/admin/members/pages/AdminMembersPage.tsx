import { useState, useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { useAdminMembers } from "@/features/admin/members/hooks/useAdminMembers"
import { MembersList } from "@/features/admin/members/components/MembersList"
import { CreateUserDialog } from "@/features/admin/members/components/CreateUserDialog"
import { MemberDetailsDialog } from "@/features/admin/members/components/MemberDetailsDialog"
import type { AdminMember } from "@/features/admin/members/types/member.types"
import type { CreateUserFormData } from "@/shared/validation/member.schema"

export default function AdminMembersPage() {
  const {
    loading,
    actionLoading,
    groups,
    mysteries,
    members,
    createUser,
    updateGroup,
    changePassword,
    updateLogin,
    deleteUser
  } = useAdminMembers()

  const { confirm, dialogProps } = useConfirmation()

  const [search, setSearch] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null)

  const getMysteryName = (id: number | null) => mysteries.find((m) => m.id === id)?.name || (id ? `Tajemnica #${id}` : "Brak przydziału")

  const handleCreateUser = async (data: CreateUserFormData) => {
    const success = await createUser(data)
    if (success) {
      setIsAddOpen(false)
    }
  }

  const handleUpdateGroup = async (userId: string, groupId: string) => {
    const success = await updateGroup(userId, groupId)
    if (success) {
      setSelectedMember(null)
    }
  }

  const handleDeleteUser = (userId: string, fullName: string) => {
    confirm({
      title: "Usunąć użytkownika?",
      description: <>Czy na pewno chcesz trwale usunąć konto <b>{fullName}</b>?</>,
      confirmText: "Potwierdź usunięcie",
      variant: "danger",
      onConfirm: async () => {
        // Po usunięciu zamknij szczegóły - konta już nie ma
        const success = await deleteUser(userId)
        if (success) {
          setSelectedMember(null)
        }
      },
    })
  }

  const groupedData = useMemo(() => {
    const filtered = members.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()))
    const map = new Map<number, AdminMember[]>()
    const unassigned: AdminMember[] = []
    filtered.forEach((m) => {
      if (m.groups?.id) {
        if (!map.has(m.groups.id)) map.set(m.groups.id, [])
        map.get(m.groups.id)!.push(m)
      } else if (m.role !== "admin") {
        unassigned.push(m)
      }
    })
    return { map, unassigned }
  }, [members, search])

  const groupMemberCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    members.forEach((member) => {
      if (member.groups?.id && member.role !== "admin") {
        counts[member.groups.id] = (counts[member.groups.id] || 0) + 1
      }
    })
    return counts
  }, [members])

  const groupCompletedCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    members.forEach((member) => {
      if (member.groups?.id && member.role !== "admin" && member.acknowledgments.length > 0) {
        counts[member.groups.id] = (counts[member.groups.id] || 0) + 1
      }
    })
    return counts
  }, [members])

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Użytkownicy</h1>
          <p className="text-[0.9375rem] text-muted-foreground">Członkowie Róż i to, kto zapoznał się z tajemnicą w tym miesiącu.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto font-semibold">
          Dodaj członka
        </Button>
      </div>

      <Input
        placeholder="Szukaj po imieniu i nazwisku"
        aria-label="Szukaj po imieniu i nazwisku"
        className="w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Accordion type="multiple" className="w-full border-t" defaultValue={groups.length > 0 ? [`group-${groups[0].id}`] : []}>
        {groups.map((group) => {
          const groupMembers = groupedData.map.get(group.id) || []
          const count = groupMemberCounts[group.id] || 0
          const completed = groupCompletedCounts[group.id] || 0
          return (
            <AccordionItem key={group.id} value={`group-${group.id}`}>
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-1 sm:gap-4 text-left justify-between pr-4">
                  <div>
                    <span className="block text-lg font-semibold leading-tight">{group.name}</span>
                    <span className="text-sm text-muted-foreground">{count}/20 członków</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Zapoznało się:{" "}
                    <span className={`font-semibold tabular-nums ${completed === count && count > 0 ? "text-success" : "text-foreground"}`}>
                      {completed}/{count}
                    </span>
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <MembersList list={groupMembers} onSelect={setSelectedMember} getMysteryName={getMysteryName} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
        <AccordionItem value="unassigned">
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="text-lg font-semibold text-muted-foreground">
              Osoby nieprzypisane ({groupedData.unassigned.length})
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <MembersList list={groupedData.unassigned} onSelect={setSelectedMember} getMysteryName={getMysteryName} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <CreateUserDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleCreateUser}
        groups={groups}
        groupMemberCounts={groupMemberCounts}
        loading={loading}
      />

      <MemberDetailsDialog
        member={selectedMember}
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        onUpdateGroup={handleUpdateGroup}
        onChangePassword={changePassword}
        onUpdateLogin={updateLogin}
        onDeleteUser={handleDeleteUser}
        getMysteryName={getMysteryName}
        groups={groups}
        groupMemberCounts={groupMemberCounts}
        actionLoading={actionLoading}
      />

      <ConfirmationDialog {...dialogProps} />
    </div>
  )
}

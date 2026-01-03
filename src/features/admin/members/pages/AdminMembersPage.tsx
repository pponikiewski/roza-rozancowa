import { useState, useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion"
import { UserPlus, Search, Users, AlertCircle } from "lucide-react"
import { toast } from "sonner"
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
    deleteUser
  } = useAdminMembers()

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

  const handleChangePassword = async (userId: string, newPassword: string) => {
    await changePassword(userId, newPassword)
  }

  const handleDeleteUser = (userId: string, fullName: string) => {
    toast.custom(
      (t) => (
        <div className="bg-background border border-border p-4 rounded-xl shadow-xl flex flex-col gap-3 w-full max-w-[340px]">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm leading-none pt-1">Usunąć użytkownika?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Czy na pewno chcesz trwale usunąć konto <b>{fullName}</b>?
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => toast.dismiss(t)} className="h-8 text-xs">
              Anuluj
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs shadow-sm"
              onClick={async () => {
                toast.dismiss(t)
                await deleteUser(userId)
              }}
            >
              Potwierdź usunięcie
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity }
    )
  }

  const handleSelectMember = (member: AdminMember) => {
    setSelectedMember(member)
  }

  const filteredAllMembers = members.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()))
  const groupedData = useMemo(() => {
    const map = new Map<number, AdminMember[]>()
    const unassigned: AdminMember[] = []
    filteredAllMembers.forEach((m) => {
      if (m.groups?.id) {
        if (!map.has(m.groups.id)) map.set(m.groups.id, [])
        map.get(m.groups.id)!.push(m)
      } else if (m.role !== "admin") {
        unassigned.push(m)
      }
    })
    return { map, unassigned }
  }, [filteredAllMembers])

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto p-6 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Struktura Róż
          </h1>
          <p className="text-sm text-muted-foreground">Zarządzaj członkami, monitoruj modlitwę i edytuj dane.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto shadow-md gap-2 font-semibold">
          <UserPlus className="h-4 w-4" /> Dodaj Członka
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Szukaj..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Accordion type="multiple" className="w-full space-y-4" defaultValue={groups.length > 0 ? [`group-${groups[0].id}`] : []}>
        {groups.map((group) => {
          const groupMembers = groupedData.map.get(group.id) || []
          const count = groupMembers.length
          const completed = groupMembers.filter((m) => m.acknowledgments.length > 0).length
          return (
            <AccordionItem key={group.id} value={`group-${group.id}`} className="border rounded-xl bg-card px-1 overflow-hidden shadow-sm">
              <AccordionTrigger className="hover:no-underline px-4 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-4 text-left justify-between pr-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-lg block leading-none mb-1">{group.name}</span>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{count}/20 członków</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl border h-auto">
                    <div className="text-xs font-medium text-muted-foreground">Zapoznanie się z tajemnicą:</div>
                    <div className="text-sm font-bold flex items-center gap-1">
                      <span className={completed === count && count > 0 ? "text-green-600" : ""}>{completed}</span>
                      <span className="text-muted-foreground/50">/</span>
                      <span>{count}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 border-t border-dashed">
                <MembersList list={groupMembers} onSelect={handleSelectMember} getMysteryName={getMysteryName} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
        <AccordionItem value="unassigned" className="border rounded-xl bg-muted/20 border-dashed px-1">
          <AccordionTrigger className="hover:no-underline px-4 py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="bg-muted p-2 rounded-lg">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="font-semibold">Osoby nieprzypisane</span>
              <Badge variant="secondary" className="ml-2">
                {groupedData.unassigned.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 border-t border-dashed">
            <MembersList list={groupedData.unassigned} onSelect={handleSelectMember} getMysteryName={getMysteryName} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <CreateUserDialog open={isAddOpen} onOpenChange={setIsAddOpen} onSubmit={handleCreateUser} groups={groups} loading={loading} />

      <MemberDetailsDialog
        member={selectedMember}
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        onUpdateGroup={handleUpdateGroup}
        onChangePassword={handleChangePassword}
        onDeleteUser={handleDeleteUser}
        getMysteryName={getMysteryName}
        groups={groups}
        actionLoading={actionLoading}
      />
    </div>
  )
}

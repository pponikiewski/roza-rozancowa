import { membersService } from "@/features/admin/members/api/members.service"
import { groupsService } from "@/shared/api"
import type { CreateUserFormData } from "@/shared/validation/member.schema"
import { useQuery } from "@tanstack/react-query"
import { useTypedMutation } from "@/shared/hooks"
import { QUERY_KEYS, UNASSIGNED_GROUP_VALUE } from "@/shared/lib/constants"

export function useAdminMembers() {
  // Członkowie z tajemnicą i statusem — jedno zapytanie, odświeżane po zmianach w członkach
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_MEMBERS,
    queryFn: () => membersService.getAllMembers()
  })

  // Lista Róż — ten sam cache co na stronie Róż, nie zmienia się przy zmianach w członkach
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_ROSES,
    queryFn: () => groupsService.getAll()
  })

  // Mutations
  const createMutation = useTypedMutation({
    mutationFn: (formData: CreateUserFormData) =>
      membersService.createMember({
        password: formData.password,
        fullName: formData.fullName,
        groupId: formData.groupId !== UNASSIGNED_GROUP_VALUE ? parseInt(formData.groupId) : null
      }).then(() => formData.fullName),
    successMessage: (fullName) => `Dodano użytkownika: ${fullName}`,
    errorMessage: "Błąd tworzenia",
    invalidateKeys: [QUERY_KEYS.ADMIN_MEMBERS]
  })

  const updateGroupMutation = useTypedMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      membersService.updateMemberGroup(userId, groupId !== UNASSIGNED_GROUP_VALUE ? parseInt(groupId) : null),
    successMessage: "Przypisanie do grupy zostało zmienione",
    errorMessage: "Błąd aktualizacji",
    invalidateKeys: [QUERY_KEYS.ADMIN_MEMBERS]
  })

  const changePasswordMutation = useTypedMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      if (newPassword.length < 6) throw new Error("Hasło za krótkie (min. 6 znaków)")
      await membersService.changeMemberPassword(userId, newPassword)
    },
    successMessage: "Hasło zmienione",
    errorMessage: "Błąd zmiany hasła"
  })

  const deleteMutation = useTypedMutation({
    mutationFn: (userId: string) => membersService.deleteMember(userId),
    successMessage: "Użytkownik został usunięty",
    errorMessage: "Błąd usuwania",
    invalidateKeys: [QUERY_KEYS.ADMIN_MEMBERS]
  })

  const updateLoginMutation = useTypedMutation({
    mutationFn: ({ userId, newLogin }: { userId: string; newLogin: string }) =>
      membersService.updateMemberLogin(userId, newLogin),
    successMessage: "Login zaktualizowany",
    errorMessage: "Błąd aktualizacji loginu",
    invalidateKeys: [QUERY_KEYS.ADMIN_MEMBERS]
  })

  const mutations = [createMutation, updateGroupMutation, changePasswordMutation, deleteMutation, updateLoginMutation]

  return {
    loading: membersLoading || groupsLoading,
    actionLoading: mutations.some(m => m.isPending),
    groups: groups || [],
    members: members || [],
    createUser: createMutation.execute,
    updateGroup: (userId: string, groupId: string) => updateGroupMutation.execute({ userId, groupId }),
    changePassword: (userId: string, newPassword: string) => changePasswordMutation.execute({ userId, newPassword }),
    updateLogin: (userId: string, newLogin: string) => updateLoginMutation.execute({ userId, newLogin }),
    deleteUser: deleteMutation.execute,
  }
}

import { membersService } from "@/features/admin/members/api/members.service"
import { mysteriesService } from "@/features/mysteries/api/mysteries.service"
import type { CreateUserFormData } from "@/shared/validation/member.schema"
import { useQuery } from "@tanstack/react-query"
import { useTypedMutation } from "@/shared/hooks"
import { QUERY_KEYS } from "@/shared/lib/constants"

export function useAdminMembers() {
  // Query for all data
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_MEMBERS,
    queryFn: async () => {
      const [groups, mysteries, members] = await Promise.all([
        membersService.getAllGroups(),
        mysteriesService.getAllMysteries(),
        membersService.getAllMembers()
      ])
      return { groups, mysteries, members }
    }
  })

  // Mutations
  const createMutation = useTypedMutation({
    mutationFn: async (formData: CreateUserFormData) => {
      await membersService.createMember({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        groupId: formData.groupId !== "unassigned" ? parseInt(formData.groupId) : null
      })
      return formData.fullName
    },
    successMessage: (fullName) => `Dodano użytkownika: ${fullName}`,
    errorMessage: "Błąd tworzenia",
    invalidateKeys: [QUERY_KEYS.ADMIN_MEMBERS]
  })

  const updateGroupMutation = useTypedMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: string }) => {
      await membersService.updateMemberGroup(
        userId,
        groupId !== "unassigned" ? parseInt(groupId) : null
      )
    },
    successMessage: "Przypisanie do grupy zostało zmienione",
    errorMessage: "Błąd aktualizacji",
    invalidateKeys: [QUERY_KEYS.ADMIN_MEMBERS]
  })

  const changePasswordMutation = useTypedMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      if (!newPassword || newPassword.length < 6) {
        throw new Error("Hasło za krótkie (min. 6 znaków)")
      }
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

  return {
    loading: isLoading,
    actionLoading: createMutation.isPending || updateGroupMutation.isPending || changePasswordMutation.isPending || deleteMutation.isPending,
    groups: data?.groups || [],
    mysteries: data?.mysteries || [],
    members: data?.members || [],
    createUser: (formData: CreateUserFormData) => createMutation.execute(formData),
    updateGroup: (userId: string, groupId: string) => updateGroupMutation.execute({ userId, groupId }),
    changePassword: (userId: string, newPassword: string) => changePasswordMutation.mutateAsync({ userId, newPassword }),
    deleteUser: (userId: string) => deleteMutation.mutateAsync(userId)
  }
}
  }
}

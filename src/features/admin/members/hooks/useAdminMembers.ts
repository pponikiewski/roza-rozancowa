import { membersService } from "@/features/admin/members/api/members.service"
import { mysteriesService } from "@/features/mysteries/api/mysteries.service"
import { toast } from "sonner"
import type { CreateUserFormData } from "@/shared/validation/member.schema"
import { getErrorMessage } from "@/shared/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/shared/lib/constants"

export function useAdminMembers() {
  const queryClient = useQueryClient()

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
  const createMutation = useMutation({
    mutationFn: async (formData: CreateUserFormData) => {
      await membersService.createMember({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        groupId: formData.groupId !== "unassigned" ? parseInt(formData.groupId) : null
      })
      return formData.fullName
    },
    onSuccess: (fullName) => {
      toast.success("Sukces!", { description: `Dodano użytkownika: ${fullName}` })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_MEMBERS })
    },
    onError: (err) => toast.error("Błąd tworzenia", { description: getErrorMessage(err) })
  })

  const updateGroupMutation = useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: string }) => {
      await membersService.updateMemberGroup(
        userId,
        groupId !== "unassigned" ? parseInt(groupId) : null
      )
    },
    onSuccess: () => {
      toast.success("Zaktualizowano", { description: "Przypisanie do grupy zostało zmienione." })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_MEMBERS })
    },
    onError: (err) => toast.error("Błąd aktualizacji", { description: getErrorMessage(err) })
  })

  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      if (!newPassword || newPassword.length < 6) {
        throw new Error("Hasło za krótkie (min. 6 znaków)")
      }
      await membersService.changeMemberPassword(userId, newPassword)
    },
    onSuccess: () => toast.success("Hasło zmienione"),
    onError: (err) => toast.error("Błąd zmiany hasła", { description: getErrorMessage(err) })
  })

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await membersService.deleteMember(userId)
    },
    onSuccess: () => {
      toast.success("Usunięto", { description: "Użytkownik został usunięty." })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_MEMBERS })
    },
    onError: (err) => toast.error("Błąd usuwania", { description: getErrorMessage(err) })
  })

  // Public API
  const createUser = async (formData: CreateUserFormData) => {
    try {
      await createMutation.mutateAsync(formData)
      return true
    } catch {
      return false
    }
  }

  const updateGroup = async (userId: string, groupId: string) => {
    try {
      await updateGroupMutation.mutateAsync({ userId, groupId })
      return true
    } catch {
      return false
    }
  }

  const changePassword = async (userId: string, newPassword: string) => {
    await changePasswordMutation.mutateAsync({ userId, newPassword })
  }

  const deleteUser = async (userId: string) => {
    await deleteMutation.mutateAsync(userId)
  }

  return {
    loading: isLoading,
    actionLoading: createMutation.isPending || updateGroupMutation.isPending || changePasswordMutation.isPending || deleteMutation.isPending,
    groups: data?.groups || [],
    mysteries: data?.mysteries || [],
    members: data?.members || [],
    createUser,
    updateGroup,
    changePassword,
    deleteUser
  }
}

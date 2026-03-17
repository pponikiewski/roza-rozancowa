import { useState } from "react"
import type { AdminMember } from "@/features/admin/members/types/member.types"

const MIN_PASSWORD_LENGTH = 6

interface UseMemberDialogStateProps {
  member: AdminMember | null
  onUpdateGroup: (userId: string, groupId: string) => Promise<void>
  onChangePassword: (userId: string, newPassword: string) => Promise<void>
  onUpdateLogin: (userId: string, newLogin: string) => Promise<unknown>
  onDeleteUser: (userId: string, fullName: string) => void
  onOpenChange: (open: boolean) => void
}

/**
 * Hook zarządzający stanem dialogu szczegółów członka.
 * Wydziela logikę formularzy (login, hasło, grupa) z komponentu UI.
 */
export function useMemberDialogState({
  member,
  onUpdateGroup,
  onChangePassword,
  onUpdateLogin,
  onDeleteUser,
  onOpenChange,
}: UseMemberDialogStateProps) {
  const [editGroupId, setEditGroupId] = useState<string>("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [editLogin, setEditLogin] = useState("")
  const [isEditingLogin, setIsEditingLogin] = useState(false)

  // Inicjalizacja editGroupId gdy member się zmieni
  const currentGroupId = member?.groups?.id?.toString() || "unassigned"
  if (member && editGroupId === "" && currentGroupId !== editGroupId) {
    setEditGroupId(currentGroupId)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewPassword("")
      setEditGroupId("")
      setPasswordError(null)
      setEditLogin("")
      setIsEditingLogin(false)
    }
    onOpenChange(isOpen)
  }

  const handleUpdateGroup = async () => {
    if (!member) return
    await onUpdateGroup(member.id, editGroupId)
  }

  const handleChangePassword = async () => {
    if (!member) return
    const trimmedPassword = newPassword.trim()
    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Hasło musi mieć minimum ${MIN_PASSWORD_LENGTH} znaków`)
      return
    }
    setPasswordError(null)
    await onChangePassword(member.id, trimmedPassword)
    setNewPassword("")
  }

  const handleDelete = () => {
    if (!member) return
    onDeleteUser(member.id, member.full_name)
  }

  const handleSaveLogin = async () => {
    const success = await onUpdateLogin(member!.id, editLogin.trim())
    if (success) {
      setIsEditingLogin(false)
      setEditLogin("")
    }
  }

  const handleStartEditLogin = () => {
    setEditLogin(member?.login || "")
    setIsEditingLogin(true)
  }

  const handleCancelEditLogin = () => {
    setIsEditingLogin(false)
    setEditLogin("")
  }

  return {
    editGroupId,
    setEditGroupId,
    newPassword,
    setNewPassword,
    passwordError,
    setPasswordError,
    editLogin,
    setEditLogin,
    isEditingLogin,
    handleOpenChange,
    handleUpdateGroup,
    handleChangePassword,
    handleDelete,
    handleSaveLogin,
    handleStartEditLogin,
    handleCancelEditLogin,
  }
}

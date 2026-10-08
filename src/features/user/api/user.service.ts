import { supabase } from '@/shared/lib/supabase'
import { mysteriesService } from '@/features/mysteries/api/mysteries.service'
import { membersOverviewService } from '@/shared/api'
import { ADMISSION_INDULGENCE } from '@/shared/lib/constants'
import { isEaster } from '@/shared/lib/liturgical'
import type { Group, Profile, Intention, RoseMember, Mystery, IndulgenceDay } from '@/shared/types/domain.types'

/**
 * Serwis obsługujący panel użytkownika
 */
export const userService = {
  /**
   * Pobranie profilu użytkownika wraz z rolą i Różą (z dniem przyjęcia — potrzebny do odpustu)
   * Wywoływane raz przy logowaniu przez AuthContext, panel korzysta z cache
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, login, role, rose_pos, groups(id, name, admission_month, admission_day)')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data as Profile | null
  },

  /**
   * Pobranie intencji na bieżący miesiąc
   */
  async getCurrentIntention(): Promise<Intention | null> {
    const date = new Date()
    const { data } = await supabase
      .from('intentions')
      .select('title, content')
      .eq('month', date.getMonth() + 1)
      .eq('year', date.getFullYear())
      .maybeSingle()

    return (data as Intention) || null
  },

  /**
   * Pobranie odpustów przypadających dzisiaj:
   * stałe daty (co roku lub w bieżącym roku), Wielkanoc i dzień przyjęcia Róży użytkownika
   */
  async getTodayIndulgences(group: Group | null): Promise<IndulgenceDay[]> {
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()

    const dateFilter = `and(month.eq.${month},day.eq.${day},or(year.is.null,year.eq.${date.getFullYear()}))`
    const { data, error } = await supabase
      .from('indulgence_days')
      .select('id, name, description, month, day, year, is_easter')
      .or(isEaster(date) ? `${dateFilter},is_easter.eq.true` : dateFilter)

    if (error) throw error
    const indulgences: IndulgenceDay[] = data || []

    // Dzień przyjęcia Róży przychodzi razem z profilem — bez osobnego zapytania
    if (group?.admission_month === month && group?.admission_day === day) {
      indulgences.push({
        id: -group.id,
        ...ADMISSION_INDULGENCE,
        month,
        day,
        year: null,
        is_easter: false,
      })
    }

    return indulgences
  },

  /**
   * ID bieżącej tajemnicy użytkownika (wyliczane w bazie z pozycji w Róży i daty)
   */
  async getMysteryId(userId: string): Promise<number | null> {
    return await mysteriesService.getMysteryIdForUser(userId)
  },

  /**
   * Treść tajemnicy po ID — pobierana równolegle ze statusem potwierdzenia
   */
  async getMystery(mysteryId: number): Promise<Mystery> {
    return await mysteriesService.getMysteryById(mysteryId)
  },

  /**
   * Czy zalogowany użytkownik potwierdził tajemnicę w bieżącym okresie
   */
  async checkAcknowledgment(mysteryId: number): Promise<boolean> {
    return await mysteriesService.checkAcknowledgment(mysteryId)
  },

  /**
   * Potwierdzenie bieżącej tajemnicy zalogowanego użytkownika
   */
  async acknowledgeMystery(mysteryId: number): Promise<void> {
    await mysteriesService.acknowledgeMystery(mysteryId)
  },

  /**
   * Skład Róży z aktualnymi tajemnicami, według pozycji (jedno zapytanie)
   */
  async getRoseMembers(groupId: number): Promise<RoseMember[]> {
    const members = await membersOverviewService.get(groupId)

    return members.map(m => ({
      id: m.id,
      full_name: m.full_name,
      rose_pos: m.rose_pos,
      current_mystery_name: m.current_mystery_name ?? 'Brak przydziału'
    }))
  },
}

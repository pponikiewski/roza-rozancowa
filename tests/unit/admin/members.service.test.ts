import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Zmiana loginu: profiles i auth.users nie mogą się rozjechać.
 * Zapytania do Supabase są podstawiane — każde wywołanie from() zwraca kolejną zaplanowaną odpowiedź
 * i zapisuje, co zostało wywołane.
 */

type Result = { data?: unknown; error?: unknown }
const queue: Result[] = []
const calls: { table: string; ops: string[]; update?: unknown }[] = []
const invoke = vi.fn()

vi.mock('@/shared/lib/supabase', () => {
  const from = (table: string) => {
    const call: { table: string; ops: string[]; update?: unknown } = { table, ops: [] }
    calls.push(call)
    const builder: Record<string, unknown> = {}
    for (const op of ['select', 'eq', 'neq', 'single', 'maybeSingle']) {
      builder[op] = () => { call.ops.push(op); return builder }
    }
    builder.update = (values: unknown) => { call.ops.push('update'); call.update = values; return builder }
    builder.then = (resolve: (r: Result) => void) => resolve(queue.shift() ?? { data: null, error: null })
    return builder
  }
  return { supabase: { from, functions: { invoke } } }
})

const { membersService } = await import('@/features/admin/members/api/members.service')

const USER = 'user-1'
const updates = () => calls.filter((c) => c.ops.includes('update')).map((c) => c.update)

beforeEach(() => {
  queue.length = 0
  calls.length = 0
  invoke.mockReset()
})

describe('membersService.updateMemberLogin', () => {
  it('zmienia login w profilu, a potem w auth', async () => {
    queue.push(
      { data: { login: 'jan' } },          // obecny login
      { data: null },                      // login wolny
      { data: [{ id: USER }] },            // aktualizacja profilu
    )
    invoke.mockResolvedValue({ data: { success: true }, error: null })

    await membersService.updateMemberLogin(USER, ' jan.k ')

    expect(updates()).toEqual([{ login: 'jan.k' }])
    expect(invoke).toHaveBeenCalledWith('update-user-login', {
      body: { user_id: USER, new_internal_email: 'jan.k@noemail.local' },
    })
  })

  it('przywraca stary login w profilu, gdy zmiana w auth się nie uda', async () => {
    queue.push(
      { data: { login: 'jan' } },
      { data: null },
      { data: [{ id: USER }] },
      { data: null, error: null },         // przywrócenie
    )
    invoke.mockResolvedValue({ data: null, error: { message: 'Email już istnieje' } })

    await expect(membersService.updateMemberLogin(USER, 'jan.k')).rejects.toThrow('Email już istnieje')
    expect(updates()).toEqual([{ login: 'jan.k' }, { login: 'jan' }])
  })

  it('mówi wprost, gdy nie da się też przywrócić starego loginu', async () => {
    queue.push(
      { data: { login: 'jan' } },
      { data: null },
      { data: [{ id: USER }] },
      { data: null, error: { message: 'brak sieci' } },
    )
    invoke.mockResolvedValue({ data: null, error: { message: 'Email już istnieje' } })

    await expect(membersService.updateMemberLogin(USER, 'jan.k')).rejects.toThrow(/stary login \(jan\)/)
  })

  it('nie zmienia niczego, gdy login jest zajęty', async () => {
    queue.push({ data: { login: 'jan' } }, { data: { id: 'ktos-inny' } })

    await expect(membersService.updateMemberLogin(USER, 'ewa')).rejects.toThrow('Ten login jest już zajęty')
    expect(updates()).toEqual([])
    expect(invoke).not.toHaveBeenCalled()
  })

  it('nie zmienia auth, gdy aktualizacja profilu nie objęła żadnego wiersza (brak uprawnień)', async () => {
    queue.push({ data: { login: 'jan' } }, { data: null }, { data: [] })

    await expect(membersService.updateMemberLogin(USER, 'jan.k')).rejects.toThrow('Nie udało się zmienić loginu')
    expect(invoke).not.toHaveBeenCalled()
  })

  it('ten sam login tylko wyrównuje auth z profilem (naprawa wcześniejszego rozjazdu)', async () => {
    queue.push({ data: { login: 'jan.k' } })
    invoke.mockResolvedValue({ data: { success: true }, error: null })

    await membersService.updateMemberLogin(USER, 'jan.k')

    expect(updates()).toEqual([])
    expect(invoke).toHaveBeenCalledTimes(1)
  })

  it('odrzuca login krótszy niż 3 znaki', async () => {
    await expect(membersService.updateMemberLogin(USER, ' ab ')).rejects.toThrow('minimum 3 znaki')
    expect(calls).toEqual([])
  })
})

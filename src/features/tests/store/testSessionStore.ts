import { create } from 'zustand'
import { getDictionary } from '@/locales'
import { toAppError, type AppError } from '@/services/supabase/errors'
import { toast } from '@/store/toastStore'
import type { ActiveTestSession } from '@/types'
import { testsApi } from '../api/testsApi'

type Phase = 'idle' | 'loading' | 'ready' | 'submitting' | 'submitted' | 'error'

interface TestSessionState {
  phase: Phase
  session: ActiveTestSession | null
  /** question_id → selected option index */
  answers: Record<string, number>
  current: number
  /** serverNow - clientNow in ms, so the countdown follows the server clock */
  clockOffset: number
  error: AppError | null
  load: (sessionId: string) => Promise<void>
  select: (questionId: string, index: number) => void
  goTo: (index: number) => void
  next: () => void
  prev: () => void
  /** Final submission. Returns the session id on success. */
  submit: () => Promise<string | null>
  reset: () => void
}

const initial = {
  phase: 'idle' as Phase,
  session: null,
  answers: {},
  current: 0,
  clockOffset: 0,
  error: null,
}

export const useTestSessionStore = create<TestSessionState>((set, get) => ({
  ...initial,

  load: async (sessionId) => {
    set({ ...initial, phase: 'loading' })
    try {
      const session = await testsApi.getSession(sessionId)
      const answers: Record<string, number> = {}
      for (const q of session.questions) {
        if (q.selected_index != null) answers[q.id] = q.selected_index
      }
      // resume at the first unanswered question
      const firstOpen = session.questions.findIndex((q) => answers[q.id] == null)
      set({
        session,
        answers,
        current: firstOpen === -1 ? 0 : firstOpen,
        clockOffset: new Date(session.server_now).getTime() - Date.now(),
        phase: session.status === 'in_progress' ? 'ready' : 'submitted',
      })
    } catch (err) {
      set({ phase: 'error', error: toAppError(err) })
    }
  },

  select: (questionId, index) => {
    const { session, phase, answers } = get()
    if (!session || phase !== 'ready') return // answers are locked after submission
    const previous = answers[questionId]
    if (previous === index) return
    set({ answers: { ...answers, [questionId]: index } })

    testsApi.saveAnswer(session.id, questionId, index).catch((err: unknown) => {
      const { code } = toAppError(err)
      // time is over or the session closed: the final submit will handle it
      if (code === 'time_expired' || code === 'session_closed') return
      toast.error(getDictionary().tests.saveError)
    })
  },

  goTo: (index) => {
    const total = get().session?.questions.length ?? 0
    if (index >= 0 && index < total) set({ current: index })
  },
  next: () => get().goTo(get().current + 1),
  prev: () => get().goTo(get().current - 1),

  submit: async () => {
    const { session, phase, answers } = get()
    if (!session || phase === 'submitting' || phase === 'submitted') return session?.id ?? null
    set({ phase: 'submitting' })
    try {
      const id = await testsApi.submit(session.id, answers)
      set({ phase: 'submitted' })
      return id
    } catch (err) {
      set({ phase: 'ready' })
      throw err
    }
  },

  reset: () => set(initial),
}))

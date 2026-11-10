import { supabase } from '@/services/supabase/client'
import { unwrap } from '@/services/supabase/errors'
import type {
  ActiveTestSession,
  AppSettings,
  TestConfig,
  TestResult,
  Technology,
} from '@/types'

/**
 * All test logic goes through SECURITY DEFINER RPCs:
 * the client never receives correct answers before submission.
 */
export const testsApi = {
  async listTechnologies(includeInactive = false): Promise<Technology[]> {
    let query = supabase.from('technologies').select('*').order('sort_order')
    if (!includeInactive) query = query.eq('is_active', true)
    return unwrap(await query) as Technology[]
  },

  async getSettings(): Promise<AppSettings> {
    return unwrap(await supabase.from('app_settings').select('*').eq('id', 1).single()) as AppSettings
  },

  async start(config: TestConfig): Promise<string> {
    return unwrap(
      await supabase.rpc('start_test', {
        p_technologies: config.optionalTechnologies,
        p_difficulty: config.difficulty,
        p_question_count: config.questionCount,
        p_duration_minutes: config.durationMinutes,
      }),
    ) as string
  },

  async getActiveSessionId(): Promise<string | null> {
    return (unwrap(await supabase.rpc('get_active_session_id')) as string | null) ?? null
  },

  async getSession(sessionId: string): Promise<ActiveTestSession> {
    return unwrap(
      await supabase.rpc('get_test_session', { p_session_id: sessionId }),
    ) as ActiveTestSession
  },

  async saveAnswer(sessionId: string, questionId: string, selectedIndex: number | null) {
    unwrap(
      await supabase.rpc('save_answer', {
        p_session_id: sessionId,
        p_question_id: questionId,
        p_selected_index: selectedIndex,
      }),
    )
  },

  async submit(sessionId: string, answers: Record<string, number>): Promise<string> {
    return unwrap(
      await supabase.rpc('submit_test', { p_session_id: sessionId, p_answers: answers }),
    ) as string
  },

  async getResult(sessionId: string): Promise<TestResult> {
    const result = unwrap(
      await supabase.rpc('get_test_result', { p_session_id: sessionId }),
    ) as TestResult
    return { ...result, score_percent: Number(result.score_percent) }
  },
}

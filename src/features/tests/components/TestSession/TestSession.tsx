import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Flag, LogOut } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Button, Card, ConfirmDialog, ErrorState, ProgressBar, Spinner } from '@/components/ui'
import { LogoMark } from '@/components/shared'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { useCountdown } from '../../hooks/useCountdown'
import { useTestSessionStore } from '../../store/testSessionStore'
import { CountdownTimer } from '../CountdownTimer/CountdownTimer'
import { QuestionCard } from '../QuestionCard/QuestionCard'
import { QuestionNavigator, type NavState } from '../QuestionNavigator/QuestionNavigator'
import styles from './TestSession.module.scss'

/** Full-screen test-taking experience. Correct answers never reach this screen. */
export function TestSession({ sessionId }: { sessionId: string }) {
  const { t, f } = useI18n()
  useDocumentTitle(t.nav.tests)
  const navigate = useNavigate()
  const toMessage = useErrorMessage()
  const refreshProfile = useAuthStore((s) => s.refreshProfile)

  const { phase, session, answers, current, clockOffset, error } = useTestSessionStore()
  const { load, select, goTo, next, prev, submit, reset } = useTestSessionStore.getState()

  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  useEffect(() => {
    void load(sessionId)
    return () => reset()
  }, [sessionId, load, reset])

  const finish = useCallback(async () => {
    try {
      const id = await submit()
      if (id) {
        void refreshProfile()
        navigate(`/tests/result/${id}`, { replace: true })
      }
    } catch (err) {
      setTimeUp(false)
      toast.error(toMessage(err))
    }
  }, [submit, refreshProfile, navigate, toMessage])

  const handleExpire = useCallback(() => {
    if (useTestSessionStore.getState().phase !== 'ready') return
    setTimeUp(true)
    setConfirmSubmit(false)
    void finish()
  }, [finish])

  const remaining = useCountdown(phase === 'ready' ? session?.expires_at : undefined, clockOffset, handleExpire)

  // Keyboard: 1–4 select, ←/→ navigate
  useEffect(() => {
    if (phase !== 'ready' || !session) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (confirmSubmit || confirmExit || target.closest('input, textarea, [role="dialog"]')) return
      const q = session.questions[useTestSessionStore.getState().current]
      if (['1', '2', '3', '4'].includes(e.key) && q) select(q.id, Number(e.key) - 1)
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, session, confirmSubmit, confirmExit, select, next, prev])

  // Warn before closing the tab during a running test
  useEffect(() => {
    if (phase !== 'ready') return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [phase])

  const navStates = useMemo<NavState[]>(
    () => session?.questions.map((q) => (answers[q.id] != null ? 'answered' : 'empty')) ?? [],
    [session, answers],
  )

  if (phase === 'idle' || phase === 'loading') return <Spinner label={t.tests.loadingSession} />
  if (phase === 'error' || !session) {
    return (
      <div className={styles.screen}>
        <ErrorState message={error ? toMessage(error) : t.errors.generic} onRetry={() => void load(sessionId)} />
      </div>
    )
  }
  if (session.status === 'submitted') return <Navigate to={`/tests/result/${session.id}`} replace />
  if (session.status === 'abandoned') {
    return (
      <div className={styles.screen}>
        <ErrorState message={t.errors.session_abandoned} onRetry={() => navigate('/tests')} />
      </div>
    )
  }

  const question = session.questions[current]
  const total = session.questions.length
  const answeredCount = Object.keys(answers).length
  const unanswered = total - answeredCount
  const locked = phase !== 'ready'

  return (
    <div className={styles.screen}>
      <header className={styles.topbar}>
        <LogoMark className={styles.mark} />
        <div className={styles.progressWrap}>
          <div className={styles.progressText}>
            <span>
              <b>{answeredCount}</b> / {total} {t.tests.answered.toLowerCase()}
            </span>
            <span className={styles.hideMobile}>{t.tests.keyboardHint}</span>
          </div>
          <ProgressBar value={answeredCount} max={total} height={6} label={t.tests.answered} />
        </div>
        <CountdownTimer remaining={remaining} total={session.duration_seconds} />
        <Button variant="ghost" size="sm" icon={<LogOut />} onClick={() => setConfirmExit(true)} className={styles.hideMobile}>
          {t.tests.exit}
        </Button>
      </header>

      <div className={styles.body}>
        <Card className={styles.questionCard}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <QuestionCard
                number={current + 1}
                total={total}
                technology={question.technology}
                difficulty={question.difficulty}
                question={question.question}
                code={question.code}
                options={question.options}
                disabled={locked}
                optionState={(i) => (answers[question.id] === i ? 'selected' : 'idle')}
                onSelect={(i) => select(question.id, i)}
              />
            </motion.div>
          </AnimatePresence>
          <div className={styles.controls}>
            <Button variant="secondary" icon={<ArrowLeft />} onClick={prev} disabled={current === 0}>
              {t.common.previous}
            </Button>
            {current < total - 1 ? (
              <Button iconRight={<ArrowRight />} onClick={next}>
                {t.common.next}
              </Button>
            ) : (
              <Button icon={<Flag />} onClick={() => setConfirmSubmit(true)} disabled={locked}>
                {t.tests.finish}
              </Button>
            )}
          </div>
        </Card>

        <aside className={styles.side}>
          <Card padding="sm">
            <div className={styles.sideStats}>
              <div>
                <span>{t.tests.answered}</span>
                <strong>{answeredCount}</strong>
              </div>
              <div>
                <span>{t.tests.unanswered}</span>
                <strong>{unanswered}</strong>
              </div>
            </div>
            <QuestionNavigator states={navStates} current={current} onSelect={goTo} showLegend />
          </Card>
          <Button size="lg" fullWidth icon={<Flag />} onClick={() => setConfirmSubmit(true)} disabled={locked}>
            {t.tests.finish}
          </Button>
          <Button variant="ghost" fullWidth icon={<LogOut />} onClick={() => setConfirmExit(true)}>
            {t.tests.exit}
          </Button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmSubmit}
        title={t.tests.submitTitle}
        description={f(t.tests.submitText, { answered: answeredCount, total })}
        confirmLabel={phase === 'submitting' ? t.tests.submitting : t.tests.submit}
        loading={phase === 'submitting'}
        onConfirm={() => void finish()}
        onClose={() => setConfirmSubmit(false)}
      >
        {unanswered > 0 && <p style={{ color: 'var(--warning)' }}>{f(t.tests.unansweredWarning, { count: unanswered })}</p>}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmExit}
        title={t.tests.exitTitle}
        description={t.tests.exitText}
        confirmLabel={t.tests.exitConfirm}
        onConfirm={() => navigate('/')}
        onClose={() => setConfirmExit(false)}
      />

      {timeUp && (
        <div className={styles.overlay} role="alert">
          <Spinner />
          {t.tests.timeUp}
        </div>
      )}
    </div>
  )
}

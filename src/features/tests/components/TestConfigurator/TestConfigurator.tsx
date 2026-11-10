import { AlertTriangle, CheckCircle2, Clock, Gauge, Layers, ListChecks, Lock, Play, Sparkles, Zap } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { Badge, Button, Card, CardHeader, ConfirmDialog, LinkButton } from '@/components/ui'
import { TechChips } from '@/components/shared'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toast } from '@/store/toastStore'
import type { AppSettings, Technology, TestDifficulty } from '@/types'
import { testsApi } from '../../api/testsApi'
import { estimateMaxXp } from '../../lib/xp'
import { RangeField } from '../RangeField/RangeField'
import { TechnologyCard } from '../TechnologyCard/TechnologyCard'
import styles from './TestConfigurator.module.scss'

const DIFFICULTIES: { value: TestDifficulty; tone: string }[] = [
  { value: 'easy', tone: 'var(--success)' },
  { value: 'medium', tone: 'var(--warning)' },
  { value: 'hard', tone: 'var(--danger)' },
  { value: 'mixed', tone: 'var(--secondary)' },
]

interface TestConfiguratorProps {
  technologies: Technology[]
  settings: AppSettings
  activeSessionId: string | null
  /** optional preset from recommendations (?tech=typescript&difficulty=hard) */
  preset?: { optional?: string[]; difficulty?: TestDifficulty }
}

export function TestConfigurator({ technologies, settings, activeSessionId, preset }: TestConfiguratorProps) {
  const { t, f } = useI18n()
  const navigate = useNavigate()
  const toMessage = useErrorMessage()

  const core = useMemo(() => technologies.filter((x) => x.is_core), [technologies])
  const optional = useMemo(() => technologies.filter((x) => !x.is_core), [technologies])

  const [selected, setSelected] = useState<string[]>(() =>
    (preset?.optional ?? []).filter((id) => optional.some((o) => o.id === id)),
  )
  const [difficulty, setDifficulty] = useState<TestDifficulty>(preset?.difficulty ?? 'mixed')
  const [count, setCount] = useState(settings.default_questions)
  const [minutes, setMinutes] = useState(settings.default_duration_minutes)
  const [starting, setStarting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const allIds = [...core.map((x) => x.id), ...selected]
  const maxXp = estimateMaxXp(settings, difficulty, count)

  const start = async () => {
    setConfirmOpen(false)
    setStarting(true)
    try {
      const id = await testsApi.start({
        optionalTechnologies: selected,
        difficulty,
        questionCount: count,
        durationMinutes: minutes,
      })
      navigate(`/tests/session/${id}`)
    } catch (err) {
      toast.error(toMessage(err))
      setStarting(false)
    }
  }

  return (
    <>
      {activeSessionId && (
        <div className={styles.banner}>
          <p>
            <AlertTriangle aria-hidden />
            {t.tests.activeSession}
          </p>
          <LinkButton to={`/tests/session/${activeSessionId}`} size="sm" variant="outline" icon={<Play />}>
            {t.tests.continue}
          </LinkButton>
        </div>
      )}

      <div className={styles.layout}>
        <div className="stack">
          <Card>
            <CardHeader title={t.tests.coreTitle} subtitle={t.tests.coreHint} icon={<Lock />} action={<Badge tone="primary">{t.common.required}</Badge>} />
            <div className={styles.techGrid}>
              {core.map((tech) => (
                <TechnologyCard key={tech.id} technology={tech} selected />
              ))}
            </div>
          </Card>

          {optional.length > 0 && (
            <Card>
              <CardHeader
                title={t.tests.optionalTitle}
                subtitle={t.tests.optionalHint}
                icon={<Sparkles />}
                action={<Badge tone="secondary">{t.common.optional}</Badge>}
              />
              <div className={styles.techGrid}>
                {optional.map((tech) => (
                  <TechnologyCard key={tech.id} technology={tech} selected={selected.includes(tech.id)} onToggle={toggle} />
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title={t.tests.difficulty} icon={<Gauge />} />
            <div className={styles.difficulties} role="radiogroup" aria-label={t.tests.difficulty}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === d.value}
                  className={styles.difficulty}
                  style={{ '--tone': d.tone } as CSSProperties}
                  onClick={() => setDifficulty(d.value)}
                >
                  <strong>
                    <i aria-hidden />
                    {t.tests.difficulties[d.value]}
                  </strong>
                  <span>{t.tests.difficultyHints[d.value]}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className={styles.sliders}>
              <RangeField
                label={t.tests.questionCount}
                unit={t.common.questions}
                value={count}
                min={settings.min_questions}
                max={settings.max_questions}
                onChange={setCount}
              />
              <RangeField
                label={t.tests.duration}
                unit={t.common.minutes}
                value={minutes}
                min={settings.min_duration_minutes}
                max={settings.max_duration_minutes}
                onChange={setMinutes}
              />
            </div>
          </Card>
        </div>

        <aside className={styles.summary}>
          <Card glow>
            <CardHeader title={t.tests.summary} icon={<ListChecks />} />
            <ul className={styles.summaryList}>
              <li>
                <span>{t.dashboard.technologies}</span>
                <span>{f(t.tests.summaryTech, { count: allIds.length })}</span>
              </li>
              <li>
                <span>{t.tests.difficulty}</span>
                <span>{t.tests.difficulties[difficulty]}</span>
              </li>
              <li>
                <span>
                  <Layers size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {t.tests.questionCount}
                </span>
                <span>{count}</span>
              </li>
              <li>
                <span>
                  <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {t.tests.duration}
                </span>
                <span>
                  {minutes} {t.common.minutes}
                </span>
              </li>
              <li>
                <span>
                  <Zap size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> XP
                </span>
                <span>{f(t.tests.estimatedXp, { xp: maxXp })}</span>
              </li>
            </ul>
            <TechChips ids={allIds} technologies={technologies} />
            <ul className={styles.rules}>
              {t.tests.rules.map((rule) => (
                <li key={rule}>
                  <CheckCircle2 aria-hidden />
                  {rule}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              fullWidth
              icon={<Play />}
              loading={starting}
              onClick={() => (activeSessionId ? setConfirmOpen(true) : start())}
            >
              {starting ? t.tests.starting : t.tests.start}
            </Button>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t.tests.activeSession}
        description={t.tests.activeSessionHint}
        confirmLabel={t.tests.start}
        danger
        onConfirm={start}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}

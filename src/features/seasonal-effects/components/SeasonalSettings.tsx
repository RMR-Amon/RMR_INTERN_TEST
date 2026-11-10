import { Apple, Flower2, Leaf, Snowflake, Sparkles, Wand2 } from 'lucide-react'
import { Card, CardHeader, SegmentedControl, Switch } from '@/components/ui'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { useI18n } from '@/locales'
import { usePreferencesStore, type SeasonalIntensity, type SeasonOverride } from '@/store/preferencesStore'
import { useSeason } from '../hooks/useSeason'
import styles from './SeasonalSettings.module.scss'

/** User controls for the seasonal animation system. */
export function SeasonalSettings() {
  const { t } = useI18n()
  const reduced = usePrefersReducedMotion()
  const { autoSeason } = useSeason()
  const enabled = usePreferencesStore((s) => s.seasonalEnabled)
  const intensity = usePreferencesStore((s) => s.seasonalIntensity)
  const override = usePreferencesStore((s) => s.seasonOverride)
  const { setSeasonalEnabled, setSeasonalIntensity, setSeasonOverride } = usePreferencesStore.getState()

  return (
    <Card>
      <CardHeader title={t.settings.seasonal} subtitle={t.settings.seasonalHint} icon={<Sparkles />} />
      <div className={styles.list}>
        <Switch checked={enabled} onChange={setSeasonalEnabled} label={t.settings.seasonalEnabled} />
        {reduced && <p className={styles.notice}>{t.settings.reducedMotion}</p>}
        <div className={styles.row}>
          <span className={styles.label}>{t.settings.intensity}</span>
          <SegmentedControl<SeasonalIntensity>
            ariaLabel={t.settings.intensity}
            value={intensity}
            onChange={setSeasonalIntensity}
            options={(['low', 'medium', 'high'] as const).map((v) => ({ value: v, label: t.settings.intensities[v] }))}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t.settings.season}</span>
          <SegmentedControl<SeasonOverride>
            ariaLabel={t.settings.season}
            value={override}
            onChange={setSeasonOverride}
            options={[
              { value: 'auto', label: t.settings.seasonAuto.replace('{season}', t.seasons.names[autoSeason]), icon: <Wand2 /> },
              { value: 'spring', label: t.seasons.names.spring, icon: <Flower2 /> },
              { value: 'summer', label: t.seasons.names.summer, icon: <Apple /> },
              { value: 'autumn', label: t.seasons.names.autumn, icon: <Leaf /> },
              { value: 'winter', label: t.seasons.names.winter, icon: <Snowflake /> },
            ]}
          />
        </div>
      </div>
    </Card>
  )
}

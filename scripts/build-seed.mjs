/**
 * Generates supabase/seed.sql from the question bank in supabase/seed/questions.
 *   npm run seed:build
 * Validates every question (ids, 3 languages, 4 options, answer index) first.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import html from '../supabase/seed/questions/html.mjs'
import css from '../supabase/seed/questions/css.mjs'
import javascript from '../supabase/seed/questions/javascript.mjs'
import react from '../supabase/seed/questions/react.mjs'
import typescript from '../supabase/seed/questions/typescript.mjs'
import scss from '../supabase/seed/questions/scss.mjs'
import tailwind from '../supabase/seed/questions/tailwind.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LANGS = ['uz', 'ru', 'en']
const XP = { easy: 10, medium: 15, hard: 20 }

const technologies = [
  { id: 'html', name: 'HTML', core: true, color: '#f97316', order: 1,
    d: ['Semantika, formalar, accessibility', 'Семантика, формы, доступность', 'Semantics, forms, accessibility'] },
  { id: 'css', name: 'CSS', core: true, color: '#3b82f6', order: 2,
    d: ['Box model, Flexbox, Grid, kaskad', 'Box model, Flexbox, Grid, каскад', 'Box model, Flexbox, Grid, cascade'] },
  { id: 'javascript', name: 'JavaScript', core: true, color: '#eab308', order: 3,
    d: ['Closure, event loop, async', 'Замыкания, event loop, async', 'Closures, event loop, async'] },
  { id: 'react', name: 'React', core: true, color: '#22d3ee', order: 4,
    d: ['Hook’lar, holat, renderlash', 'Хуки, состояние, рендеринг', 'Hooks, state, rendering'] },
  { id: 'typescript', name: 'TypeScript', core: false, color: '#2563eb', order: 5,
    d: ['Tiplar, generic’lar, utility tiplar', 'Типы, дженерики, utility-типы', 'Types, generics, utility types'] },
  { id: 'scss', name: 'SCSS / Sass', core: false, color: '#ec4899', order: 6,
    d: ['Mixin’lar, modullar, funksiyalar', 'Миксины, модули, функции', 'Mixins, modules, functions'] },
  { id: 'tailwind', name: 'Tailwind CSS', core: false, color: '#06b6d4', order: 7,
    d: ['Utility-first, variantlar, responsive', 'Utility-first, варианты, адаптив', 'Utility-first, variants, responsive'] },
]

const loc = (uz, ru, en) => ({ uz, ru, en })

const achievements = [
  { id: 'first_steps', icon: 'rocket', tier: 'bronze', xp: 10, type: 'tests_completed', value: 1, order: 1,
    title: loc('Birinchi qadam', 'Первый шаг', 'First Steps'),
    desc: loc('Birinchi testni yakunlang', 'Завершите первый тест', 'Complete your first test') },
  { id: 'getting_serious', icon: 'target', tier: 'silver', xp: 30, type: 'tests_completed', value: 10, order: 2,
    title: loc('Jiddiy yondashuv', 'Серьёзный настрой', 'Getting Serious'),
    desc: loc('10 ta testni yakunlang', 'Завершите 10 тестов', 'Complete 10 tests') },
  { id: 'marathon', icon: 'medal', tier: 'gold', xp: 100, type: 'tests_completed', value: 50, order: 3,
    title: loc('Marafonchi', 'Марафонец', 'Marathoner'),
    desc: loc('50 ta testni yakunlang', 'Завершите 50 тестов', 'Complete 50 tests') },
  { id: 'sharp_mind', icon: 'brain', tier: 'silver', xp: 25, type: 'score_at_least', value: 90, order: 4,
    title: loc('O‘tkir zehn', 'Острый ум', 'Sharp Mind'),
    desc: loc('Testda kamida 90% natija oling', 'Наберите не менее 90% в тесте', 'Score at least 90% in a test') },
  { id: 'flawless', icon: 'crown', tier: 'gold', xp: 50, type: 'score_at_least', value: 100, order: 5,
    title: loc('Benuqson', 'Безупречно', 'Flawless'),
    desc: loc('Testda 100% natija oling', 'Наберите 100% в тесте', 'Score 100% in a test') },
  { id: 'hardcore', icon: 'flame', tier: 'gold', xp: 60, type: 'hard_score', value: 70, order: 6,
    title: loc('Hardcore', 'Хардкор', 'Hardcore'),
    desc: loc('Qiyin darajadagi testda kamida 70% oling', 'Наберите не менее 70% в тесте сложного уровня', 'Score at least 70% on a hard test') },
  { id: 'full_stack_front', icon: 'layers', tier: 'platinum', xp: 80, type: 'all_technologies', value: 70, order: 7,
    title: loc('Universal frontendchi', 'Универсальный фронтендер', 'All-round Frontender'),
    desc: loc('Barcha 7 texnologiya bo‘yicha testda kamida 70% oling', 'Наберите не менее 70% в тесте по всем 7 технологиям', 'Score at least 70% on a test with all 7 technologies') },
  { id: 'streak_3', icon: 'zap', tier: 'bronze', xp: 20, type: 'streak', value: 3, order: 8,
    title: loc('Ketma-ketlik', 'Серия', 'On a Roll'),
    desc: loc('3 kun ketma-ket test topshiring', 'Проходите тесты 3 дня подряд', 'Take tests 3 days in a row') },
  { id: 'streak_7', icon: 'calendar', tier: 'gold', xp: 70, type: 'streak', value: 7, order: 9,
    title: loc('Haftalik intizom', 'Недельная дисциплина', 'Weekly Discipline'),
    desc: loc('7 kun ketma-ket test topshiring', 'Проходите тесты 7 дней подряд', 'Take tests 7 days in a row') },
  { id: 'level_5', icon: 'trending-up', tier: 'silver', xp: 40, type: 'level', value: 5, order: 10,
    title: loc('O‘sish', 'Рост', 'Level Up'),
    desc: loc('5-darajaga yeting', 'Достигните 5 уровня', 'Reach level 5') },
  { id: 'level_10', icon: 'star', tier: 'platinum', xp: 120, type: 'level', value: 10, order: 11,
    title: loc('Yulduz', 'Звезда', 'Rising Star'),
    desc: loc('10-darajaga yeting', 'Достигните 10 уровня', 'Reach level 10') },
  { id: 'xp_1000', icon: 'sparkles', tier: 'gold', xp: 50, type: 'total_xp', value: 1000, order: 12,
    title: loc('Ming XP', 'Тысяча XP', 'XP Collector'),
    desc: loc('Jami 1000 XP to‘plang', 'Наберите 1000 XP', 'Earn 1000 XP in total') },
]

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const all = [...html, ...css, ...javascript, ...react, ...typescript, ...scss, ...tailwind]
const ids = new Set()
const techIds = new Set(technologies.map((x) => x.id))
const errors = []

for (const item of all) {
  if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`)
  ids.add(item.id)
  if (!techIds.has(item.tech)) errors.push(`${item.id}: unknown technology ${item.tech}`)
  if (!XP[item.diff]) errors.push(`${item.id}: bad difficulty`)
  if (![0, 1, 2, 3].includes(item.a)) errors.push(`${item.id}: bad answer index`)
  for (const field of ['q', 'e']) {
    for (const l of LANGS) if (!item[field]?.[l]?.trim()) errors.push(`${item.id}: missing ${field}.${l}`)
  }
  item.o.forEach((opt, i) => {
    for (const l of LANGS) if (!opt[l]?.trim()) errors.push(`${item.id}: option ${i} missing ${l}`)
  })
  const optionTexts = new Set(item.o.map((o) => o.en))
  if (optionTexts.size !== 4) errors.push(`${item.id}: duplicate options`)
}
if (all.length < 100) errors.push(`only ${all.length} questions (need >= 100)`)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------
const lit = (value) => (value == null ? 'null' : `'${String(value).replace(/'/g, "''")}'`)
const json = (value) => `${lit(JSON.stringify(value))}::jsonb`

const out = []
out.push('-- AUTO-GENERATED by scripts/build-seed.mjs — do not edit by hand.')
out.push('-- Run AFTER migrations 0001_schema.sql and 0002_functions.sql.\n')
out.push('begin;\n')

out.push('insert into public.app_settings (id) values (1) on conflict (id) do nothing;\n')

out.push('insert into public.technologies (id, name, is_core, is_active, color, sort_order, description) values')
out.push(
  technologies
    .map((x) => `  (${lit(x.id)}, ${lit(x.name)}, ${x.core}, true, ${lit(x.color)}, ${x.order}, ${json(loc(...x.d))})`)
    .join(',\n'),
)
out.push('on conflict (id) do update set name = excluded.name, is_core = excluded.is_core, color = excluded.color,')
out.push('  sort_order = excluded.sort_order, description = excluded.description;\n')

out.push('insert into public.achievements (id, title, description, icon, tier, xp_bonus, condition_type, condition_value, sort_order) values')
out.push(
  achievements
    .map((a) => `  (${lit(a.id)}, ${json(a.title)}, ${json(a.desc)}, ${lit(a.icon)}, ${lit(a.tier)}, ${a.xp}, ${lit(a.type)}, ${a.value}, ${a.order})`)
    .join(',\n'),
)
out.push('on conflict (id) do update set title = excluded.title, description = excluded.description, icon = excluded.icon,')
out.push('  tier = excluded.tier, xp_bonus = excluded.xp_bonus, condition_type = excluded.condition_type,')
out.push('  condition_value = excluded.condition_value, sort_order = excluded.sort_order;\n')

out.push('insert into public.questions (id, technology, difficulty, question, code, options, correct_index, explanation, xp_reward) values')
out.push(
  all
    .map((x) =>
      `  (${lit(x.id)}, ${lit(x.tech)}, ${lit(x.diff)}, ${json(x.q)}, ${lit(x.code ?? null)}, ${json(x.o)}, ${x.a}, ${json(x.e)}, ${XP[x.diff]})`,
    )
    .join(',\n'),
)
out.push('on conflict (id) do update set technology = excluded.technology, difficulty = excluded.difficulty,')
out.push('  question = excluded.question, code = excluded.code, options = excluded.options,')
out.push('  correct_index = excluded.correct_index, explanation = excluded.explanation, xp_reward = excluded.xp_reward;\n')

out.push('commit;')

writeFileSync(resolve(root, 'supabase/seed.sql'), out.join('\n') + '\n', 'utf8')

const byTech = all.reduce((acc, x) => ({ ...acc, [x.tech]: (acc[x.tech] ?? 0) + 1 }), {})
const byDiff = all.reduce((acc, x) => ({ ...acc, [x.diff]: (acc[x.diff] ?? 0) + 1 }), {})
const byAnswer = all.reduce((acc, x) => ({ ...acc, [x.a]: (acc[x.a] ?? 0) + 1 }), {})
console.log(`✔ supabase/seed.sql — ${all.length} questions`, byTech, byDiff, 'answers:', byAnswer)

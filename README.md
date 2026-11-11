# R_M_R TEST FOR INTERN

Платформа для проверки frontend-знаний студентов MARS IT: тесты по HTML, CSS, JavaScript, React (обязательные) и TypeScript, SCSS/Sass, Tailwind CSS (по выбору). Студенты зарабатывают XP, повышают уровень, получают достижения и соревнуются в рейтинге.

**Стек:** React 19 · TypeScript (strict) · Vite · React Router · SCSS Modules · Zustand · Supabase · Framer Motion · Lucide · Canvas

---

## Быстрый старт

### 1. Supabase
1. Создайте проект на [supabase.com](https://supabase.com).
2. Откройте **SQL Editor** и выполните по порядку:
   1. `supabase/migrations/0001_schema.sql` — таблицы, индексы, RLS, bucket для аватаров
   2. `supabase/migrations/0002_functions.sql` — серверная логика (тесты, подсчёт баллов, XP, рейтинг, админ-RPC)
   3. `supabase/seed.sql` — технологии, достижения, настройки и 100 вопросов
   4. `supabase/migrations/0003_auth_hardening.sql` — вход по username/email, коды подтверждения email, свободный формат username
   5. `supabase/migrations/0004_admin_tools.sql` — просмотр email и удаление аккаунтов в админке
3. **Authentication → URL Configuration:**
   - *Site URL*: `http://localhost:5173` (в продакшене — ваш домен)
   - *Redirect URLs*: добавьте `http://localhost:5173/reset-password` и `http://localhost:5173/login`
4. **Регистрация с кодом из Gmail** (Edge Function `supabase/functions/signup`):
   - Задеплойте функцию: `supabase functions deploy signup --no-verify-jwt`
   - В Google-аккаунте включите двухэтапную проверку и создайте **пароль приложения** (myaccount.google.com/apppasswords)
   - Добавьте секреты (**Edge Functions → Secrets**): `GMAIL_USER` — адрес Gmail, `GMAIL_APP_PASSWORD` — пароль приложения
   - Письма приходят от имени **R_M_R**. Код — 6 цифр, действует 10 минут, 5 попыток, повторная отправка раз в минуту (не более 5 в час)
   - Рекомендуется выключить **Authentication → Sign In / Providers → Allow new users to sign up**: аккаунты создаёт только функция после проверки кода, а прямой `signUp` через публичный ключ станет недоступен

### 2. Переменные окружения
```bash
cp .env.example .env.local
```
Заполните значения из **Project Settings → API**:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # ТОЛЬКО публичный anon key
```
> ⚠️ Никогда не кладите `service_role` ключ во frontend. Он здесь не нужен — вся защита на RLS и SECURITY DEFINER функциях.

### 3. Запуск
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # проверка типов + production-сборка
npm run lint
```

### 4. Назначить администратора
Зарегистрируйтесь в приложении, затем в SQL Editor:
```sql
update public.profiles set role = 'admin' where username = 'ваш_username';
```
После перезахода в сайдбаре появится раздел «Администрирование».

Возможности админ-панели (`/admin`): статистика платформы; студенты — просмотр email, редактирование имени и username, назначение роли, блокировка, начисление/списание XP, сброс прогресса, выдача достижений, удаление аккаунта; банк вопросов (UZ/RU/EN); категории; достижения; история тестов; настройки тестов и XP.

Сменить пароль можно в **Настройки → Пароль**.

---

## Безопасность и честный рейтинг

| Механизм | Как реализовано |
|---|---|
| Правильные ответы не утекают | Таблица `questions` недоступна студентам (RLS). Вопросы приходят через `get_test_session()` **без** `correct_index` и объяснений |
| Подсчёт на сервере | `submit_test()` сам сверяет ответы и начисляет XP; клиент не может прислать «свой» балл |
| Нет повторного начисления | Сдача идемпотентна: строка сессии блокируется (`FOR UPDATE`), повторный вызов XP не даёт |
| Таймер | Ответы после `expires_at` отклоняются сервером; по истечении времени тест сдаётся автоматически |
| Анти-фарминг | Полный XP только за **первый** верный ответ на вопрос, повторный — `repeat_xp_percent` (по умолчанию 20%); бонусы ограничены `daily_bonus_cap` тестами в день; неверные ответы XP не дают |
| Профиль | Студент может менять только имя, username, аватар и язык (column-level GRANT). XP/роль — только через админ-RPC |
| Админка | Маршруты защищены на клиенте **и** на сервере (`is_admin()` в RLS и в каждой RPC) |
| Пароли | Хранятся только как bcrypt-хеш (Supabase Auth); мы их нигде не сохраняем |
| Коды подтверждения | Хранятся как bcrypt-хеш, ключ — SHA-256 от email (открытых email в таблице нет) |
| Один email — один аккаунт | Проверяется до отправки кода и при создании (уникальный индекс в `auth.users`) |
| Вход по username | `resolve_login_email()` отдаёт email только при верном пароле; 10 ошибок → блок входа по username на 15 минут |

Начисление XP: easy 10 / medium 15 / hard 20 за верный ответ + бонус за завершение (≥50%) + за высокий балл (≥90%) + за 100% + XP достижений. Всё настраивается в «Настройки тестов».

---

## Структура проекта

```
src/
  app/                 # App, провайдеры, роутер (lazy-загрузка страниц) и guards
  components/
    ui/                # Button, Card, Input/Select/Textarea, Modal, ConfirmDialog, Toaster,
                       # ProgressBar, Badge, Avatar, Switch, SegmentedControl, Table, Skeleton, EmptyState
    shared/            # Logo, LanguageSwitcher, ThemeSwitcher, XPBadge, LevelBadge, TechIcon,
                       # StatCard, StatisticsChart, RadialProgress, PageHeader, ErrorBoundary
    layout/            # AppLayout, Sidebar, Navbar, AuthLayout, RootLayout, загрузчики
  features/
    auth/              # формы входа/регистрации/восстановления, валидация, API
    dashboard/         # дашборд студента, статистика, рекомендации
    tests/             # конфигуратор, прохождение (стор, таймер), результаты, разбор
    leaderboard/       # таблица и пьедестал
    achievements/      # карточки достижений
    profile/           # профиль, аватар, личные рекорды
    admin/             # обзор, студенты, вопросы, категории, достижения, история, настройки
    seasonal-effects/  # Canvas-движок частиц, сезонная атмосфера, настройки
  hooks/  store/  services/supabase/  locales/{uz,ru,en}/  types/  utils/
  styles/              # abstracts (токены, миксины) · base · themes (dark/light) · layout
  pages/               # тонкие страницы, собирающие фичи
supabase/
  migrations/          # схема + RLS + функции
  seed/questions/      # банк вопросов (UZ/RU/EN), хранится отдельно от UI
  seed.sql             # генерируется: npm run seed:build
scripts/build-seed.mjs # валидация банка вопросов и генерация seed.sql
```

Каждый компонент — своя папка с `.tsx` и `.module.scss`. Дизайн-токены и миксины (`styles/abstracts`) автоматически подключаются во все SCSS-модули (см. `vite.config.ts`).

## Банк вопросов
100 вопросов: HTML 15 · CSS 15 · JavaScript 20 · React 20 · TypeScript 10 · SCSS 10 · Tailwind 10. У каждого — 3 языка, 4 варианта, объяснение, сложность, XP.

Чтобы изменить или добавить вопросы в коде — правьте `supabase/seed/questions/*.mjs` и выполните `npm run seed:build` (скрипт проверит id, языки, варианты), затем перезапустите `supabase/seed.sql`. Либо управляйте вопросами из админ-панели.

## Мультиязычность
UZ (по умолчанию), RU, EN. Типизированные словари в `src/locales`, переключение мгновенное, язык сохраняется в localStorage и в профиле.

## Сезонные эффекты
Сезон определяется по локальной дате: весна — лепестки сакуры и цветущая ветка, лето — яблоки и солнечные лучи, осень — листья, зима — снежинки и морозная дымка. Canvas с пре-рендером спрайтов, ограничение DPR и числа частиц, пауза на скрытой вкладке, `pointer-events: none`, уважение `prefers-reduced-motion`. Во время теста эффекты приглушены. В «Настройках» можно отключить, сменить интенсивность или выбрать сезон вручную.

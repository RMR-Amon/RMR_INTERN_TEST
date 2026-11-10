import { q, t } from './_helpers.mjs'

const tech = 'tailwind'

export default [
  q({
    id: 'tw-01', tech, diff: 'easy',
    q: t(
      'Tailwind CSS’ning “utility-first” yondashuvi nimani anglatadi?',
      'Что означает подход «utility-first» в Tailwind CSS?',
      'What does the "utility-first" approach in Tailwind CSS mean?',
    ),
    o: [
      t('Tayyor komponentlar (Button, Card) to‘plami', 'Набор готовых компонентов (Button, Card)', 'A set of ready-made components (Button, Card)'),
      t('Interfeysni kichik, bir vazifali klasslarni (p-4, flex, text-center) to‘g‘ridan-to‘g‘ri markup’da birlashtirib qurish', 'Построение интерфейса комбинацией маленьких одноцелевых классов (p-4, flex, text-center) прямо в разметке', 'Building UIs by composing small single-purpose classes (p-4, flex, text-center) directly in markup'),
      t('Barcha stillarni JavaScript’da yozish', 'Написание всех стилей на JavaScript', 'Writing all styles in JavaScript'),
      t('Inline style atributlaridan foydalanish', 'Использование inline-атрибута style', 'Using inline style attributes'),
    ],
    a: 1,
    e: t(
      'Inline style’dan farqli o‘laroq, utility’lar dizayn tizimi (spacing, ranglar) bilan cheklangan va hover:, md: kabi variantlarni qo‘llab-quvvatlaydi.',
      'В отличие от inline-стилей, утилиты ограничены дизайн-системой (отступы, цвета) и поддерживают варианты вроде hover:, md:.',
      'Unlike inline styles, utilities are constrained by a design system (spacing, colors) and support variants like hover: and md:.',
    ),
  }),
  q({
    id: 'tw-02', tech, diff: 'easy',
    q: t('md:flex klassi qachon qo‘llanadi?', 'Когда применяется класс md:flex?', 'When is the md:flex class applied?'),
    code: '<div class="block md:flex">...</div>',
    o: [
      t('Faqat mobil ekranlarda', 'Только на мобильных экранах', 'Only on mobile screens'),
      t('Faqat 768px dan kichik ekranlarda', 'Только на экранах меньше 768px', 'Only on screens narrower than 768px'),
      t('Faqat planshetlarda (768–1024px)', 'Только на планшетах (768–1024px)', 'Only on tablets (768–1024px)'),
      t('Ekran kengligi 768px va undan katta bo‘lganda', 'При ширине экрана от 768px и больше', 'When the viewport is 768px wide or wider'),
    ],
    a: 3,
    e: t(
      'Tailwind breakpoint’lari min-width asosida ishlaydi: md: = @media (min-width: 768px). Kichik ekranlarda block, 768px dan boshlab flex bo‘ladi.',
      'Брейкпоинты Tailwind основаны на min-width: md: = @media (min-width: 768px). На маленьких экранах — block, начиная с 768px — flex.',
      'Tailwind breakpoints are min-width based: md: = @media (min-width: 768px). It is block on small screens and flex from 768px up.',
    ),
  }),
  q({
    id: 'tw-03', tech, diff: 'medium',
    q: t('Bu klasslar nima qiladi?', 'Что делают эти классы?', 'What do these classes do?'),
    code: '<button class="bg-blue-500 hover:bg-blue-600 focus-visible:ring-2 disabled:opacity-50">',
    o: [
      t('Holat variantlari: sichqoncha ustida, klaviatura fokusida va disabled holatda turli stillar qo‘llaydi', 'Варианты состояний: разные стили при наведении, фокусе с клавиатуры и в состоянии disabled', 'State variants: different styles on hover, keyboard focus and when disabled'),
      t('Uchta turli tugma yaratadi', 'Создают три разные кнопки', 'They create three different buttons'),
      t('JavaScript hodisalarini qo‘shadi', 'Добавляют обработчики событий JavaScript', 'They add JavaScript event handlers'),
      t('Faqat birinchi klass ishlaydi', 'Работает только первый класс', 'Only the first class works'),
    ],
    a: 0,
    e: t(
      'Variant prefikslari (hover:, focus-visible:, disabled:) tegishli pseudo-klass ichida utility’ni qo‘llaydi. Ularni birlashtirish ham mumkin: md:hover:bg-blue-700.',
      'Префиксы вариантов (hover:, focus-visible:, disabled:) применяют утилиту внутри соответствующего псевдокласса. Их можно комбинировать: md:hover:bg-blue-700.',
      'Variant prefixes (hover:, focus-visible:, disabled:) apply a utility within the matching pseudo-class. They can be stacked: md:hover:bg-blue-700.',
    ),
  }),
  q({
    id: 'tw-04', tech, diff: 'medium',
    q: t(
      'Bu element turli ekranlarda qanday matn o‘lchamiga ega bo‘ladi?',
      'Какой размер текста будет у элемента на разных экранах?',
      'What text size will this element have on different screens?',
    ),
    code: '<h1 class="text-xl lg:text-4xl">Title</h1>',
    o: [
      t('Har doim text-4xl', 'Всегда text-4xl', 'Always text-4xl'),
      t('Faqat lg ekranlarda text-xl', 'text-xl только на lg-экранах', 'text-xl only on lg screens'),
      t('Barcha ekranlarda text-xl, lg (1024px) va undan kattada text-4xl', 'text-xl на всех экранах, а начиная с lg (1024px) — text-4xl', 'text-xl on all screens, and text-4xl from lg (1024px) up'),
      t('Konflikt sababli hech biri ishlamaydi', 'Из-за конфликта не работает ни один', 'Neither works because of the conflict'),
    ],
    a: 2,
    e: t(
      'Tailwind mobile-first: prefikssiz utility barcha o‘lchamlarga qo‘llanadi, breakpoint prefiksi esa shu o‘lchamdan boshlab uni qayta yozadi.',
      'Tailwind — mobile-first: утилита без префикса действует на всех размерах, а префикс брейкпоинта переопределяет её начиная с этого размера.',
      'Tailwind is mobile-first: an unprefixed utility applies to all sizes and a breakpoint prefix overrides it from that size upward.',
    ),
  }),
  q({
    id: 'tw-05', tech, diff: 'medium',
    q: t('dark: varianti nima qiladi?', 'Что делает вариант dark:?', 'What does the dark: variant do?'),
    code: '<div class="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">',
    o: [
      t('Elementni har doim qorong‘i qiladi', 'Всегда делает элемент тёмным', 'Always makes the element dark'),
      t('Qorong‘i rejim yoqilganda (prefers-color-scheme yoki .dark klassi orqali) stillarni qo‘llaydi', 'Применяет стили, когда включён тёмный режим (через prefers-color-scheme или класс .dark)', 'Applies styles when dark mode is active (via prefers-color-scheme or a .dark class)'),
      t('Kechqurun avtomatik yoqiladi', 'Включается автоматически вечером', 'Turns on automatically in the evening'),
      t('Rangni 50% ga qoraytiradi', 'Затемняет цвет на 50%', 'Darkens the color by 50%'),
    ],
    a: 1,
    e: t(
      'Sukut bo‘yicha dark: tizimning prefers-color-scheme sozlamasiga bog‘liq. Qo‘lda almashtirish uchun uni class (yoki selector) strategiyasiga sozlash mumkin.',
      'По умолчанию dark: зависит от системной prefers-color-scheme. Для ручного переключения его настраивают на стратегию класса (или селектора).',
      'By default dark: follows the system prefers-color-scheme. For a manual toggle it can be configured to a class (or selector) strategy.',
    ),
  }),
  q({
    id: 'tw-06', tech, diff: 'hard',
    q: t(
      'Dizayn tizimida yo‘q bo‘lgan aniq qiymat (masalan, 327px) qanday beriladi?',
      'Как задать точное значение, которого нет в дизайн-системе (например, 327px)?',
      'How do you apply an exact value that is not in the design system (e.g. 327px)?',
    ),
    o: [
      'class="w-327"',
      'class="width:327px"',
      'style="w-[327px]"',
      'class="w-[327px]"',
    ],
    a: 3,
    e: t(
      'Kvadrat qavsli “arbitrary values” sintaksisi bir martalik qiymatlar uchun utility yaratadi: w-[327px], top-[117px], bg-[#1da1f2]. Ulardan me’yorida foydalanish kerak.',
      'Синтаксис «arbitrary values» в квадратных скобках создаёт утилиту для разового значения: w-[327px], top-[117px], bg-[#1da1f2]. Использовать стоит умеренно.',
      'The square-bracket "arbitrary values" syntax generates a one-off utility: w-[327px], top-[117px], bg-[#1da1f2]. Use it sparingly.',
    ),
  }),
  q({
    id: 'tw-07', tech, diff: 'medium',
    q: t('@apply direktivasi nima uchun kerak?', 'Для чего нужна директива @apply?', 'What is the @apply directive for?'),
    code: '.btn-primary {\n  @apply px-4 py-2 rounded-lg bg-indigo-600 text-white;\n}',
    o: [
      t('Mavjud utility’larni o‘z CSS klassingiz ichiga yig‘ish uchun', 'Чтобы собрать существующие утилиты внутри своего CSS-класса', 'To compose existing utilities inside your own CSS class'),
      t('Klasslarni JavaScript orqali qo‘shish uchun', 'Чтобы добавлять классы через JavaScript', 'To add classes via JavaScript'),
      t('Tailwind’ni o‘chirish uchun', 'Чтобы отключить Tailwind', 'To disable Tailwind'),
      t('Media-so‘rov yaratish uchun', 'Чтобы создать медиазапрос', 'To create a media query'),
    ],
    a: 0,
    e: t(
      '@apply takrorlanuvchi uslublarni (masalan, uchinchi tomon HTML’i uchun) bir joyga yig‘adi. Lekin React kabi komponent tizimlarida odatda komponentning o‘zi qayta ishlatiladi.',
      '@apply собирает повторяющиеся стили (например, для стороннего HTML). Но в компонентных фреймворках вроде React обычно переиспользуют сам компонент.',
      '@apply bundles repeated styles (e.g. for third-party HTML). In component frameworks like React, reusing the component itself is usually better.',
    ),
  }),
  q({
    id: 'tw-08', tech, diff: 'hard',
    q: t('Nega bu kod kutilganidek ishlamasligi mumkin?', 'Почему этот код может не работать как ожидается?', 'Why might this code not work as expected?'),
    code: "function Badge({ color }) {\n  return <span className={`bg-${color}-500`}>New</span>\n}",
    o: [
      t('Template string’lar JSX ichida ishlamaydi', 'Шаблонные строки не работают в JSX', 'Template literals do not work in JSX'),
      t('500 noto‘g‘ri rang darajasi', '500 — неверный оттенок', '500 is an invalid shade'),
      t('Tailwind manba kodini statik skaner qiladi va dinamik yig‘ilgan klass nomlarini topa olmaydi — bu klasslar generatsiya qilinmaydi', 'Tailwind статически сканирует исходники и не видит динамически собранные имена классов — эти классы не генерируются', 'Tailwind scans source files statically and cannot detect dynamically built class names — those classes are never generated'),
      t('className faqat string literal qabul qiladi', 'className принимает только строковые литералы', 'className only accepts string literals'),
    ],
    a: 2,
    e: t(
      'To‘liq klass nomlarini yozing: { red: "bg-red-500", green: "bg-green-500" }[color]. Shunda skaner ularni ko‘radi va CSS’ga qo‘shadi.',
      'Пишите полные имена классов: { red: "bg-red-500", green: "bg-green-500" }[color]. Тогда сканер их увидит и добавит в CSS.',
      'Use complete class names: { red: "bg-red-500", green: "bg-green-500" }[color]. Then the scanner sees them and includes them in the CSS.',
    ),
  }),
  q({
    id: 'tw-09', tech, diff: 'easy',
    q: t('p-4 klassi qancha padding beradi (standart sozlamada)?', 'Какой padding даёт класс p-4 (в стандартной конфигурации)?', 'How much padding does p-4 apply (default config)?'),
    o: ['4px', '1rem (16px)', '4rem', '0.4rem'],
    a: 1,
    e: t(
      'Tailwind spacing shkalasida 1 birlik = 0.25rem (4px). Demak, p-4 = 1rem = 16px; p-2 = 8px, p-8 = 32px.',
      'В шкале отступов Tailwind 1 единица = 0.25rem (4px). Значит, p-4 = 1rem = 16px; p-2 = 8px, p-8 = 32px.',
      'In Tailwind\'s spacing scale 1 unit = 0.25rem (4px). So p-4 = 1rem = 16px; p-2 = 8px, p-8 = 32px.',
    ),
  }),
  q({
    id: 'tw-10', tech, diff: 'medium',
    q: t(
      'Flex konteyner elementlari orasida 1rem masofa qo‘yish uchun eng to‘g‘ri klass qaysi?',
      'Какой класс правильнее всего использовать для промежутка 1rem между элементами flex-контейнера?',
      'Which class is the best way to add a 1rem gap between items of a flex container?',
    ),
    code: '<div class="flex ___">\n  <span>A</span><span>B</span><span>C</span>\n</div>',
    o: ['m-4', 'p-4', 'space-4', 'gap-4'],
    a: 3,
    e: t(
      'gap-4 CSS gap xususiyatini beradi va flex hamda grid’da ishlaydi. space-x-4 margin orqali ishlaydi va qatorlarga o‘tganda (wrap) muammo beradi; space-4 degan klass yo‘q.',
      'gap-4 задаёт CSS-свойство gap и работает во flex и grid. space-x-4 работает через margin и ломается при переносе строк; класса space-4 нет.',
      'gap-4 sets the CSS gap property and works for both flex and grid. space-x-4 uses margins and breaks with wrapping; there is no space-4 class.',
    ),
  }),
]

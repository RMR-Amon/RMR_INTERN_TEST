import { q, t } from './_helpers.mjs'

const tech = 'scss'

export default [
  q({
    id: 'scss-01', tech, diff: 'easy',
    q: t('SCSS’da o‘zgaruvchi qanday e’lon qilinadi?', 'Как объявить переменную в SCSS?', 'How do you declare a variable in SCSS?'),
    o: ['$primary: #6366f1;', '@primary: #6366f1;', 'var primary = #6366f1;', '--primary = #6366f1;'],
    a: 0,
    e: t(
      'Sass o‘zgaruvchilari $ bilan boshlanadi va kompilyatsiya vaqtida qiymatga almashtiriladi. @primary — Less sintaksisi, --primary esa CSS custom property.',
      'Переменные Sass начинаются с $ и подставляются при компиляции. @primary — синтаксис Less, --primary — CSS custom property.',
      'Sass variables start with $ and are replaced at compile time. @primary is Less syntax and --primary is a CSS custom property.',
    ),
  }),
  q({
    id: 'scss-02', tech, diff: 'easy',
    q: t('Bu SCSS qanday CSS’ga kompilyatsiya qilinadi?', 'Во что скомпилируется этот SCSS?', 'What CSS does this SCSS compile to?'),
    code: '.btn {\n  color: white;\n  &:hover { color: cyan; }\n  &--primary { background: blue; }\n}',
    o: [
      '.btn { color: white } .btn :hover { color: cyan } .btn --primary { background: blue }',
      '.btn { color: white } :hover { color: cyan } --primary { background: blue }',
      '.btn { color: white } .btn:hover { color: cyan } .btn--primary { background: blue }',
      t('Kompilyatsiya xatosi', 'Ошибка компиляции', 'A compilation error'),
    ],
    a: 2,
    e: t(
      '& — ota selektorga havola. U bo‘sh joysiz qo‘shiladi, shuning uchun BEM modifikatorlari (&--primary) va pseudo-klasslar (&:hover) uchun qulay.',
      '& — ссылка на родительский селектор. Он подставляется без пробела, поэтому удобен для BEM-модификаторов (&--primary) и псевдоклассов (&:hover).',
      '& references the parent selector and is inserted without a space — perfect for BEM modifiers (&--primary) and pseudo-classes (&:hover).',
    ),
  }),
  q({
    id: 'scss-03', tech, diff: 'medium',
    q: t('Bu kod nima qiladi?', 'Что делает этот код?', 'What does this code do?'),
    code: '@mixin flex-center($gap: 8px) {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: $gap;\n}\n\n.toolbar { @include flex-center(16px); }',
    o: [
      t('.toolbar’ni flex-center klassidan meros oldiradi', 'Наследует .toolbar от класса flex-center', 'Makes .toolbar inherit from a flex-center class'),
      t('Qayta ishlatiladigan stillar blokini parametr bilan .toolbar ichiga qo‘shadi', 'Вставляет переиспользуемый блок стилей с параметром внутрь .toolbar', 'Inserts a reusable, parameterized block of styles into .toolbar'),
      t('CSS’da yangi @mixin qoidasini yaratadi', 'Создаёт в CSS новое правило @mixin', 'Creates a new @mixin rule in the output CSS'),
      t('Faqat gap’ni 16px qiladi', 'Только устанавливает gap 16px', 'Only sets gap to 16px'),
    ],
    a: 1,
    e: t(
      '@mixin stillar blokini e’lon qiladi (argumentlar va default qiymatlar bilan), @include esa uni chaqiradi. Natijaviy CSS’da mixin’ning o‘zi chiqmaydi.',
      '@mixin объявляет блок стилей (с аргументами и значениями по умолчанию), @include его подключает. Сам mixin в итоговый CSS не попадает.',
      '@mixin declares a block of styles (with arguments and defaults) and @include uses it. The mixin itself is not emitted to CSS.',
    ),
  }),
  q({
    id: 'scss-04', tech, diff: 'medium',
    q: t(
      '@extend va @mixin o‘rtasidagi asosiy farq nima?',
      'В чём главное различие между @extend и @mixin?',
      'What is the key difference between @extend and @mixin?',
    ),
    o: [
      t('Farqi yo‘q', 'Разницы нет', 'There is no difference'),
      t('@mixin faqat ranglar uchun', '@mixin только для цветов', '@mixin is only for colors'),
      t('@extend argument qabul qiladi, @mixin qabul qilmaydi', '@extend принимает аргументы, @mixin — нет', '@extend accepts arguments, @mixin does not'),
      t('@extend selektorlarni bitta qoidaga guruhlaydi, @mixin esa stillarni har bir joyga nusxalaydi va argument qabul qiladi', '@extend группирует селекторы в одно правило, а @mixin копирует стили в каждое место и принимает аргументы', '@extend groups selectors into one shared rule, while @mixin copies styles into each place and accepts arguments'),
    ],
    a: 3,
    e: t(
      '@extend kamroq CSS hosil qiladi, lekin kutilmagan selektor zanjirlariga olib kelishi va media-so‘rovlar ichida cheklangan bo‘lishi mumkin. Mixin’lar oldindan aytib bo‘ladigan va moslashuvchan.',
      '@extend даёт меньше CSS, но может порождать неожиданные цепочки селекторов и ограничен внутри медиазапросов. Миксины предсказуемее и гибче.',
      '@extend produces less CSS but can create unexpected selector chains and is restricted inside media queries. Mixins are more predictable and flexible.',
    ),
  }),
  q({
    id: 'scss-05', tech, diff: 'medium',
    q: t(
      'Nima uchun fayl nomi _variables.scss kabi pastki chiziq bilan boshlanadi?',
      'Почему имя файла начинается с подчёркивания, например _variables.scss?',
      'Why does a file name start with an underscore, like _variables.scss?',
    ),
    o: [
      t('Bu partial: u alohida CSS faylga kompilyatsiya qilinmaydi, faqat boshqa fayllarga @use orqali ulanadi', 'Это partial: он не компилируется в отдельный CSS-файл, а только подключается в другие через @use', 'It is a partial: it is not compiled into its own CSS file and is only loaded by other files via @use'),
      t('Fayl yashirin bo‘ladi', 'Файл становится скрытым', 'The file becomes hidden'),
      t('Fayl birinchi bo‘lib yuklanadi', 'Файл загружается первым', 'The file is loaded first'),
      t('Bu majburiy nomlash qoidasi, aks holda xato bo‘ladi', 'Это обязательное правило, иначе будет ошибка', 'It is mandatory naming, otherwise compilation fails'),
    ],
    a: 0,
    e: t(
      'Partial’lar kodni modullarga ajratadi. Import qilishda pastki chiziq va kengaytma yozilmaydi: @use "variables".',
      'Partials разбивают код на модули. При подключении подчёркивание и расширение не пишут: @use "variables".',
      'Partials split code into modules. When loading them, omit the underscore and extension: @use "variables".',
    ),
  }),
  q({
    id: 'scss-06', tech, diff: 'hard',
    q: t(
      'Zamonaviy Sass’da @use ning @import’dan afzalligi nimada?',
      'Чем @use лучше @import в современном Sass?',
      'Why is @use preferred over @import in modern Sass?',
    ),
    code: "@use 'sass:math';\n@use 'tokens' as t;\n\n.card { padding: t.$space-4; width: math.div(100%, 3); }",
    o: [
      t('@use tezroq yuklanadi, boshqa farqi yo‘q', '@use быстрее загружается, других отличий нет', '@use loads faster and that is the only difference'),
      t('@use CSS fayllarni brauzerda import qiladi', '@use импортирует CSS-файлы в браузере', '@use imports CSS files in the browser'),
      t('@use modulni bir marta yuklaydi va a’zolarini namespace orqali beradi; @import global va eskirgan (deprecated)', '@use загружает модуль один раз и даёт доступ к членам через namespace; @import глобальный и устарел', '@use loads a module once and exposes its members through a namespace; @import is global and deprecated'),
      t('@import faqat partial’lar uchun ishlaydi', '@import работает только с partials', '@import only works with partials'),
    ],
    a: 2,
    e: t(
      '@import barcha o‘zgaruvchilarni global maydonga tashlaydi va nom to‘qnashuviga olib keladi. @use namespace (t.$space-4) va private a’zolarni (-/_ prefiks) qo‘llab-quvvatlaydi.',
      '@import сваливает все переменные в глобальную область и вызывает конфликты имён. @use поддерживает namespace (t.$space-4) и приватные члены (префикс -/_).',
      '@import dumps everything into the global scope causing name clashes. @use supports namespaces (t.$space-4) and private members (-/_ prefix).',
    ),
  }),
  q({
    id: 'scss-07', tech, diff: 'hard',
    q: t('.title uchun font-size qancha bo‘ladi?', 'Какой font-size получит .title?', 'What font-size will .title get?'),
    code: "@use 'sass:math';\n\n@function rem($px, $base: 16px) {\n  @return math.div($px, $base) * 1rem;\n}\n\n.title { font-size: rem(24px); }",
    o: ['24rem', '1.5rem', '0.67rem', '384rem'],
    a: 1,
    e: t(
      '@function qiymat qaytaradi (@return). 24px / 16px = 1.5 (birliksiz), keyin 1rem’ga ko‘paytiriladi → 1.5rem.',
      '@function возвращает значение через @return. 24px / 16px = 1.5 (без единиц), затем умножаем на 1rem → 1.5rem.',
      '@function returns a value with @return. 24px / 16px = 1.5 (unitless), multiplied by 1rem → 1.5rem.',
    ),
  }),
  q({
    id: 'scss-08', tech, diff: 'medium',
    q: t('Bu kod qanday CSS hosil qiladi?', 'Какой CSS сгенерирует этот код?', 'What CSS does this code generate?'),
    code: '$colors: (primary: #6366f1, danger: #ef4444);\n\n@each $name, $color in $colors {\n  .text-#{$name} { color: $color; }\n}',
    o: [
      t('Bitta .text-colors klassi', 'Один класс .text-colors', 'A single .text-colors class'),
      t('Xato: map’ni aylanib chiqib bo‘lmaydi', 'Ошибка: по map нельзя итерироваться', 'An error: maps cannot be iterated'),
      ".text-$name { color: $color }",
      '.text-primary { color: #6366f1 } .text-danger { color: #ef4444 }',
    ],
    a: 3,
    e: t(
      '@each map’ning har bir kalit-qiymat juftligini aylanib chiqadi, #{} — interpolatsiya bo‘lib, o‘zgaruvchini selektor nomiga qo‘yadi.',
      '@each перебирает пары ключ-значение map, а #{} — интерполяция, подставляющая переменную в имя селектора.',
      '@each iterates over key/value pairs of a map and #{} interpolation inserts the variable into the selector name.',
    ),
  }),
  q({
    id: 'scss-09', tech, diff: 'hard',
    q: t(
      '%placeholder selektori qanday xususiyatga ega?',
      'Какая особенность у селектора %placeholder?',
      'What is special about a %placeholder selector?',
    ),
    code: '%btn-base { padding: 8px 16px; border-radius: 8px; }\n\n.btn-primary { @extend %btn-base; background: blue; }',
    o: [
      t('U faqat @extend qilinganda CSS’ga chiqadi; o‘zi alohida klass sifatida chiqmaydi', 'Попадает в CSS только при @extend; сам по себе как класс не выводится', 'It is only emitted when extended; it never appears in CSS as a class on its own'),
      t('U foiz (%) qiymatlarini hisoblaydi', 'Вычисляет процентные значения', 'It calculates percentage values'),
      t('U HTML’dagi placeholder atributini stillaydi', 'Стилизует атрибут placeholder в HTML', 'It styles the placeholder attribute in HTML'),
      t('U @include bilan ishlatiladi', 'Используется через @include', 'It is used with @include'),
    ],
    a: 0,
    e: t(
      'Placeholder — @extend uchun mo‘ljallangan “jim” selektor. Agar u hech qayerda extend qilinmasa, CSS’da umuman paydo bo‘lmaydi.',
      'Placeholder — «тихий» селектор для @extend. Если его нигде не расширили, в CSS он не появится вовсе.',
      'A placeholder is a "silent" selector meant for @extend. If nothing extends it, it does not appear in the CSS at all.',
    ),
  }),
  q({
    id: 'scss-10', tech, diff: 'medium',
    q: t(
      'Zamonaviy Dart Sass’da bo‘lishni (division) to‘g‘ri yozish usuli qaysi?',
      'Как правильно записать деление в современном Dart Sass?',
      'What is the correct way to divide in modern Dart Sass?',
    ),
    o: [
      '$half: $width / 2;',
      '$half: divide($width, 2);',
      "@use 'sass:math';  $half: math.div($width, 2);",
      '$half: $width % 2;',
    ],
    a: 2,
    e: t(
      '/ belgisi bilan bo‘lish eskirgan, chunki CSS’da / ajratuvchi sifatida ham ishlatiladi (masalan, grid-area: 1 / 3). math.div() aniq va kelajakka mos.',
      'Деление через / устарело, так как / в CSS используется и как разделитель (например, grid-area: 1 / 3). math.div() однозначен и рекомендован.',
      'Division with / is deprecated because / is also a separator in CSS (e.g. grid-area: 1 / 3). math.div() is unambiguous and future-proof.',
    ),
  }),
]

import { q, t } from './_helpers.mjs'

const tech = 'css'

export default [
  q({
    id: 'css-01', tech, diff: 'easy',
    q: t(
      'CSS box model qatlamlari ichkaridan tashqariga qanday tartibda joylashgan?',
      'В каком порядке расположены слои CSS box model изнутри наружу?',
      'In what order are the CSS box model layers arranged from inside out?',
    ),
    o: [
      'margin → border → padding → content',
      'content → padding → border → margin',
      'content → border → padding → margin',
      'padding → content → margin → border',
    ],
    a: 1,
    e: t(
      'Kontent atrofida ichki bo‘shliq (padding), keyin chegara (border), eng tashqarida esa tashqi bo‘shliq (margin) joylashadi.',
      'Вокруг содержимого — внутренний отступ (padding), затем рамка (border), снаружи — внешний отступ (margin).',
      'Content is wrapped by padding, then the border, and the margin is the outermost layer.',
    ),
  }),
  q({
    id: 'css-02', tech, diff: 'easy',
    q: t(
      'box-sizing: border-box nimani anglatadi?',
      'Что означает box-sizing: border-box?',
      'What does box-sizing: border-box mean?',
    ),
    code: '.card {\n  box-sizing: border-box;\n  width: 300px;\n  padding: 20px;\n  border: 2px solid;\n}',
    o: [
      t('width padding va border’ni ham o‘z ichiga oladi — element aynan 300px', 'width включает padding и border — элемент ровно 300px', 'width includes padding and border — the element is exactly 300px'),
      t('Element kengligi 344px bo‘ladi', 'Ширина элемента будет 344px', 'The element will be 344px wide'),
      t('Border ko‘rinmay qoladi', 'Рамка станет невидимой', 'The border becomes invisible'),
      t('margin ham kenglikka qo‘shiladi', 'margin тоже входит в ширину', 'margin is also included in the width'),
    ],
    a: 0,
    e: t(
      'border-box’da padding va border width ichida hisoblanadi. content-box’da (sukut bo‘yicha) kenglik 300 + 40 + 4 = 344px bo‘lardi. margin hech qachon kiritilmaydi.',
      'При border-box padding и border входят в width. При content-box (по умолчанию) ширина была бы 300 + 40 + 4 = 344px. margin не входит никогда.',
      'With border-box, padding and border are inside width. With content-box (the default) it would be 300 + 40 + 4 = 344px. Margin is never included.',
    ),
  }),
  q({
    id: 'css-03', tech, diff: 'medium',
    q: t(
      'Sarlavha qanday rangda bo‘ladi?',
      'Каким цветом будет заголовок?',
      'What color will the heading be?',
    ),
    code: '<h1 id="title" class="a b c">Hello</h1>\n\n#title { color: red; }\n.a.b.c { color: blue; }\nh1 { color: green; }',
    o: [
      t('Ko‘k — u keyinroq yozilgan', 'Синим — правило ниже', 'Blue — it comes later'),
      t('Yashil — teg selektori', 'Зелёным — селектор тега', 'Green — the tag selector'),
      t('Qizil — id selektori specificity’si yuqoriroq', 'Красным — у id-селектора выше специфичность', 'Red — the id selector has higher specificity'),
      t('Qora — konflikt tufayli', 'Чёрным — из-за конфликта', 'Black — because of the conflict'),
    ],
    a: 2,
    e: t(
      'Specificity: #id = (1,0,0), .a.b.c = (0,3,0), h1 = (0,0,1). Har qancha klass bo‘lsa ham bitta id’dan kuchli bo‘lmaydi; tartib faqat specificity teng bo‘lganda muhim.',
      'Специфичность: #id = (1,0,0), .a.b.c = (0,3,0), h1 = (0,0,1). Никакое число классов не перебьёт один id; порядок важен только при равной специфичности.',
      'Specificity: #id = (1,0,0), .a.b.c = (0,3,0), h1 = (0,0,1). No number of classes beats one id; source order only matters on equal specificity.',
    ),
  }),
  q({
    id: 'css-04', tech, diff: 'easy',
    q: t(
      'position: absolute bo‘lgan element nimaga nisbatan joylashadi?',
      'Относительно чего позиционируется элемент с position: absolute?',
      'An element with position: absolute is positioned relative to what?',
    ),
    o: [
      t('Har doim brauzer oynasiga', 'Всегда относительно окна браузера', 'Always the browser window'),
      t('Bevosita ota elementga, uning position qiymatidan qat’i nazar', 'Непосредственного родителя, независимо от его position', 'Its direct parent, regardless of its position'),
      t('O‘zining odatiy joyiga', 'Своего обычного места в потоке', 'Its normal place in the flow'),
      t('position: static bo‘lmagan eng yaqin ajdodga (bo‘lmasa — boshlang‘ich bloka)', 'Ближайшего предка с position, отличным от static (иначе — начального блока)', 'The nearest ancestor whose position is not static (otherwise the initial containing block)'),
    ],
    a: 3,
    e: t(
      'Shuning uchun ota elementga odatda position: relative beriladi. Absolute element oqimdan chiqariladi va joy egallamaydi.',
      'Поэтому родителю обычно задают position: relative. Абсолютный элемент выпадает из потока и не занимает места.',
      'That is why the parent is usually given position: relative. An absolute element is removed from the flow and takes no space.',
    ),
  }),
  q({
    id: 'css-05', tech, diff: 'medium',
    q: t(
      'flex-direction: row bo‘lgan flex-konteynerda justify-content qaysi o‘q bo‘yicha tekislaydi?',
      'По какой оси выравнивает justify-content во flex-контейнере с flex-direction: row?',
      'In a flex container with flex-direction: row, along which axis does justify-content align items?',
    ),
    o: [
      t('Ko‘ndalang (cross) o‘q — vertikal', 'Поперечная ось — вертикаль', 'The cross axis — vertical'),
      t('Asosiy (main) o‘q — gorizontal', 'Главная ось — горизонталь', 'The main axis — horizontal'),
      t('Ikkala o‘q bo‘yicha', 'По обеим осям', 'Both axes'),
      t('Faqat matn bazaviy chizig‘i bo‘yicha', 'Только по базовой линии текста', 'Only along the text baseline'),
    ],
    a: 1,
    e: t(
      'justify-content — asosiy o‘q, align-items — ko‘ndalang o‘q. flex-direction: column bo‘lsa, o‘qlar almashadi.',
      'justify-content — главная ось, align-items — поперечная. При flex-direction: column оси меняются местами.',
      'justify-content works on the main axis, align-items on the cross axis. With flex-direction: column the axes swap.',
    ),
  }),
  q({
    id: 'css-06', tech, diff: 'medium',
    q: t(
      'display: none va visibility: hidden o‘rtasidagi farq nima?',
      'В чём разница между display: none и visibility: hidden?',
      'What is the difference between display: none and visibility: hidden?',
    ),
    o: [
      t('visibility: hidden element joyini saqlab qoladi, display: none esa uni oqimdan butunlay olib tashlaydi', 'visibility: hidden сохраняет место элемента, display: none полностью убирает его из потока', 'visibility: hidden keeps the element\'s space, display: none removes it from the layout entirely'),
      t('Ular bir xil ishlaydi', 'Они работают одинаково', 'They behave the same'),
      t('display: none elementni DOM’dan o‘chiradi', 'display: none удаляет элемент из DOM', 'display: none deletes the element from the DOM'),
      t('visibility: hidden faqat matnni yashiradi', 'visibility: hidden скрывает только текст', 'visibility: hidden only hides text'),
    ],
    a: 0,
    e: t(
      'Ikkala holatda ham element DOM’da qoladi. display: none layout’dan chiqaradi; visibility: hidden ko‘rinmas, lekin joy egallaydi.',
      'В обоих случаях элемент остаётся в DOM. display: none убирает его из раскладки; visibility: hidden — невидим, но занимает место.',
      'In both cases the element stays in the DOM. display: none removes it from layout; visibility: hidden is invisible but still occupies space.',
    ),
  }),
  q({
    id: 'css-07', tech, diff: 'easy',
    q: t(
      'rem birligi nimaga nisbatan hisoblanadi?',
      'Относительно чего вычисляется единица rem?',
      'What is the rem unit relative to?',
    ),
    o: [
      t('Ota elementning shrift o‘lchamiga', 'Размера шрифта родителя', 'The parent\'s font size'),
      t('Viewport kengligiga', 'Ширины viewport', 'The viewport width'),
      t('Ildiz (html) elementning shrift o‘lchamiga', 'Размера шрифта корневого элемента (html)', 'The root (html) element\'s font size'),
      t('Ekran piksel zichligiga', 'Плотности пикселей экрана', 'The screen pixel density'),
    ],
    a: 2,
    e: t(
      'rem — “root em”. html’da 16px bo‘lsa, 1.5rem = 24px. em esa joriy elementning shrift o‘lchamiga bog‘liq va ichma-ich ko‘payib ketishi mumkin.',
      'rem — «root em». Если у html 16px, то 1.5rem = 24px. em зависит от размера шрифта текущего элемента и может накапливаться при вложенности.',
      'rem means "root em". With 16px on html, 1.5rem = 24px. em depends on the current element\'s font size and compounds when nested.',
    ),
  }),
  q({
    id: 'css-08', tech, diff: 'easy',
    q: t(
      'Bu kod qanday grid yaratadi?',
      'Какую сетку создаёт этот код?',
      'What grid does this code create?',
    ),
    code: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}',
    o: [
      t('3 ta qator', '3 строки', '3 rows'),
      t('Bo‘sh joyni teng bo‘luvchi 3 ta teng ustun', '3 равные колонки, делящие свободное место', '3 equal columns sharing the free space'),
      t('Har biri 1px kenglikdagi 3 ta ustun', '3 колонки шириной 1px', '3 columns 1px wide each'),
      t('Kontentga qarab har xil kenglikdagi ustunlar', 'Колонки разной ширины по содержимому', 'Columns of varying width based on content'),
    ],
    a: 1,
    e: t(
      'fr — bo‘sh joyning ulushi. repeat(3, 1fr) = 1fr 1fr 1fr, gap esa ustunlar orasidagi masofani beradi.',
      'fr — доля свободного пространства. repeat(3, 1fr) = 1fr 1fr 1fr, а gap задаёт промежутки между колонками.',
      'fr is a fraction of the free space. repeat(3, 1fr) equals 1fr 1fr 1fr and gap sets the spacing between tracks.',
    ),
  }),
  q({
    id: 'css-09', tech, diff: 'hard',
    q: t(
      '.child nega .overlay ustida ko‘rinmaydi?',
      'Почему .child не отображается поверх .overlay?',
      'Why does .child not appear above .overlay?',
    ),
    code: '.parent  { position: relative; z-index: 1; }\n.child   { position: absolute; z-index: 999; }\n.overlay { position: fixed; z-index: 2; }\n\n<div class="parent"><div class="child"></div></div>\n<div class="overlay"></div>',
    o: [
      t('z-index 999 dan katta bo‘lishi mumkin emas', 'z-index не может быть больше 999', 'z-index cannot be larger than 999'),
      t('absolute elementlarda z-index ishlamaydi', 'z-index не работает у absolute-элементов', 'z-index does not work on absolute elements'),
      t('fixed elementlar har doim eng yuqorida bo‘ladi', 'fixed-элементы всегда сверху', 'fixed elements are always on top'),
      t('.parent o‘z stacking context’ini yaratgan, .child faqat uning ichida tartiblanadi (1 < 2)', '.parent создал свой контекст наложения, и .child упорядочивается только внутри него (1 < 2)', '.parent creates its own stacking context, so .child is only ordered inside it (1 < 2)'),
    ],
    a: 3,
    e: t(
      'position + z-index yangi stacking context hosil qiladi. Bola elementning z-index’i faqat ota konteksti ichida ta’sir qiladi, tashqarida esa ota z-index: 1 bilan solishtiriladi.',
      'position + z-index создают новый контекст наложения. z-index потомка действует только внутри контекста родителя, а снаружи сравнивается z-index: 1 родителя.',
      'position + z-index creates a new stacking context. A child\'s z-index only applies within the parent\'s context; outside, the parent\'s z-index: 1 is what is compared.',
    ),
  }),
  q({
    id: 'css-10', tech, diff: 'medium',
    q: t(
      'Quyidagilardan qaysi biri pseudo-element?',
      'Что из перечисленного является псевдоэлементом?',
      'Which of the following is a pseudo-element?',
    ),
    o: ['::before', ':hover', ':first-child', ':focus-visible'],
    a: 0,
    e: t(
      'Pseudo-elementlar (::before, ::after, ::placeholder) elementning qismini yoki virtual elementni stillaydi. Pseudo-klasslar (:hover, :first-child) esa holat yoki pozitsiyani tanlaydi.',
      'Псевдоэлементы (::before, ::after, ::placeholder) стилизуют часть элемента или виртуальный элемент. Псевдоклассы (:hover, :first-child) выбирают состояние или позицию.',
      'Pseudo-elements (::before, ::after, ::placeholder) style a part of an element or a virtual element. Pseudo-classes (:hover, :first-child) select a state or position.',
    ),
  }),
  q({
    id: 'css-11', tech, diff: 'hard',
    q: t(
      'Ikki blok orasidagi vertikal masofa qancha bo‘ladi?',
      'Каким будет вертикальное расстояние между блоками?',
      'What will the vertical distance between the two blocks be?',
    ),
    code: '<div class="a"></div>\n<div class="b"></div>\n\n.a { margin-bottom: 20px; }\n.b { margin-top: 30px; }',
    o: ['50px', '20px', '30px', '25px'],
    a: 2,
    e: t(
      'Margin collapse: oddiy blok oqimida qo‘shni elementlarning vertikal marginlari qo‘shilmaydi, kattasi olinadi. Flex/grid elementlarida bu sodir bo‘lmaydi.',
      'Схлопывание margin: в обычном блочном потоке вертикальные отступы соседей не складываются, берётся больший. Во flex/grid этого не происходит.',
      'Margin collapsing: in normal block flow, adjacent vertical margins do not add up — the larger one wins. It does not happen for flex/grid items.',
    ),
  }),
  q({
    id: 'css-12', tech, diff: 'medium',
    q: t(
      'position: sticky qanday ishlaydi?',
      'Как работает position: sticky?',
      'How does position: sticky work?',
    ),
    code: '.header {\n  position: sticky;\n  top: 0;\n}',
    o: [
      t('Har doim ekranning yuqorisida qotib turadi', 'Всегда закреплён вверху экрана', 'Always fixed to the top of the screen'),
      t('Belgilangan chegaraga (top: 0) yetguncha relative, keyin konteyneri ichida fixed kabi yopishadi', 'Ведёт себя как relative до порога (top: 0), затем «прилипает» как fixed в пределах контейнера', 'Behaves as relative until the threshold (top: 0), then sticks like fixed within its container'),
      t('Elementni oqimdan chiqaradi', 'Выводит элемент из потока', 'Removes the element from the flow'),
      t('Faqat flex konteynerda ishlaydi', 'Работает только во flex-контейнере', 'Only works inside a flex container'),
    ],
    a: 1,
    e: t(
      'Sticky element oqimdagi joyini saqlaydi va faqat o‘z ota konteyneri chegarasida yopishadi. Ota elementda overflow: hidden bo‘lsa, ko‘pincha ishlamay qoladi.',
      'Sticky-элемент сохраняет место в потоке и «липнет» только в пределах родителя. Часто ломается, если у предка overflow: hidden.',
      'A sticky element keeps its place in the flow and only sticks within its parent. It often breaks when an ancestor has overflow: hidden.',
    ),
  }),
  q({
    id: 'css-13', tech, diff: 'hard',
    q: t(
      'Silliq animatsiya uchun qaysi xususiyatlarni animatsiya qilish eng arzon (layout/paint qayta hisoblanmaydi)?',
      'Какие свойства дешевле всего анимировать для плавности (без пересчёта layout/paint)?',
      'Which properties are cheapest to animate smoothly (no layout/paint recalculation)?',
    ),
    o: [
      'width, height',
      'top, left',
      'margin, padding',
      'transform, opacity',
    ],
    a: 3,
    e: t(
      'transform va opacity odatda compositor’da GPU yordamida bajariladi. width/top/margin har kadrda layout’ni qayta hisoblashga majbur qiladi.',
      'transform и opacity обычно обрабатываются композитором на GPU. width/top/margin заставляют пересчитывать layout на каждом кадре.',
      'transform and opacity are usually handled by the compositor on the GPU. width/top/margin force layout recalculation on every frame.',
    ),
  }),
  q({
    id: 'css-14', tech, diff: 'medium',
    q: t(
      'Mobile-first yondashuvda odatda qanday media-so‘rov ishlatiladi?',
      'Какой медиазапрос обычно используют при подходе mobile-first?',
      'Which media query is typically used in a mobile-first approach?',
    ),
    o: [
      '@media (min-width: 768px) { ... }',
      '@media (max-width: 768px) { ... }',
      '@media (orientation: mobile) { ... }',
      '@media screen and (device: phone) { ... }',
    ],
    a: 0,
    e: t(
      'Mobile-first’da asosiy stillar mobil uchun yoziladi, kattaroq ekranlar uchun esa min-width bilan kengaytiriladi. max-width — desktop-first yondashuvi.',
      'При mobile-first базовые стили пишутся для мобильных, а для больших экранов расширяются через min-width. max-width — подход desktop-first.',
      'Mobile-first writes base styles for small screens and enhances for larger ones with min-width. max-width is the desktop-first approach.',
    ),
  }),
  q({
    id: 'css-15', tech, diff: 'hard',
    q: t(
      ':is() va :where() o‘rtasidagi asosiy farq nima?',
      'В чём главное различие между :is() и :where()?',
      'What is the key difference between :is() and :where()?',
    ),
    code: ':is(#main, .card) p { color: red; }\n:where(#main, .card) p { color: blue; }',
    o: [
      t(':where() faqat id’larni qabul qiladi', ':where() принимает только id', ':where() only accepts ids'),
      t(':is() eski brauzerlarda ishlamaydi, :where() ishlaydi', ':is() не работает в старых браузерах, а :where() работает', ':is() does not work in old browsers but :where() does'),
      t(':where() har doim 0 specificity’ga ega, :is() esa argumentlardagi eng yuqori specificity’ni oladi', ':where() всегда имеет нулевую специфичность, :is() берёт наибольшую специфичность аргументов', ':where() always has zero specificity, while :is() takes the specificity of its most specific argument'),
      t('Ular mutlaqo bir xil', 'Они полностью одинаковы', 'They are completely identical'),
    ],
    a: 2,
    e: t(
      'Shu sababli :where() kutubxona/reset stillari uchun qulay — ularni oson qayta yozish mumkin. Yuqoridagi misolda :is() varianti id specificity’sini oladi.',
      'Поэтому :where() удобен для библиотечных и reset-стилей — их легко переопределить. В примере вариант с :is() получает специфичность id.',
      'That makes :where() great for library/reset styles that should be easy to override. In the example the :is() rule gets id-level specificity.',
    ),
  }),
]

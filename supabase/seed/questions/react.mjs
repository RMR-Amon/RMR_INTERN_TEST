import { q, t } from './_helpers.mjs'

const tech = 'react'

export default [
  q({
    id: 'react-01', tech, diff: 'easy',
    q: t('JSX nima?', 'Что такое JSX?', 'What is JSX?'),
    o: [
      t('Brauzer to‘g‘ridan-to‘g‘ri bajaradigan yangi dasturlash tili', 'Новый язык, который браузер выполняет напрямую', 'A new language browsers execute directly'),
      t('JavaScript sintaksis kengaytmasi, u jsx()/React.createElement chaqiruvlariga kompilyatsiya qilinadi', 'Расширение синтаксиса JavaScript, которое компилируется в вызовы jsx()/React.createElement', 'A JavaScript syntax extension compiled into jsx()/React.createElement calls'),
      t('HTML shablonlash dvigateli, server tomonda ishlaydi', 'HTML-шаблонизатор, работающий на сервере', 'A server-side HTML template engine'),
      t('CSS-in-JS kutubxonasi', 'Библиотека CSS-in-JS', 'A CSS-in-JS library'),
    ],
    a: 1,
    e: t(
      'Brauzer JSX’ni tushunmaydi — Babel/SWC/esbuild uni oddiy JS funksiya chaqiruvlariga aylantiradi. Shu sababli JSX ichida {} orqali JS ifodalarini yozish mumkin.',
      'Браузер не понимает JSX — Babel/SWC/esbuild превращают его в обычные вызовы функций JS. Поэтому внутри JSX можно писать JS-выражения в {}.',
      'Browsers do not understand JSX — Babel/SWC/esbuild turn it into plain JS function calls. That is why you can embed JS expressions in {}.',
    ),
  }),
  q({
    id: 'react-02', tech, diff: 'easy',
    q: t(
      'Bola komponent o‘ziga kelgan props’ni o‘zgartira oladimi?',
      'Может ли дочерний компонент изменять полученные props?',
      'Can a child component modify the props it receives?',
    ),
    o: [
      t('Yo‘q — props faqat o‘qish uchun; o‘zgartirish uchun ota callback uzatadi', 'Нет — props только для чтения; для изменений родитель передаёт колбэк', 'No — props are read-only; the parent passes a callback to request changes'),
      t('Ha, props.value = x deb yozish kifoya', 'Да, достаточно написать props.value = x', 'Yes, just write props.value = x'),
      t('Faqat class komponentlarda', 'Только в классовых компонентах', 'Only in class components'),
      t('Faqat useEffect ichida', 'Только внутри useEffect', 'Only inside useEffect'),
    ],
    a: 0,
    e: t(
      'Ma’lumot yuqoridan pastga oqadi (one-way data flow). Bola holatni o‘zgartirish uchun ota tomonidan uzatilgan onChange kabi funksiyani chaqiradi.',
      'Данные текут сверху вниз (one-way data flow). Чтобы изменить состояние, ребёнок вызывает функцию, переданную родителем, например onChange.',
      'Data flows down (one-way data flow). To change state, the child calls a function passed by the parent, such as onChange.',
    ),
  }),
  q({
    id: 'react-03', tech, diff: 'easy',
    q: t('useState nimani qaytaradi?', 'Что возвращает useState?', 'What does useState return?'),
    code: 'const result = useState(0)',
    o: [
      t('Faqat joriy qiymatni', 'Только текущее значение', 'Only the current value'),
      t('Promise’ni', 'Promise', 'A Promise'),
      t('Ikki elementli massiv: [joriy qiymat, uni yangilovchi funksiya]', 'Массив из двух элементов: [текущее значение, функция обновления]', 'A two-element array: [current value, setter function]'),
      t('{ state, setState } obyektini', 'Объект { state, setState }', 'An object { state, setState }'),
    ],
    a: 2,
    e: t(
      'Odatda destructuring bilan yoziladi: const [count, setCount] = useState(0). Setter chaqirilganda komponent qayta render qilinadi.',
      'Обычно пишут с деструктуризацией: const [count, setCount] = useState(0). Вызов сеттера приводит к повторному рендеру.',
      'It is usually destructured: const [count, setCount] = useState(0). Calling the setter schedules a re-render.',
    ),
  }),
  q({
    id: 'react-04', tech, diff: 'medium',
    q: t(
      'Ro‘yxat render qilinganda key prop nima uchun kerak?',
      'Зачем нужен prop key при рендере списков?',
      'Why is the key prop needed when rendering lists?',
    ),
    code: '{todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}',
    o: [
      t('Elementlarni alifbo tartibida saralash uchun', 'Для сортировки элементов по алфавиту', 'To sort items alphabetically'),
      t('CSS stillarini qo‘llash uchun', 'Для применения CSS-стилей', 'To apply CSS styles'),
      t('Komponentga id prop sifatida yetkazish uchun', 'Чтобы передать компоненту id как prop', 'To pass the id as a prop to the component'),
      t('React renderlar orasida qaysi element qaysi ekanini aniqlashi va holatni to‘g‘ri saqlashi uchun', 'Чтобы React понимал, какой элемент какой между рендерами, и корректно сохранял состояние', 'So React can identify which item is which between renders and preserve state correctly'),
    ],
    a: 3,
    e: t(
      'key reconciliation jarayonida ishlatiladi va komponentga props sifatida yetib bormaydi. U barqaror va aka-ukalar orasida unikal bo‘lishi kerak.',
      'key используется при согласовании (reconciliation) и не передаётся в компонент как prop. Он должен быть стабильным и уникальным среди соседей.',
      'key is used during reconciliation and is not passed to the component as a prop. It must be stable and unique among siblings.',
    ),
  }),
  q({
    id: 'react-05', tech, diff: 'medium',
    q: t(
      'key sifatida massiv indeksidan foydalanish qachon xatoga olib keladi?',
      'Когда использование индекса массива в качестве key приводит к ошибкам?',
      'When does using the array index as a key cause bugs?',
    ),
    o: [
      t('Hech qachon — bu tavsiya etilgan usul', 'Никогда — это рекомендуемый способ', 'Never — it is the recommended approach'),
      t('Elementlar qo‘shilsa, o‘chirilsa yoki tartibi o‘zgarsa — holat (masalan, input qiymati) noto‘g‘ri elementga “o‘tib” qoladi', 'Когда элементы добавляются, удаляются или меняют порядок — состояние (например, значение input) «переезжает» к другому элементу', 'When items are inserted, removed or reordered — state (e.g. input values) sticks to the wrong item'),
      t('Faqat ro‘yxatda 100 dan ortiq element bo‘lsa', 'Только если в списке больше 100 элементов', 'Only when the list has more than 100 items'),
      t('Faqat class komponentlarda', 'Только в классовых компонентах', 'Only in class components'),
    ],
    a: 1,
    e: t(
      'Indeks elementga emas, pozitsiyaga bog‘langan. Statik, o‘zgarmaydigan ro‘yxatlarda indeks qabul qilinadi, boshqa hollarda barqaror id ishlating.',
      'Индекс привязан к позиции, а не к элементу. Для статичных неизменяемых списков индекс допустим, в остальных случаях используйте стабильный id.',
      'An index identifies a position, not an item. It is acceptable for static lists that never change; otherwise use a stable id.',
    ),
  }),
  q({
    id: 'react-06', tech, diff: 'medium',
    q: t(
      'Bo‘sh bog‘liqliklar massivi bilan useEffect qachon ishlaydi?',
      'Когда выполняется useEffect с пустым массивом зависимостей?',
      'When does useEffect with an empty dependency array run?',
    ),
    code: 'useEffect(() => {\n  const id = connect()\n  return () => disconnect(id)\n}, [])',
    o: [
      t('Har bir renderdan keyin', 'После каждого рендера', 'After every render'),
      t('Renderdan oldin, sinxron', 'Перед рендером, синхронно', 'Before render, synchronously'),
      t('Mount’dan keyin bir marta, cleanup esa unmount’da (dev StrictMode’da qo‘shimcha mount/unmount sikli bo‘ladi)', 'Один раз после монтирования, cleanup — при размонтировании (в dev StrictMode есть дополнительный цикл mount/unmount)', 'Once after mount, with cleanup on unmount (dev StrictMode adds an extra mount/unmount cycle)'),
      t('Hech qachon', 'Никогда', 'Never'),
    ],
    a: 2,
    e: t(
      'Bog‘liqliklar o‘zgarmagani uchun effekt qayta ishga tushmaydi. StrictMode dev rejimida cleanup to‘g‘ri yozilganini tekshirish uchun effektni ikki marta ishga tushiradi.',
      'Зависимости не меняются, поэтому эффект не перезапускается. В dev-режиме StrictMode запускает эффект дважды, чтобы проверить корректность cleanup.',
      'Since dependencies never change, the effect never re-runs. In development StrictMode runs it twice to verify that cleanup is correct.',
    ),
  }),
  q({
    id: 'react-07', tech, diff: 'medium',
    q: t(
      'Tugma bir marta bosilgandan keyin count qiymati qancha bo‘ladi?',
      'Чему будет равен count после одного клика?',
      'What will count be after one click?',
    ),
    code: 'const [count, setCount] = useState(0)\n\nfunction handleClick() {\n  setCount(count + 1)\n  setCount(count + 1)\n  setCount(count + 1)\n}',
    o: ['1', '3', '0', '2'],
    a: 0,
    e: t(
      'Har uch chaqiruv ham shu renderdagi count = 0 ni ko‘radi, natija 0 + 1. Oldingi qiymatga tayanish uchun updater ishlating: setCount(c => c + 1).',
      'Все три вызова видят count = 0 из текущего рендера, результат 0 + 1. Чтобы опираться на предыдущее значение, используйте updater: setCount(c => c + 1).',
      'All three calls see count = 0 from the current render, so the result is 0 + 1. Use an updater to build on the previous value: setCount(c => c + 1).',
    ),
  }),
  q({
    id: 'react-08', tech, diff: 'hard',
    q: t(
      'Nega bu taymer count’ni faqat 1 gacha oshiradi?',
      'Почему этот таймер увеличивает count только до 1?',
      'Why does this timer only ever increase count to 1?',
    ),
    code: 'useEffect(() => {\n  const id = setInterval(() => {\n    setCount(count + 1)\n  }, 1000)\n  return () => clearInterval(id)\n}, [])',
    o: [
      t('setInterval React ichida ishlamaydi', 'setInterval не работает внутри React', 'setInterval does not work inside React'),
      t('clearInterval darhol chaqiriladi', 'clearInterval вызывается сразу', 'clearInterval is called immediately'),
      t('React bir xil qiymatlarni birlashtirib yuboradi', 'React объединяет одинаковые значения', 'React merges identical values'),
      t('Callback birinchi renderdagi count = 0 ni “eslab qolgan” (stale closure); setCount(c => c + 1) bilan tuzatiladi', 'Колбэк «запомнил» count = 0 из первого рендера (устаревшее замыкание); исправляется через setCount(c => c + 1)', 'The callback captured count = 0 from the first render (stale closure); fix it with setCount(c => c + 1)'),
    ],
    a: 3,
    e: t(
      'Effekt faqat bir marta yaratilgan, shuning uchun ichidagi count doim 0. Updater funksiya yoki useRef eng yangi qiymatni olishga yordam beradi.',
      'Эффект создан один раз, поэтому count внутри всегда 0. Функция-updater или useRef позволяют получить актуальное значение.',
      'The effect is created once, so count inside it is always 0. An updater function or a ref gives access to the latest value.',
    ),
  }),
  q({
    id: 'react-09', tech, diff: 'medium',
    q: t('useMemo nima uchun ishlatiladi?', 'Для чего используется useMemo?', 'What is useMemo used for?'),
    code: 'const sorted = useMemo(() => sortBy(items, key), [items, key])',
    o: [
      t('Komponentni xotiradan o‘chirish uchun', 'Для удаления компонента из памяти', 'To remove a component from memory'),
      t('Qimmat hisoblash natijasini bog‘liqliklar o‘zgarmaguncha keshlash uchun', 'Для кэширования результата дорогого вычисления, пока зависимости не изменились', 'To cache the result of an expensive computation until dependencies change'),
      t('Ma’lumotlarni serverdan yuklash uchun', 'Для загрузки данных с сервера', 'To fetch data from the server'),
      t('Holatni localStorage’da saqlash uchun', 'Для сохранения состояния в localStorage', 'To persist state in localStorage'),
    ],
    a: 1,
    e: t(
      'useMemo qiymatni memoizatsiya qiladi va barqaror havolalarni saqlashga yordam beradi. Har bir oddiy hisoblashga qo‘llash shart emas — u ham o‘z narxiga ega.',
      'useMemo мемоизирует значение и помогает сохранять стабильные ссылки. Не нужно оборачивать в него каждое простое вычисление — это тоже имеет цену.',
      'useMemo memoizes a value and helps keep references stable. Do not wrap every trivial calculation — memoization has a cost too.',
    ),
  }),
  q({
    id: 'react-10', tech, diff: 'medium',
    q: t('useCallback nima qaytaradi?', 'Что возвращает useCallback?', 'What does useCallback return?'),
    o: [
      t('Funksiya chaqiruvi natijasini', 'Результат вызова функции', 'The result of calling the function'),
      t('Promise’ni', 'Promise', 'A Promise'),
      t('Bog‘liqliklar o‘zgarmaguncha bir xil havolaga ega memoizatsiya qilingan funksiyani', 'Мемоизированную функцию с той же ссылкой, пока зависимости не изменились', 'A memoized function that keeps the same reference until dependencies change'),
      t('Yangi komponentni', 'Новый компонент', 'A new component'),
    ],
    a: 2,
    e: t(
      'useCallback(fn, deps) ≈ useMemo(() => fn, deps). React.memo bilan o‘ralgan bolaga callback uzatilganda keraksiz renderlarning oldini oladi.',
      'useCallback(fn, deps) ≈ useMemo(() => fn, deps). Полезен при передаче колбэков в дочерние компоненты, обёрнутые в React.memo.',
      'useCallback(fn, deps) ≈ useMemo(() => fn, deps). Useful when passing callbacks to children wrapped in React.memo.',
    ),
  }),
  q({
    id: 'react-11', tech, diff: 'medium',
    q: t('React.memo nima qiladi?', 'Что делает React.memo?', 'What does React.memo do?'),
    code: 'const Row = React.memo(function Row({ user }) {\n  return <li>{user.name}</li>\n})',
    o: [
      t('Props sayoz (shallow) teng bo‘lsa, komponentni qayta render qilmaydi', 'Пропускает повторный рендер, если props поверхностно равны', 'Skips re-rendering when props are shallowly equal'),
      t('Komponent holatini saqlaydi', 'Сохраняет состояние компонента', 'Persists the component\'s state'),
      t('Komponentni lazy yuklaydi', 'Лениво загружает компонент', 'Lazy-loads the component'),
      t('Xatolarni ushlaydi', 'Перехватывает ошибки', 'Catches errors'),
    ],
    a: 0,
    e: t(
      'memo props’ni Object.is bilan solishtiradi. Har renderda yangi obyekt yoki funksiya uzatilsa, memo foyda bermaydi — useMemo/useCallback kerak bo‘ladi.',
      'memo сравнивает props через Object.is. Если на каждом рендере передаются новые объекты или функции, memo бесполезен — нужны useMemo/useCallback.',
      'memo compares props with Object.is. If you pass new objects or functions every render, memo will not help — you need useMemo/useCallback.',
    ),
  }),
  q({
    id: 'react-12', tech, diff: 'easy',
    q: t('Controlled component nima?', 'Что такое контролируемый компонент?', 'What is a controlled component?'),
    code: '<input value={name} onChange={e => setName(e.target.value)} />',
    o: [
      t('Admin tomonidan boshqariladigan komponent', 'Компонент, которым управляет администратор', 'A component managed by an admin'),
      t('Qiymatini DOM o‘zi saqlaydigan input', 'Input, значение которого хранит сам DOM', 'An input whose value is stored by the DOM itself'),
      t('Faqat o‘qish uchun bo‘lgan komponent', 'Компонент только для чтения', 'A read-only component'),
      t('Qiymati React holati orqali boshqariladigan va onChange orqali yangilanadigan forma elementi', 'Элемент формы, значение которого управляется состоянием React и обновляется через onChange', 'A form element whose value is driven by React state and updated via onChange'),
    ],
    a: 3,
    e: t(
      'Controlled’da “haqiqat manbai” — React state. Uncontrolled’da qiymat DOM’da bo‘ladi va ref orqali o‘qiladi (defaultValue).',
      'В контролируемом компоненте «источник истины» — состояние React. В неконтролируемом значение живёт в DOM и читается через ref (defaultValue).',
      'In a controlled component React state is the source of truth. In an uncontrolled one the DOM holds the value and you read it via a ref (defaultValue).',
    ),
  }),
  q({
    id: 'react-13', tech, diff: 'medium',
    q: t('useRef haqida qaysi gap to‘g‘ri?', 'Какое утверждение о useRef верно?', 'Which statement about useRef is true?'),
    o: [
      t('ref.current o‘zgarsa, komponent qayta render bo‘ladi', 'Изменение ref.current вызывает повторный рендер', 'Changing ref.current triggers a re-render'),
      t('U renderlar orasida saqlanadigan o‘zgaruvchan obyekt qaytaradi; .current o‘zgarishi renderga sabab bo‘lmaydi', 'Возвращает изменяемый объект, живущий между рендерами; изменение .current не вызывает рендер', 'It returns a mutable object that persists across renders; changing .current does not cause a render'),
      t('Faqat DOM elementlar uchun ishlaydi', 'Работает только с DOM-элементами', 'It only works with DOM elements'),
      t('Har renderda yangi obyekt yaratadi', 'Создаёт новый объект на каждом рендере', 'It creates a new object on every render'),
    ],
    a: 1,
    e: t(
      'useRef DOM elementga kirish uchun ham, taymer id, oldingi qiymat kabi renderga ta’sir qilmaydigan ma’lumotlarni saqlash uchun ham ishlatiladi.',
      'useRef используют и для доступа к DOM, и для хранения данных, не влияющих на рендер: id таймера, предыдущее значение и т.п.',
      'useRef is used both for DOM access and for storing values that should not trigger renders: timer ids, previous values, etc.',
    ),
  }),
  q({
    id: 'react-14', tech, diff: 'hard',
    q: t(
      'userId 1 dan 2 ga o‘zgarganda konsolga qanday tartibda chiqadi?',
      'В каком порядке будет вывод, когда userId меняется с 1 на 2?',
      'In what order are messages logged when userId changes from 1 to 2?',
    ),
    code: "useEffect(() => {\n  console.log('subscribe', userId)\n  return () => console.log('cleanup', userId)\n}, [userId])",
    o: [
      "subscribe 2 → cleanup 1",
      "subscribe 2 → cleanup 2",
      "cleanup 1 → subscribe 2",
      "cleanup 2 → subscribe 2",
    ],
    a: 2,
    e: t(
      'Yangi effekt ishga tushishidan oldin oldingi effektning cleanup’i o‘zining eski qiymatlari (userId = 1) bilan bajariladi. Cleanup unmount paytida ham chaqiriladi.',
      'Перед запуском нового эффекта выполняется cleanup предыдущего — со своими старыми значениями (userId = 1). Cleanup также вызывается при размонтировании.',
      'Before the new effect runs, the previous effect\'s cleanup runs with its own old values (userId = 1). Cleanup also runs on unmount.',
    ),
  }),
  q({
    id: 'react-15', tech, diff: 'medium',
    q: t(
      'Ikki aka-uka komponent bitta holatdan foydalanishi kerak. Eng to‘g‘ri yechim qaysi?',
      'Двум соседним компонентам нужно общее состояние. Какое решение самое правильное?',
      'Two sibling components need to share state. What is the most appropriate solution?',
    ),
    o: [
      t('Holatni eng yaqin umumiy ota komponentga ko‘tarish (lifting state up) va props orqali uzatish', 'Поднять состояние в ближайшего общего родителя (lifting state up) и передать через props', 'Lift the state up to the closest common parent and pass it down via props'),
      t('Har bir komponentda holatni nusxalab, useEffect bilan sinxronlash', 'Скопировать состояние в каждый компонент и синхронизировать через useEffect', 'Duplicate the state in both and sync with useEffect'),
      t('Global window obyektida saqlash', 'Хранить в глобальном объекте window', 'Store it on the global window object'),
      t('localStorage orqali almashish', 'Обмениваться через localStorage', 'Exchange it through localStorage'),
    ],
    a: 0,
    e: t(
      'Umumiy holat ularning umumiy otasida bo‘lishi kerak. Agar prop drilling juda chuqurlashsa, Context yoki state-menejer (Zustand, Redux) ko‘rib chiqiladi.',
      'Общее состояние должно жить в общем родителе. Если prop drilling становится слишком глубоким, рассматривают Context или стейт-менеджер (Zustand, Redux).',
      'Shared state belongs in the common parent. If prop drilling becomes too deep, consider Context or a state manager (Zustand, Redux).',
    ),
  }),
  q({
    id: 'react-16', tech, diff: 'medium',
    q: t(
      'Context value o‘zgarganda nima bo‘ladi?',
      'Что происходит, когда меняется value у Context?',
      'What happens when a Context value changes?',
    ),
    code: '<ThemeContext.Provider value={{ theme, toggle }}>\n  <App />\n</ThemeContext.Provider>',
    o: [
      t('Hech narsa, Context faqat bir marta o‘qiladi', 'Ничего, Context читается один раз', 'Nothing, Context is read only once'),
      t('Butun sahifa qayta yuklanadi', 'Вся страница перезагружается', 'The whole page reloads'),
      t('Faqat Provider qayta render bo‘ladi', 'Перерисовывается только Provider', 'Only the Provider re-renders'),
      t('Shu contextni useContext orqali o‘qiydigan barcha komponentlar qayta render bo‘ladi', 'Все компоненты, читающие этот контекст через useContext, перерисовываются', 'All components that read this context with useContext re-render'),
    ],
    a: 3,
    e: t(
      'Misolda har renderda yangi obyekt yaratiladi va iste’molchilar keraksiz render bo‘ladi. value’ni useMemo bilan barqarorlashtirish yoki contextni bo‘lish yordam beradi.',
      'В примере на каждом рендере создаётся новый объект, и потребители лишний раз перерисовываются. Помогает стабилизация value через useMemo или разделение контекста.',
      'In the example a new object is created every render, causing extra consumer renders. Stabilize value with useMemo or split the context.',
    ),
  }),
  q({
    id: 'react-17', tech, diff: 'hard',
    q: t(
      'Nega hook’larni shart (if) yoki sikl ichida chaqirish mumkin emas?',
      'Почему хуки нельзя вызывать внутри условий или циклов?',
      'Why can hooks not be called inside conditions or loops?',
    ),
    code: 'if (isLoggedIn) {\n  const [name, setName] = useState("")\n}',
    o: [
      t('Bu sintaksis xatosi hisoblanadi', 'Это синтаксическая ошибка', 'It is a syntax error'),
      t('React hook holatini chaqiruv tartibi bo‘yicha bog‘laydi; tartib renderlar orasida o‘zgarsa, holatlar aralashib ketadi', 'React связывает состояние хуков с порядком вызовов; если порядок меняется между рендерами, состояния путаются', 'React associates hook state with call order; if the order changes between renders, state gets mixed up'),
      t('Hook’lar sekin ishlaydi', 'Хуки работают медленно', 'Hooks are slow'),
      t('if ichida useState faqat class komponentlarda ishlaydi', 'useState внутри if работает только в классах', 'useState inside if only works in class components'),
    ],
    a: 1,
    e: t(
      'Har bir hook ichki ro‘yxatdagi indeksiga ko‘ra topiladi. Shuning uchun hook’lar har doim komponentning yuqori darajasida, bir xil tartibda chaqirilishi kerak.',
      'Каждый хук находится по своему индексу во внутреннем списке. Поэтому хуки всегда вызываются на верхнем уровне компонента в одном и том же порядке.',
      'Each hook is looked up by its index in an internal list. That is why hooks must always be called at the top level, in the same order.',
    ),
  }),
  q({
    id: 'react-18', tech, diff: 'hard',
    q: t(
      'count = 0 bo‘lganda bu komponent nimani render qiladi?',
      'Что отрендерит этот компонент при count = 0?',
      'What does this component render when count = 0?',
    ),
    code: 'return <div>{count && <p>New messages: {count}</p>}</div>',
    o: [
      t('Bo‘sh <div>', 'Пустой <div>', 'An empty <div>'),
      t('<p>New messages: 0</p>', '<p>New messages: 0</p>', '<p>New messages: 0</p>'),
      t('Ekranda “0” raqami', 'Цифру «0» на экране', 'The digit "0" on screen'),
      t('Xato yuz beradi', 'Произойдёт ошибка', 'An error is thrown'),
    ],
    a: 2,
    e: t(
      '0 && ... ifodasi 0 ni qaytaradi va React raqamlarni render qiladi. To‘g‘ri yozish: {count > 0 && ...} yoki ternary operator.',
      'Выражение 0 && ... возвращает 0, а React рендерит числа. Правильно: {count > 0 && ...} или тернарный оператор.',
      '0 && ... evaluates to 0, and React renders numbers. Write {count > 0 && ...} or use a ternary instead.',
    ),
  }),
  q({
    id: 'react-19', tech, diff: 'medium',
    q: t(
      'Reconciliation jarayonida React nima qiladi?',
      'Что делает React в процессе reconciliation (согласования)?',
      'What does React do during reconciliation?',
    ),
    o: [
      t('Yangi element daraxtini oldingisi bilan solishtiradi va DOM’ga faqat zarur o‘zgarishlarni kiritadi', 'Сравнивает новое дерево элементов с предыдущим и вносит в DOM только необходимые изменения', 'Compares the new element tree with the previous one and applies only the necessary DOM changes'),
      t('Har renderda butun DOM’ni noldan qayta yaratadi', 'На каждом рендере пересоздаёт весь DOM с нуля', 'Recreates the entire DOM from scratch on each render'),
      t('Serverdagi ma’lumotlar bilan sinxronlaydi', 'Синхронизирует данные с сервером', 'Synchronizes data with the server'),
      t('CSS fayllarini birlashtiradi', 'Объединяет CSS-файлы', 'Merges CSS files'),
    ],
    a: 0,
    e: t(
      'Agar element turi o‘zgarsa, React kichik daraxtni qayta yaratadi; tur va key bir xil bo‘lsa — mavjud DOM tugunini yangilaydi.',
      'Если тип элемента изменился, React пересоздаёт поддерево; при совпадении типа и key — обновляет существующий DOM-узел.',
      'If the element type changes, React rebuilds that subtree; if type and key match, it updates the existing DOM node.',
    ),
  }),
  q({
    id: 'react-20', tech, diff: 'hard',
    q: t(
      'useLayoutEffect useEffect’dan nimasi bilan farq qiladi?',
      'Чем useLayoutEffect отличается от useEffect?',
      'How does useLayoutEffect differ from useEffect?',
    ),
    o: [
      t('U faqat serverda ishlaydi', 'Работает только на сервере', 'It only runs on the server'),
      t('U renderdan oldin ishlaydi', 'Выполняется до рендера', 'It runs before render'),
      t('Farqi yo‘q, bu eskirgan nom', 'Разницы нет, это устаревшее имя', 'No difference, it is a deprecated alias'),
      t('DOM o‘zgarishlaridan keyin, lekin brauzer ekranni chizishidan oldin sinxron ishlaydi', 'Выполняется синхронно после изменений DOM, но до отрисовки браузером', 'It runs synchronously after DOM mutations but before the browser paints'),
    ],
    a: 3,
    e: t(
      'useLayoutEffect element o‘lchamini o‘lchab, pozitsiyani “miltillamasdan” to‘g‘rilash (tooltip) uchun kerak. U paint’ni bloklaydi, shuning uchun odatda useEffect afzal.',
      'useLayoutEffect нужен, чтобы измерить элемент и поправить позицию без «мигания» (тултип). Он блокирует отрисовку, поэтому обычно предпочтителен useEffect.',
      'useLayoutEffect is for measuring layout and adjusting position without flicker (e.g. tooltips). It blocks painting, so useEffect is usually preferred.',
    ),
  }),
]

import { q, t } from './_helpers.mjs'

const tech = 'typescript'

export default [
  q({
    id: 'ts-01', tech, diff: 'medium',
    q: t(
      'interface’ni type alias’dan ajratib turadigan imkoniyat qaysi?',
      'Какая возможность есть у interface, но нет у type alias?',
      'Which capability does an interface have that a type alias does not?',
    ),
    code: 'interface User { name: string }\ninterface User { age: number }\n// User = { name: string; age: number }',
    o: [
      t('Union tiplarni ifodalash', 'Описание union-типов', 'Expressing union types'),
      t('Declaration merging — bir xil nomli e’lonlar birlashtiriladi', 'Declaration merging — одноимённые объявления объединяются', 'Declaration merging — declarations with the same name are merged'),
      t('Primitiv tiplarga nom berish', 'Псевдонимы для примитивов', 'Aliasing primitive types'),
      t('Tuple tiplarni ifodalash', 'Описание кортежей', 'Expressing tuple types'),
    ],
    a: 1,
    e: t(
      'Ikki marta e’lon qilingan interface birlashadi; type esa “Duplicate identifier” xatosini beradi. Union, tuple va primitiv aliaslar faqat type orqali yoziladi.',
      'Дважды объявленный interface объединяется; type вызовет ошибку «Duplicate identifier». Union, кортежи и алиасы примитивов пишутся только через type.',
      'An interface declared twice is merged; a type alias gives a "Duplicate identifier" error. Unions, tuples and primitive aliases require type.',
    ),
  }),
  q({
    id: 'ts-02', tech, diff: 'easy',
    q: t('unknown va any o‘rtasidagi farq nima?', 'В чём разница между unknown и any?', 'What is the difference between unknown and any?'),
    code: "let a: any = 'x'\nlet u: unknown = 'x'\na.toUpperCase() // ok\nu.toUpperCase() // error",
    o: [
      t('unknown bilan ishlashdan oldin tipni toraytirish (narrowing) kerak; any esa tekshiruvni butunlay o‘chiradi', 'С unknown нужно сначала сузить тип (narrowing); any полностью отключает проверку', 'unknown requires narrowing before use; any disables type checking entirely'),
      t('Ular bir xil', 'Они одинаковы', 'They are the same'),
      t('unknown faqat null qabul qiladi', 'unknown принимает только null', 'unknown only accepts null'),
      t('any faqat raqamlar uchun', 'any только для чисел', 'any is only for numbers'),
    ],
    a: 0,
    e: t(
      'unknown — xavfsiz “top type”: unga istalgan qiymat beriladi, lekin typeof, instanceof yoki type guard’siz ishlatib bo‘lmaydi.',
      'unknown — безопасный «top type»: присвоить можно что угодно, но использовать нельзя без typeof, instanceof или type guard.',
      'unknown is the safe top type: anything can be assigned to it, but it cannot be used without typeof, instanceof or a type guard.',
    ),
  }),
  q({
    id: 'ts-03', tech, diff: 'easy',
    q: t('user.age xususiyatining tipi qanday?', 'Какой тип у свойства user.age?', 'What is the type of user.age?'),
    code: 'interface User {\n  name: string\n  age?: number\n}',
    o: ['number', 'number | null', 'number | undefined', 'any'],
    a: 2,
    e: t(
      '? belgisi xususiyatni ixtiyoriy qiladi — u yo‘q bo‘lishi mumkin, shuning uchun o‘qilganda tipi number | undefined.',
      'Знак ? делает свойство необязательным — его может не быть, поэтому при чтении тип number | undefined.',
      'The ? makes the property optional — it may be missing, so reading it yields number | undefined.',
    ),
  }),
  q({
    id: 'ts-04', tech, diff: 'medium',
    q: t('TypeScript bu kodga qanday munosabatda?', 'Как TypeScript отнесётся к этому коду?', 'How does TypeScript treat this code?'),
    code: "function format(x: string | number) {\n  if (typeof x === 'string') {\n    return x.toUpperCase()\n  }\n  return x.toFixed(2)\n}",
    o: [
      t('Xato: union tipida metodlarni chaqirib bo‘lmaydi', 'Ошибка: у union-типа нельзя вызывать методы', 'Error: methods cannot be called on a union type'),
      t('Xato: typeof faqat runtime’da ishlaydi', 'Ошибка: typeof работает только в runtime', 'Error: typeof only works at runtime'),
      t('any sifatida qabul qiladi', 'Воспринимает как any', 'Treats x as any'),
      t('Xatosiz: typeof tekshiruvi har bir shoxda tipni toraytiradi', 'Без ошибок: проверка typeof сужает тип в каждой ветке', 'No errors: the typeof check narrows the type in each branch'),
    ],
    a: 3,
    e: t(
      'Control flow analysis: if ichida x — string, undan keyin esa qolgan variant — number. Bu “type narrowing” deyiladi.',
      'Анализ потока управления: внутри if x — string, после него остаётся number. Это называется сужением типа (narrowing).',
      'Control-flow analysis: inside the if x is string, afterwards the remaining member is number. This is called type narrowing.',
    ),
  }),
  q({
    id: 'ts-05', tech, diff: 'medium',
    q: t(
      'Bu generic funksiyaning any’dan afzalligi nimada?',
      'В чём преимущество этой generic-функции перед any?',
      'What is the advantage of this generic function over using any?',
    ),
    code: 'function first<T>(items: T[]): T | undefined {\n  return items[0]\n}\nconst n = first([1, 2, 3])',
    o: [
      t('U tezroq ishlaydi', 'Работает быстрее', 'It runs faster'),
      t('Kiruvchi va chiquvchi tiplar o‘rtasidagi bog‘liqlik saqlanadi: n ning tipi number | undefined', 'Сохраняется связь между входным и выходным типом: n имеет тип number | undefined', 'It preserves the relationship between input and output types: n is number | undefined'),
      t('Runtime’da massivni tekshiradi', 'Проверяет массив в runtime', 'It validates the array at runtime'),
      t('Faqat raqamli massivlarni qabul qiladi', 'Принимает только числовые массивы', 'It only accepts numeric arrays'),
    ],
    a: 1,
    e: t(
      'T chaqiruv paytida avtomatik aniqlanadi (inference). any bo‘lsa, natija tipi yo‘qoladi va xatolar kompilyatsiyada aniqlanmaydi.',
      'T выводится автоматически при вызове (inference). С any тип результата теряется, и ошибки не ловятся при компиляции.',
      'T is inferred at the call site. With any, the result type is lost and mistakes are not caught at compile time.',
    ),
  }),
  q({
    id: 'ts-06', tech, diff: 'medium',
    q: t('Partial<User> qanday tip yaratadi?', 'Какой тип создаёт Partial<User>?', 'What type does Partial<User> produce?'),
    code: 'interface User { id: number; name: string; email: string }\ntype Draft = Partial<User>',
    o: [
      t('Faqat birinchi xususiyatni o‘z ichiga olgan tip', 'Тип только с первым свойством', 'A type with only the first property'),
      t('Barcha xususiyatlari readonly bo‘lgan tip', 'Тип со всеми свойствами readonly', 'A type with all properties readonly'),
      t('Barcha xususiyatlari ixtiyoriy (?) bo‘lgan tip', 'Тип, у которого все свойства необязательные (?)', 'A type where every property is optional (?)'),
      t('Barcha xususiyatlari string bo‘lgan tip', 'Тип, у которого все свойства string', 'A type where every property is a string'),
    ],
    a: 2,
    e: t(
      'Partial<T> = { [K in keyof T]?: T[K] }. Odatda yangilash (update) funksiyalari parametrlari uchun ishlatiladi. Teskarisi — Required<T>.',
      'Partial<T> = { [K in keyof T]?: T[K] }. Часто используется для параметров функций обновления. Обратный тип — Required<T>.',
      'Partial<T> = { [K in keyof T]?: T[K] }. Commonly used for update-function parameters. The opposite is Required<T>.',
    ),
  }),
  q({
    id: 'ts-07', tech, diff: 'hard',
    q: t('Key tipi nimaga teng?', 'Чему равен тип Key?', 'What is the type Key?'),
    code: "const config = { host: 'localhost', port: 5432 }\ntype Key = keyof typeof config",
    o: ['"host" | "port"', 'string', '{ host: string; port: number }', 'string | number'],
    a: 0,
    e: t(
      'typeof config qiymatdan tip oladi, keyof esa uning kalitlari birlashmasini (union) qaytaradi. Bu juftlik konfiguratsiya obyektlari bilan ishlashda juda foydali.',
      'typeof config получает тип из значения, а keyof возвращает объединение его ключей. Эта связка очень полезна для объектов конфигурации.',
      'typeof config extracts a type from a value and keyof returns the union of its keys. This combo is very useful with config objects.',
    ),
  }),
  q({
    id: 'ts-08', tech, diff: 'hard',
    q: t(
      'Bu kodda never tipi qanday vazifani bajaradi?',
      'Какую задачу решает тип never в этом коде?',
      'What role does the never type play in this code?',
    ),
    code: "type Shape = { kind: 'circle'; r: number } | { kind: 'square'; a: number }\n\nfunction area(s: Shape) {\n  switch (s.kind) {\n    case 'circle': return Math.PI * s.r ** 2\n    case 'square': return s.a ** 2\n    default:\n      const check: never = s\n      return check\n  }\n}",
    o: [
      t('Funksiyani asinxron qiladi', 'Делает функцию асинхронной', 'Makes the function async'),
      t('Runtime’da xato tashlaydi', 'Бросает ошибку в runtime', 'Throws an error at runtime'),
      t('Hech qanday vazifa bajarmaydi', 'Ничего не делает', 'It does nothing'),
      t('Exhaustive check: Shape’ga yangi variant qo‘shilsa va u qayta ishlanmasa, kompilyatsiya xatosi chiqadi', 'Проверка полноты: если в Shape добавят вариант и не обработают его, будет ошибка компиляции', 'Exhaustiveness check: if a new Shape variant is added but not handled, compilation fails'),
    ],
    a: 3,
    e: t(
      'Barcha holatlar ko‘rib chiqilganda s ning tipi never’ga torayadi. Yangi variant (masalan, triangle) qo‘shilsa, uni never’ga tayinlab bo‘lmaydi va TS xato beradi.',
      'Когда все варианты обработаны, тип s сужается до never. Если добавить новый (например, triangle), его нельзя присвоить never, и TS выдаст ошибку.',
      'When all cases are handled, s narrows to never. Adding a new variant (e.g. triangle) makes the assignment to never fail at compile time.',
    ),
  }),
  q({
    id: 'ts-09', tech, diff: 'medium',
    q: t('as const nima qiladi?', 'Что делает as const?', 'What does as const do?'),
    code: "const roles = ['admin', 'student'] as const\ntype Role = typeof roles[number]",
    o: [
      t('Massivni runtime’da muzlatadi (Object.freeze)', 'Замораживает массив в runtime (Object.freeze)', 'Freezes the array at runtime (Object.freeze)'),
      t('Eng tor literal tiplarni chiqaradi va readonly qiladi: Role = "admin" | "student"', 'Выводит самые узкие литеральные типы и делает readonly: Role = "admin" | "student"', 'Infers the narrowest literal types and makes it readonly: Role = "admin" | "student"'),
      t('Massivni const o‘zgaruvchiga aylantiradi', 'Превращает массив в const-переменную', 'Turns the array into a const variable'),
      t('Role tipini string qiladi', 'Делает тип Role равным string', 'Makes Role equal to string'),
    ],
    a: 1,
    e: t(
      'as const bo‘lmasa, tip string[] bo‘lardi. U faqat kompilyatsiya vaqtidagi tiplarga ta’sir qiladi, runtime’da obyektni muzlatmaydi.',
      'Без as const тип был бы string[]. Он влияет только на типы при компиляции и не замораживает объект в runtime.',
      'Without as const the type would be string[]. It only affects compile-time types and does not freeze anything at runtime.',
    ),
  }),
  q({
    id: 'ts-10', tech, diff: 'hard',
    q: t('PublicUser tipi qanday?', 'Каким будет тип PublicUser?', 'What is the PublicUser type?'),
    code: "interface User {\n  id: number\n  name: string\n  password: string\n}\ntype PublicUser = Omit<User, 'password'>",
    o: [
      '{ password: string }',
      '{ id: number; name: string; password?: string }',
      '{ id: number; name: string }',
      'never',
    ],
    a: 2,
    e: t(
      'Omit<T, K> T dan K kalitlarini olib tashlaydi. Pick<T, K> esa aksincha — faqat ko‘rsatilgan kalitlarni qoldiradi.',
      'Omit<T, K> удаляет из T ключи K. Pick<T, K> делает обратное — оставляет только указанные ключи.',
      'Omit<T, K> removes keys K from T. Pick<T, K> does the opposite — keeps only the listed keys.',
    ),
  }),
]

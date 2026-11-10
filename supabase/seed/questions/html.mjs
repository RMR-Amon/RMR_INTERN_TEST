import { q, t } from './_helpers.mjs'

const tech = 'html'

export default [
  q({
    id: 'html-01', tech, diff: 'easy',
    q: t(
      'Saytning asosiy navigatsiya havolalari uchun qaysi semantik teg to‘g‘ri?',
      'Какой семантический тег правильно использовать для основной навигации сайта?',
      'Which semantic tag is correct for the main navigation links of a site?',
    ),
    o: ['<navigation>', '<nav>', '<menu>', '<div class="nav">'],
    a: 1,
    e: t(
      '<nav> — navigatsiya bloklari uchun mo‘ljallangan semantik teg. Ekran o‘quvchilar uni “navigation” landmark sifatida taniydi. <navigation> degan teg mavjud emas.',
      '<nav> — семантический тег для навигационных блоков. Скринридеры распознают его как landmark «navigation». Тега <navigation> не существует.',
      '<nav> is the semantic element for navigation blocks. Screen readers expose it as a "navigation" landmark. There is no <navigation> element.',
    ),
  }),
  q({
    id: 'html-02', tech, diff: 'easy',
    q: t(
      '<!DOCTYPE html> deklaratsiyasi nima qiladi?',
      'Что делает объявление <!DOCTYPE html>?',
      'What does the <!DOCTYPE html> declaration do?',
    ),
    o: [
      t('HTML faylni JavaScript’ga ulaydi', 'Подключает HTML-файл к JavaScript', 'Connects the HTML file to JavaScript'),
      t('Sahifa kodirovkasini UTF-8 qilib belgilaydi', 'Устанавливает кодировку страницы UTF-8', 'Sets the page encoding to UTF-8'),
      t('Brauzerni standart rejimda (standards mode) ishlashga majbur qiladi', 'Переводит браузер в стандартный режим (standards mode)', 'Makes the browser render the page in standards mode'),
      t('Sahifani qidiruv tizimlaridan yashiradi', 'Скрывает страницу от поисковых систем', 'Hides the page from search engines'),
    ],
    a: 2,
    e: t(
      'DOCTYPE bo‘lmasa, brauzer “quirks mode”ga o‘tadi va eski, nostandart render qoidalarini qo‘llaydi. Kodirovka <meta charset="UTF-8"> bilan belgilanadi.',
      'Без DOCTYPE браузер переходит в «quirks mode» и использует устаревшие нестандартные правила рендеринга. Кодировка задаётся через <meta charset="UTF-8">.',
      'Without a DOCTYPE the browser falls back to "quirks mode" with legacy, non‑standard rendering rules. Encoding is set by <meta charset="UTF-8">.',
    ),
  }),
  q({
    id: 'html-03', tech, diff: 'easy',
    q: t(
      'Rasm uchun muqobil (alternativ) matn qaysi atribut orqali beriladi?',
      'Какой атрибут задаёт альтернативный текст для изображения?',
      'Which attribute provides alternative text for an image?',
    ),
    o: ['alt', 'title', 'caption', 'aria-image'],
    a: 0,
    e: t(
      'alt atributi rasm yuklanmaganda ko‘rsatiladi va ekran o‘quvchilar tomonidan o‘qiladi. Dekorativ rasmlar uchun alt="" qo‘yiladi.',
      'Атрибут alt отображается, если изображение не загрузилось, и зачитывается скринридерами. Для декоративных картинок используют alt="".',
      'alt is shown when the image fails to load and is read by screen readers. Decorative images should use alt="".',
    ),
  }),
  q({
    id: 'html-04', tech, diff: 'medium',
    q: t(
      '<article> tegi qachon ishlatilishi kerak?',
      'Когда следует использовать тег <article>?',
      'When should the <article> element be used?',
    ),
    o: [
      t('Har qanday matnli blok uchun', 'Для любого текстового блока', 'For any block of text'),
      t('Faqat sahifaning pastki qismi uchun', 'Только для подвала страницы', 'Only for the page footer'),
      t('Stillar berish uchun o‘ram (wrapper) sifatida', 'Как обёртку для стилизации', 'As a wrapper for styling purposes'),
      t('Mustaqil ma’noga ega, alohida tarqatilishi mumkin bo‘lgan kontent uchun (post, yangilik, izoh)', 'Для самостоятельного контента, который можно распространять отдельно (пост, новость, комментарий)', 'For self-contained content that could be distributed independently (post, news item, comment)'),
    ],
    a: 3,
    e: t(
      '<article> — o‘z-o‘zidan tushunarli, mustaqil kontent. <section> esa sarlavhaga ega tematik guruh. Faqat stil uchun <div> ishlatiladi.',
      '<article> — самодостаточный, независимый контент. <section> — тематическая группа с заголовком. Для обёртки ради стилей используют <div>.',
      '<article> is self-contained, independent content. <section> is a thematic grouping, usually with a heading. Use <div> for styling-only wrappers.',
    ),
  }),
  q({
    id: 'html-05', tech, diff: 'medium',
    q: t(
      'defer atributli skriptlar qanday bajariladi?',
      'Как выполняются скрипты с атрибутом defer?',
      'How are scripts with the defer attribute executed?',
    ),
    code: '<script defer src="a.js"></script>\n<script defer src="b.js"></script>',
    o: [
      t('Yuklanishi bilanoq, HTML parsingni to‘xtatib', 'Сразу после загрузки, блокируя парсинг HTML', 'As soon as they load, blocking HTML parsing'),
      t('HTML to‘liq parse qilingandan keyin, hujjatdagi tartibda', 'После полного парсинга HTML, в порядке следования в документе', 'After HTML parsing finishes, in document order'),
      t('Yuklanishi bilanoq, istalgan tartibda', 'Сразу после загрузки, в произвольном порядке', 'As soon as they load, in any order'),
      t('Faqat foydalanuvchi sahifani skroll qilganda', 'Только когда пользователь прокручивает страницу', 'Only when the user scrolls the page'),
    ],
    a: 1,
    e: t(
      'defer skriptlari parallel yuklanadi, lekin DOMContentLoaded’dan oldin hujjatdagi tartibda bajariladi. async esa yuklanishi bilan, tartibsiz bajariladi.',
      'defer-скрипты загружаются параллельно, но выполняются по порядку перед DOMContentLoaded. async выполняются сразу после загрузки, без гарантии порядка.',
      'defer scripts download in parallel but run in order right before DOMContentLoaded. async scripts run as soon as they load, in no guaranteed order.',
    ),
  }),
  q({
    id: 'html-06', tech, diff: 'easy',
    q: t(
      'Qaysi input turi brauzerda email formatini avtomatik tekshiradi?',
      'Какой тип input автоматически проверяет формат email в браузере?',
      'Which input type gets built-in email format validation in the browser?',
    ),
    o: ['type="text"', 'type="mail"', 'type="email"', 'type="address"'],
    a: 2,
    e: t(
      'type="email" brauzerning o‘rnatilgan validatsiyasini yoqadi va mobil qurilmalarda “@” belgili klaviaturani ochadi. type="mail" mavjud emas.',
      'type="email" включает встроенную валидацию браузера и открывает клавиатуру с «@» на мобильных. type="mail" не существует.',
      'type="email" enables built-in validation and shows an "@" keyboard on mobile devices. type="mail" does not exist.',
    ),
  }),
  q({
    id: 'html-07', tech, diff: 'medium',
    q: t(
      'data-* atributlari nima uchun ishlatiladi?',
      'Для чего используются атрибуты data-*?',
      'What are data-* attributes used for?',
    ),
    code: '<li data-user-id="42">Ali</li>\n// el.dataset.userId === "42"',
    o: [
      t('Elementda qo‘shimcha maxsus ma’lumot saqlash uchun, JS’da dataset orqali o‘qiladi', 'Для хранения пользовательских данных на элементе, доступных в JS через dataset', 'To store custom data on an element, readable in JS via dataset'),
      t('Serverga ma’lumot yuborish uchun', 'Для отправки данных на сервер', 'To send data to the server'),
      t('Elementni ekran o‘quvchilardan yashirish uchun', 'Чтобы скрыть элемент от скринридеров', 'To hide the element from screen readers'),
      t('Ma’lumotlar bazasiga ulanish uchun', 'Для подключения к базе данных', 'To connect to a database'),
    ],
    a: 0,
    e: t(
      'data-* — HTML elementiga maxsus ma’lumot biriktirishning standart usuli. Kebab-case nomlar dataset’da camelCase’ga aylanadi (data-user-id → dataset.userId).',
      'data-* — стандартный способ прикрепить к элементу свои данные. Kebab-case имена превращаются в camelCase в dataset (data-user-id → dataset.userId).',
      'data-* is the standard way to attach custom data to an element. Kebab-case names become camelCase in dataset (data-user-id → dataset.userId).',
    ),
  }),
  q({
    id: 'html-08', tech, diff: 'medium',
    q: t(
      '<label> elementidagi for atributi nima qiladi?',
      'Что делает атрибут for у элемента <label>?',
      'What does the for attribute on a <label> do?',
    ),
    code: '<label for="email">Email</label>\n<input id="email" type="email" />',
    o: [
      t('Labelni sikl (loop) ichida takrorlaydi', 'Повторяет label в цикле', 'Repeats the label in a loop'),
      t('Input qiymatini avtomatik to‘ldiradi', 'Автоматически заполняет значение input', 'Auto-fills the input value'),
      t('Labelga CSS klass qo‘shadi', 'Добавляет label CSS-класс', 'Adds a CSS class to the label'),
      t('Labelni id orqali inputga bog‘laydi: label bosilganda input fokuslanadi va u ekran o‘quvchiga nom beradi', 'Связывает label с input по id: клик по label фокусирует поле, и скринридер получает его имя', 'Associates the label with the input by id: clicking the label focuses the input and gives it an accessible name'),
    ],
    a: 3,
    e: t(
      'for="email" label’ni id="email" bo‘lgan boshqaruv elementiga bog‘laydi. Bu accessibility uchun muhim va bosish maydonini kattalashtiradi.',
      'for="email" связывает label с контролом id="email". Это важно для доступности и увеличивает область клика.',
      'for="email" links the label to the control with id="email". This is essential for accessibility and enlarges the click target.',
    ),
  }),
  q({
    id: 'html-09', tech, diff: 'easy',
    q: t(
      'Quyidagilardan qaysi biri sukut bo‘yicha inline element hisoblanadi?',
      'Какой из перечисленных элементов по умолчанию является строчным (inline)?',
      'Which of these elements is inline by default?',
    ),
    o: ['<div>', '<span>', '<p>', '<section>'],
    a: 1,
    e: t(
      '<span> — inline element, u yangi qatordan boshlanmaydi va faqat kontent kengligini egallaydi. <div>, <p>, <section> — blok elementlar.',
      '<span> — строчный элемент: не начинается с новой строки и занимает ширину содержимого. <div>, <p>, <section> — блочные.',
      '<span> is inline: it does not start on a new line and only takes the width of its content. <div>, <p> and <section> are block elements.',
    ),
  }),
  q({
    id: 'html-10', tech, diff: 'hard',
    q: t(
      '<form> ichidagi type atributisiz <button> bosilsa nima bo‘ladi?',
      'Что произойдёт при клике на <button> без атрибута type внутри <form>?',
      'What happens when a <button> without a type attribute inside a <form> is clicked?',
    ),
    code: '<form action="/save">\n  <input name="title" />\n  <button>Preview</button>\n</form>',
    o: [
      t('Hech narsa, tugma sukut bo‘yicha type="button"', 'Ничего, по умолчанию type="button"', 'Nothing, the default is type="button"'),
      t('Forma tozalanadi (reset)', 'Форма сбросится (reset)', 'The form is reset'),
      t('Forma yuboriladi, chunki sukut bo‘yicha type="submit"', 'Форма отправится, так как по умолчанию type="submit"', 'The form is submitted because the default type is "submit"'),
      t('Brauzer xato chiqaradi', 'Браузер выдаст ошибку', 'The browser throws an error'),
    ],
    a: 2,
    e: t(
      'Forma ichidagi <button> sukut bo‘yicha submit tugmasi. Yuborishni xohlamasangiz, type="button" ni aniq yozing — bu ko‘p uchraydigan xato.',
      'У <button> внутри формы тип по умолчанию — submit. Если отправка не нужна, явно укажите type="button" — это частая ошибка.',
      'A <button> inside a form defaults to type="submit". If you do not want to submit, set type="button" explicitly — a very common bug.',
    ),
  }),
  q({
    id: 'html-11', tech, diff: 'easy',
    q: t(
      'Mobil qurilmalarda responsive dizayn to‘g‘ri ishlashi uchun qaysi meta-teg kerak?',
      'Какой meta-тег нужен для корректной адаптивной вёрстки на мобильных устройствах?',
      'Which meta tag is required for responsive layouts to work correctly on mobile devices?',
    ),
    o: [
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<meta name="mobile" content="true">',
      '<meta http-equiv="responsive" content="yes">',
      '<meta name="screen" content="auto">',
    ],
    a: 0,
    e: t(
      'Viewport meta-tegisiz mobil brauzer sahifani ~980px kenglikda chizadi va kichraytiradi, natijada media-so‘rovlar kutilgandek ishlamaydi.',
      'Без meta viewport мобильный браузер рендерит страницу шириной ~980px и масштабирует её, из‑за чего медиазапросы работают не так, как ожидается.',
      'Without the viewport meta tag, mobile browsers render at ~980px wide and zoom out, so media queries do not behave as expected.',
    ),
  }),
  q({
    id: 'html-12', tech, diff: 'medium',
    q: t(
      'localStorage va sessionStorage o‘rtasidagi asosiy farq nima?',
      'В чём основное различие между localStorage и sessionStorage?',
      'What is the main difference between localStorage and sessionStorage?',
    ),
    o: [
      t('localStorage faqat raqamlarni saqlaydi', 'localStorage хранит только числа', 'localStorage stores numbers only'),
      t('sessionStorage ma’lumotlarni serverga yuboradi', 'sessionStorage отправляет данные на сервер', 'sessionStorage sends data to the server'),
      t('Ular orasida farq yo‘q', 'Разницы нет', 'There is no difference'),
      t('sessionStorage tab yopilganda tozalanadi, localStorage esa o‘chirilmaguncha saqlanadi', 'sessionStorage очищается при закрытии вкладки, localStorage хранится до явного удаления', 'sessionStorage is cleared when the tab closes; localStorage persists until explicitly removed'),
    ],
    a: 3,
    e: t(
      'Ikkalasi ham faqat satrlarni saqlaydi va serverga yuborilmaydi (cookie’dan farqli). sessionStorage bitta tab sessiyasiga bog‘langan.',
      'Оба хранят только строки и не отправляются на сервер (в отличие от cookie). sessionStorage привязан к сессии одной вкладки.',
      'Both store strings only and are never sent to the server (unlike cookies). sessionStorage is scoped to a single tab session.',
    ),
  }),
  q({
    id: 'html-13', tech, diff: 'hard',
    q: t(
      'loading="lazy" atributi <img> uchun nima qiladi?',
      'Что делает атрибут loading="lazy" у <img>?',
      'What does loading="lazy" do on an <img>?',
    ),
    code: '<img src="photo.jpg" alt="Team" loading="lazy" width="600" height="400">',
    o: [
      t('Rasmni past sifatda yuklaydi', 'Загружает изображение в низком качестве', 'Loads the image in low quality'),
      t('Ekrandan tashqaridagi rasm yuklanishini u viewport’ga yaqinlashguncha kechiktiradi', 'Откладывает загрузку изображения вне экрана, пока оно не приблизится к viewport', 'Defers loading an off-screen image until it gets close to the viewport'),
      t('Rasmni faqat bosilganda yuklaydi', 'Загружает изображение только по клику', 'Loads the image only on click'),
      t('Rasmni keshga saqlashni taqiqlaydi', 'Запрещает кэширование изображения', 'Prevents the image from being cached'),
    ],
    a: 1,
    e: t(
      'Native lazy loading trafik va dastlabki yuklanish vaqtini tejaydi. width/height berish layout siljishini (CLS) oldini oladi. Birinchi ekrandagi asosiy rasmga lazy qo‘ymang.',
      'Нативная ленивая загрузка экономит трафик и время первой загрузки. width/height предотвращают сдвиг макета (CLS). Не ставьте lazy на главное изображение первого экрана.',
      'Native lazy loading saves bandwidth and initial load time. width/height prevent layout shift (CLS). Do not lazy-load the main above-the-fold image.',
    ),
  }),
  q({
    id: 'html-14', tech, diff: 'medium',
    q: t(
      'Izohli (caption) diagramma yoki rasm uchun qaysi teglar juftligi semantik jihatdan to‘g‘ri?',
      'Какая пара тегов семантически верна для изображения или диаграммы с подписью?',
      'Which pair of elements is semantically correct for an image or diagram with a caption?',
    ),
    o: [
      '<div> + <span>',
      '<picture> + <caption>',
      '<figure> + <figcaption>',
      '<img> + <label>',
    ],
    a: 2,
    e: t(
      '<figure> mustaqil illyustratsiyani, <figcaption> esa uning izohini bildiradi. <caption> faqat <table> uchun ishlatiladi.',
      '<figure> обозначает самостоятельную иллюстрацию, <figcaption> — её подпись. <caption> используется только внутри <table>.',
      '<figure> marks self-contained illustrative content and <figcaption> its caption. <caption> is only valid inside <table>.',
    ),
  }),
  q({
    id: 'html-15', tech, diff: 'hard',
    q: t(
      'Nega bosiladigan boshqaruv elementi uchun <div onclick> o‘rniga native <button> afzal?',
      'Почему для кликабельного элемента управления нативный <button> предпочтительнее <div onclick>?',
      'Why is a native <button> preferred over <div onclick> for a clickable control?',
    ),
    o: [
      t('<button> tezroq render qilinadi', '<button> быстрее рендерится', '<button> renders faster'),
      t('<div> ga onclick qo‘shib bo‘lmaydi', 'К <div> нельзя добавить onclick', 'You cannot attach onclick to a <div>'),
      t('<button> avtomatik ravishda chiroyli stil oladi', '<button> автоматически получает красивые стили', '<button> automatically gets nice styling'),
      t('<button> fokuslanadi, Enter/Space bilan ishlaydi va yordamchi texnologiyalarga “button” roli bilan ko‘rinadi', '<button> фокусируется, работает с Enter/Space и виден вспомогательным технологиям с ролью «button»', '<button> is focusable, works with Enter/Space and is exposed to assistive tech with the "button" role'),
    ],
    a: 3,
    e: t(
      '<div> ni accessible qilish uchun role="button", tabindex="0" va klaviatura ishlovchilari kerak bo‘ladi. Native <button> bularning barchasini bepul beradi.',
      'Чтобы сделать <div> доступным, нужны role="button", tabindex="0" и обработчики клавиатуры. Нативный <button> даёт всё это бесплатно.',
      'Making a <div> accessible requires role="button", tabindex="0" and keyboard handlers. A native <button> gives you all of this for free.',
    ),
  }),
]

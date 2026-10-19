# NavigationView

Каркас приложения: слева боковая панель навигации, справа область страницы. Панель умеет сворачиваться в узкую полосу с иконками, а при ширине окна меньше порога сворачивается сама. Смена страницы анимируется: старая уходит вниз с затуханием, новая выезжает снизу. Поведение близко к [WinUI NavigationView](https://learn.microsoft.com/windows/apps/design/controls/navigationview) и [Apple HIG: Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars).

Компонент состоит из шести частей:

| Компонент | Назначение |
| --- | --- |
| `NavigationView` | Корень: панель, область страницы, состояние выбора и раскрытия |
| `NavItem` | Пункт панели |
| `NavCategory` | Раскрывающаяся группа пунктов. В свёрнутой панели открывается всплывающим меню |
| `NavSubItem` | Пункт внутри `NavCategory` (без иконки, с отступом) |
| `NavSectionHeader` | Подпись секции. В свёрнутой панели скрывается |
| `NavDivider` | Горизонтальный разделитель |

`NavItem`, `NavSubItem` и `NavCategory` работают только внутри `NavigationView`. Вне его бросят ошибку: «NavItem / NavCategory / NavSubItem нужно использовать внутри `<NavigationView>`».

## Подключение

Файлы лежат рядом с `index.css`:

```
NavigationView.tsx
NavigationView.module.css
GlassPanel/      // всплывающее меню категории в свёрнутой панели
Button/          // кнопка показа и скрытия панели
index.css        // токены
```

```tsx
import {
  NavigationView,
  NavItem,
  NavSubItem,
  NavCategory,
  NavSectionHeader,
  NavDivider,
} from "./NavigationView";
```

Корень занимает `width: 100%` и `height: 100%` родителя, поэтому у родителя должна быть заданная высота (например, `height: 100vh`).

## Быстрый старт

```tsx
<div style={{ height: "100vh" }}>
  <NavigationView
    paneTitle="Моё приложение"
    defaultSelectedValue="home"
    menuItems={
      <>
        <NavItem value="home" icon={<HomeIcon />}>Главная</NavItem>
        <NavItem value="users" icon={<UsersIcon />}>Пользователи</NavItem>
      </>
    }
    footerMenuItems={
      <NavItem value="settings" icon={<SettingsIcon />}>Настройки</NavItem>
    }
  >
    {/* Здесь рисуется текущая страница */}
    <CurrentPage />
  </NavigationView>
</div>
```

Страница не выбирается компонентом сама: `children` рисуются как есть. Выбранное значение нужно сопоставить со страницей в вашем коде (`switch`, объект с компонентами, роутер).

## Свойства `NavigationView`

Остальные атрибуты `<div>` (кроме `onSelect`) попадают на корневой элемент. `className` и `style` тоже на корень.

### Содержимое

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Текущая страница |
| `menuItems` | `ReactNode` | — | Основные пункты. Область прокручивается, если пунктов много |
| `footerMenuItems` | `ReactNode` | — | Пункты в нижней части панели, под основными, прокручиваться не будут |
| `paneTitle` | `ReactNode` | — | Заголовок в верхней строке панели. В свёрнутой панели скрыт |
| `paneHeader` | `ReactNode \| ({ isPaneOpen }) => ReactNode` | — | Слот под верхней строкой (например, профиль). **Только в раскрытой панели** |
| `paneCustomContent` | `ReactNode \| ({ isPaneOpen }) => ReactNode` | — | Слот под `paneHeader` (например, поле поиска). **Только в раскрытой панели** |
| `paneFooter` | `ReactNode \| ({ isPaneOpen }) => ReactNode` | — | Слот в самом низу панели. Рисуется всегда, поэтому в функции стоит проверять `isPaneOpen` |
| `pageKey` | `string \| number` | выбранное значение | Ключ страницы. При смене запускается анимация перехода |

Порядок сверху вниз: верхняя строка, `paneHeader`, `paneCustomContent`, `menuItems`, `footerMenuItems`, `paneFooter`.

### Режим панели

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `paneDisplayMode` | `"auto" \| "left" \| "leftCompact"` | `"auto"` | См. таблицу ниже |
| `expandedModeThresholdWidth` | `number` | `900` | Ширина корня (px), от которой в режиме `auto` панель раскрыта. `0` отключает адаптивность |
| `isPaneOpen` | `boolean` | — | Раскрыта ли панель (управляемый режим) |
| `onPaneOpenChange` | `(isOpen: boolean) => void` | — | Вызывается при нажатии на кнопку панели и при смене режима по ширине. В режиме `auto` передавайте функцию с постоянной ссылкой (`setState` или `useCallback`), см. [Ограничения](#ограничения) |
| `isPaneToggleButtonVisible` | `boolean` | `true` | Показывать кнопку раскрытия. В режиме `left` кнопки нет в любом случае |
| `paneAriaLabel` | `string` | `"Основная навигация"` | `aria-label` элемента `<nav>` |
| `toggleButtonLabel` | `string` | `"Показать или скрыть боковую панель"` | `aria-label` и подсказка кнопки раскрытия |

| Режим | Начальное состояние | Кнопка раскрытия | Реакция на ширину |
| --- | --- | --- | --- |
| `auto` | раскрыта | есть | При пересечении порога панель раскрывается или сворачивается сама |
| `left` | раскрыта | нет | Нет |
| `leftCompact` | свёрнута | есть | Нет |

### Выбор и раскрытие категорий

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `selectedValue` | `string \| number` | — | Выбранное значение (управляемый режим) |
| `defaultSelectedValue` | `string \| number` | — | Начальное значение (неуправляемый режим) |
| `onNavItemSelect` | `(event, { value }) => void` | — | Нажатие на пункт со `value`. Вызывается **при каждом нажатии**, в том числе на уже выбранный пункт |
| `onSelectionChanged` | `(event, { value }) => void` | — | Выбранное значение изменилось. Не вызывается для уже выбранного пункта и для пунктов с `selectsOnInvoked={false}` |
| `openCategories` | `Array<string \| number>` | — | Значения раскрытых категорий (управляемый режим) |
| `defaultOpenCategories` | `Array<string \| number>` | `[]` | Какие категории раскрыты в начале |
| `onOpenCategoriesChange` | `(categories) => void` | — | Список раскрытых категорий изменился |

Управляемый режим включается, когда свойство не `undefined`. Поэтому в управляемом режиме нельзя передать `selectedValue={undefined}`, чтобы «снять выбор». Передайте значение, которого нет ни у одного пункта.

## Свойства `NavItem` и `NavSubItem`

`NavSubItem` отличается только видом: без иконки и с отступом, чтобы текст стоял под текстом категории.

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string \| number` | — | Идентификатор пункта. Пункт со `value`, равным `selectedValue`, считается выбранным. Без `value` пункт не может быть выбран, он просто вызывает `onClick` |
| `icon` | `ReactNode` | — | Иконка 18×18 слева (у `NavSubItem` не рисуется) |
| `href` | `string` | — | Если задан и `as` не указан, пункт рисуется как `<a>` |
| `as` | `ElementType` | `"button"` (или `"a"` при `href`) | Любой элемент или компонент, например `Link` из роутера |
| `disabled` | `boolean` | — | Отключает пункт |
| `selectsOnInvoked` | `boolean` | `true` | Если `false`, нажатие вызывает `onNavItemSelect`, но выбор не меняется |
| `onClick` | `(event) => void` | — | Вызывается до выбора. `event.preventDefault()` отменяет выбор |
| `className` | `string` | — | Класс на корневой элемент пункта |
| остальные | атрибуты выбранного тега | | Передаются на элемент как есть (`to` для `Link`, `target`, `data-*`…) |

Выбранный пункт получает `aria-current="page"`.

## Свойства `NavCategory`

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string \| number` | — | Идентификатор категории для списка `openCategories`. Выбранным она не становится |
| `title` | `ReactNode` | — | Заголовок |
| `icon` | `ReactNode` | — | Иконка слева |
| `disabled` | `boolean` | — | Отключает категорию |
| `className` | `string` | — | Класс на корневой элемент |
| `children` | `ReactNode` | — | Обычно `NavSubItem` |

Когда в категории выбран один из пунктов, а группа свёрнута, сама категория подсвечивается как выбранная.

## Примеры

### 1. Категории, секции и разделитель

```tsx
<NavigationView
  paneTitle="Админка"
  defaultSelectedValue="users"
  defaultOpenCategories={["people"]}
  menuItems={
    <>
      <NavItem value="home" icon={<HomeIcon />}>Главная</NavItem>

      <NavSectionHeader>Данные</NavSectionHeader>
      <NavCategory value="people" title="Люди" icon={<UsersIcon />}>
        <NavSubItem value="users">Пользователи</NavSubItem>
        <NavSubItem value="roles">Роли</NavSubItem>
      </NavCategory>

      <NavDivider />
      <NavItem value="reports" icon={<ChartIcon />} disabled>Отчёты</NavItem>
    </>
  }
>
  <CurrentPage />
</NavigationView>
```

Если выбрать пункт категории программно (`selectedValue="users"`), категория сама **не раскроется**. Начальное раскрытие задаётся через `defaultOpenCategories` или `openCategories`.

### 2. Управляемый режим

```tsx
const [page, setPage] = useState("home");
const [paneOpen, setPaneOpen] = useState(true);

<NavigationView
  selectedValue={page}
  onSelectionChanged={(_, { value }) => setPage(String(value))}
  isPaneOpen={paneOpen}
  onPaneOpenChange={setPaneOpen}
  menuItems={/* … */}
>
  {pages[page]}
</NavigationView>
```

### 3. Роутер

Задайте `as` и передайте нужные атрибуты. В `value` удобно класть путь.

```tsx
import { Link, Routes, Route, useLocation } from "react-router-dom";

function Shell() {
  const { pathname } = useLocation();

  return (
    <NavigationView
      selectedValue={pathname}
      menuItems={
        <>
          <NavItem as={Link} to="/" value="/" icon={<HomeIcon />}>Главная</NavItem>
          <NavItem as={Link} to="/users" value="/users" icon={<UsersIcon />}>Пользователи</NavItem>
        </>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </NavigationView>
  );
}
```

Пункт с `href` без `as` — обычная ссылка `<a>` и перезагрузит страницу. Для переходов внутри приложения всегда используйте `as={Link}` или отменяйте переход в `onClick`.

Анимация перехода и роутер: старая страница при выходе рисуется из **сохранённого React-элемента**, а не из DOM. Если этот элемент берёт данные из контекста маршрута (как `<Routes>` или `<Outlet />`), при выходе он уже покажет новую страницу. Если такой эффект мешает, отключите анимацию страниц (см. пример 7).

### 4. Режимы панели

```tsx
// всегда раскрыта, без кнопки
<NavigationView paneDisplayMode="left" … />

// стартует свёрнутой, пользователь раскрывает сам
<NavigationView paneDisplayMode="leftCompact" … />

// адаптивная панель с другим порогом
<NavigationView paneDisplayMode="auto" expandedModeThresholdWidth={1100} … />

// адаптивность выключена, но панель можно раскрывать кнопкой
<NavigationView paneDisplayMode="auto" expandedModeThresholdWidth={0} … />
```

В режиме `auto` ширина измеряется у самого `NavigationView`, а не у окна. Панель реагирует только на **пересечение порога**: пока ширина остаётся с одной стороны, ручное раскрытие и сворачивание кнопкой сохраняются (при условии, что `onPaneOpenChange` имеет постоянную ссылку, см. [Ограничения](#ограничения)). При следующем пересечении панель снова подчинится ширине.

### 5. Слоты панели

```tsx
<NavigationView
  paneTitle="Почта"
  paneHeader={<UserCard />}
  paneCustomContent={<SearchField placeholder="Поиск" />}
  paneFooter={({ isPaneOpen }) =>
    isPaneOpen ? <small>v1.4.2</small> : <small>1.4</small>
  }
  menuItems={/* … */}
>
  …
</NavigationView>
```

`paneHeader` и `paneCustomContent` в свёрнутой панели не рисуются. В `paneCustomContent` можно ставить поля ввода: стрелки внутри `input`, `textarea`, `select` и `contenteditable` не перехватываются.

### 6. Пункт-действие

Пункт без `value` или с `selectsOnInvoked={false}` не меняет страницу, а просто выполняет действие:

```tsx
<NavItem icon={<LogoutIcon />} onClick={logout}>Выйти</NavItem>

<NavItem
  value="help"
  icon={<HelpIcon />}
  selectsOnInvoked={false}
  onClick={() => openHelpDialog()}
>
  Справка
</NavItem>
```

Чтобы отменить выбор по условию, вызовите `event.preventDefault()` в `onClick`.

### 7. Свой `pageKey` или без анимации

По умолчанию `pageKey` равен выбранному значению. Его можно задать отдельно, например, чтобы страница считалась новой при смене параметра:

```tsx
<NavigationView selectedValue={tab} pageKey={`${tab}:${userId}`} … />
```

Если `pageKey` не меняется, анимации нет. Чтобы отключить анимацию страниц совсем, передайте константу:

```tsx
<NavigationView pageKey="app" … />
```

При постоянном ключе прокрутка области страницы тоже не сбрасывается.

### 8. Размеры и скругление

Размеры задаются переменными на корне:

```tsx
<NavigationView
  style={{
    "--nav-open-width": "280px",
    "--nav-compact-width": "52px",
    "--nav-item-height": "36px",
    borderRadius: 12,
  } as React.CSSProperties}
  …
/>
```

Скругление корня наследует и боковая панель.

## CSS-переменные

Задаются на корневом элементе (`className` или `style`) и наследуются всплывающим меню.

| Переменная | По умолчанию | Описание |
| --- | --- | --- |
| `--nav-open-width` | `248px` | Ширина раскрытой панели |
| `--nav-compact-width` | `60px` | Ширина свёрнутой панели |
| `--nav-item-height` | `32px` | Высота пункта |
| `--nav-icon-size` | `18px` | Размер иконки |
| `--nav-gap` | `0px` | Отступ вокруг и между панелью и страницей |
| `--nav-page-shift` | `64px` | На сколько сдвигается страница при выходе и входе |
| `--nav-anim-duration` | `var(--ControlAnimationDuration)` | Длительность анимации панели и групп |
| `--nav-anim-easing` | `var(--ControlAnimationEasing)` | Кривая анимации панели и групп |

Переменную `--nav-pane-current` задаёт сам компонент, менять её не нужно.

## Поведение

### Выбор

- Нажатие на пункт со `value` вызывает `onNavItemSelect`. Если пункт не был выбран и `selectsOnInvoked` не `false`, выбор меняется и вызывается `onSelectionChanged`.
- В неуправляемом режиме компонент меняет выбор сам. В управляемом только сообщает о нём через колбэки.
- Отключённые пункты не реагируют на нажатия. У ссылок при `disabled` убирается `href`.

### Категории

- **Раскрытая панель.** Нажатие переключает группу, шеврон поворачивается, высота группы и прозрачность анимируются. Закрытые группы недоступны для Tab и скринридеров (`visibility: hidden` после окончания анимации).
- **Свёрнутая панель.** Нажатие открывает всплывающее меню справа от пункта: позиция считается от кнопки категории, по высоте меню не выходит за корень. Фокус переходит на первый пункт меню.
- Всплывающее меню закрывается: выбором пункта в нём, нажатием вне меню, клавишей Escape (фокус вернётся на категорию), изменением размера окна и раскрытием панели. Повторное нажатие на категорию тоже закрывает меню.
- Всплывающее меню рисуется порталом внутрь корня `NavigationView`, поэтому им обрезается и не выходит за его пределы.

### Смена страницы

1. `pageKey` изменился: старая страница получает класс ухода (200 мс, прозрачность до 0 и сдвиг вниз на `--nav-page-shift`), клики по ней блокируются.
2. По окончании анимации показывается новая страница (360 мс, выезд снизу с нарастанием прозрачности), прокрутка области возвращается в начало.
3. На время анимации область страницы получает `overflow: hidden`, чтобы не мелькали полосы прокрутки.

Пока `pageKey` не менялся, `children` обновляются сразу, без анимации.

### Подсказки

В свёрнутой панели у пунктов верхнего уровня и категорий с текстовым заголовком появляется нативная подсказка (`title`) с этим заголовком. Если заголовок не строка, подсказки нет, добавьте `title` или `aria-label` сами.

## Клавиатура

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift`+`Tab` | Переход по пунктам обычным образом |
| `↓` / `↑` | Следующий и предыдущий пункт панели с переходом по кругу |
| `Home` / `End` | Первый и последний пункт панели |
| `Enter` / `Space` | Выбрать пункт, переключить категорию или открыть всплывающее меню |
| `Esc` | Закрыть всплывающее меню, фокус возвращается на категорию |

Стрелки пропускают отключённые пункты и пункты внутри свёрнутых групп. Во всплывающем меню те же клавиши работают по его пунктам. Внутри полей ввода стрелки не перехватываются.

## Доступность

- Панель — элемент `<nav>` с `aria-label` (по умолчанию «Основная навигация»), страница — `<main>`.
- Кнопка панели имеет `aria-label`, `title`, `aria-expanded` и `aria-controls`.
- Выбранный пункт имеет `aria-current="page"`.
- Категория имеет `aria-expanded`. В свёрнутой панели добавляется `aria-haspopup="true"`, а в раскрытой `aria-controls` ссылается на группу (`role="group"`).
- Всплывающее меню — `role="group"` с `aria-label` из заголовка категории, если он строка.
- Для `prefers-reduced-motion: reduce` отключаются все переходы панели, групп и всплывающего меню, а анимации страниц укорачиваются до 0.01 мс.
- Фокус пункта виден как внутренняя обводка 2px.

## Внешний вид

| Элемент | Значение |
| --- | --- |
| Размер шрифта | `13px` |
| Раскрытая / свёрнутая панель | `248px` / `60px`, ширина анимируется |
| Пункт | высота `32px`, отступы `0 11px`, зазор `8px`, скругление `--CircularCornerRadius` |
| Пункт при наведении и нажатии | `--ControlFillColorSecondaryBrush` и `--ControlFillColorTertiaryBrush` |
| Выбранный пункт | фон `--ControlFillColorDefaultBrush`, при наведении `--ControlFillColorTertiaryBrush` |
| Отключённый пункт | прозрачность `0.4`, события мыши отключены |
| Иконка | `18px`, цвет `--AccentTextFillColorPrimaryBrush` |
| Шеврон категории | цвет `--TextFillColorSecondaryBrush`, при раскрытии поворот на 90° |
| Заголовок секции | `12px`, вес 600, `--TextFillColorSecondaryBrush`; в свёрнутой панели схлопывается по высоте |
| Разделитель | `1px`, отступ `6px`, цвет `--DividerStrokeColorDefaultBrush` |
| Всплывающее меню | `GlassPanel` со скруглением `36px`, фон 95% от `--ControlOnImageFillColorDefaultBrush`, отступ `10px`, минимальная ширина `200px`, `z-index: var(--ZIndexPopup)` |

Панель прокручивается без видимой полосы. Область страницы прокручивается обычной полосой.

## Ограничения

- Режима «панель поверх страницы» (как minimal/hidden в WinUI) нет. В узком окне панель остаётся полосой шириной `--nav-compact-width`.
- Выбор пункта категории не раскрывает её автоматически (см. пример 1).
- Подсветка категории по выбранному пункту ищет `value` только среди **прямых** потомков `NavCategory`. Если пункты обёрнуты в свой компонент или фрагмент с условиями, подсветки не будет.
- Категории рассчитаны на один уровень. Вложенные `NavCategory` не поддерживаются.
- Пока открыто всплывающее меню, содержимое категории существует в двух экземплярах: скрытая группа в панели и меню. Не кладите в категорию элементы с собственным состоянием, `autoFocus` или фиксированными `id`.
- Всплывающее меню позиционируется один раз при открытии и не следует за прокруткой панели. Нажатие вне меню закрывает его, прокрутка колесом нет.
- **В режиме `auto` `onPaneOpenChange` должен иметь постоянную ссылку.** Эффект, который подгоняет панель под ширину, зависит от этого колбэка. Если передать `onPaneOpenChange={(o) => setOpen(o)}`, то после каждого рендера родителя панель снова принудительно приводится к состоянию «по ширине». В управляемом режиме кнопка раскрытия при этом перестаёт работать (проверено в браузере: на ширине больше порога панель сразу раскрывается обратно), а в неуправляемом ручное сворачивание сбрасывается при любом рендере родителя. Передавайте сам `setState` (`onPaneOpenChange={setOpen}`), функцию из `useCallback` или не передавайте колбэк вовсе.
- В управляемом режиме `isPaneOpen`, если при монтировании ширина меньше порога, колбэк `onPaneOpenChange` не вызывается: панель останется в том состоянии, которое вы передали. Задайте начальное значение сами. Последующие пересечения порога колбэк вызывают.
- Страница при смене `pageKey` **пересоздаётся**, состояние внутри неё не сохраняется.
- Элемент `<main>` внутри компонента должен быть в приложении единственным.
- Отдельного свойства для отключения анимации страниц нет, используйте постоянный `pageKey` (пример 7).
- Тексты `paneAriaLabel` и `toggleButtonLabel` настраиваются, других вшитых текстов у компонента нет.

## Токены

| Что | Токены |
| --- | --- |
| Фон страницы и текст | `LayerFillColorDefaultBrush`, `TextFillColorPrimaryBrush` |
| Фон панели | `SolidBackgroundFillColorBaseBrush` |
| Состояния пункта | `ControlFillColorSecondaryBrush`, `ControlFillColorTertiaryBrush`, `ControlFillColorDefaultBrush` |
| Фокус | `AccentFillColorSelectedTextBackgroundBrush` |
| Иконки и шевроны | `AccentTextFillColorPrimaryBrush`, `TextFillColorSecondaryBrush` |
| Разделитель | `DividerStrokeColorDefaultBrush` |
| Всплывающее меню | `ControlOnImageFillColorDefaultBrush`, `ZIndexPopup` |
| Скругление | `CircularCornerRadius` |
| Анимации | `ControlAnimationDuration`, `ControlAnimationEasing` |

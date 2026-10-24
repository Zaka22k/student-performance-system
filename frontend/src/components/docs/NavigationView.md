# NavigationView

Каркас приложения: слева боковая панель навигации, справа область страницы. Режимы панели и пороги ширины заимствованы у WinUI: на широком экране панель раскрыта рядом со страницей, на среднем свёрнута в полосу с иконками и раскрывается поверх страницы, на узком остаётся одна кнопка, а раскрытая панель занимает всю ширину. Содержимое страницы — компонент [`Page`](./Page.md). Смена страницы анимируется по правилам статей [Page transitions](https://learn.microsoft.com/en-us/windows/apps/develop/motion/page-transitions) и [Motion in Windows](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion): соседние страницы выезжают снизу, переход вглубь и возврат идут с масштабом. Переход настраивается для всего `NavigationView` и для каждой страницы отдельно. Поведение близко к [WinUI NavigationView](https://learn.microsoft.com/windows/apps/design/controls/navigationview) и [Apple HIG: Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars).

Компонент состоит из шести частей:

| Компонент          | Назначение                                                                     |
| ------------------ | ------------------------------------------------------------------------------ |
| `NavigationView`   | Корень: панель, область страницы, состояние выбора и раскрытия                 |
| `NavItem`          | Пункт панели                                                                   |
| `NavCategory`      | Раскрывающаяся группа пунктов. В свёрнутой панели открывается всплывающим меню |
| `NavSubItem`       | Пункт внутри `NavCategory` (без иконки, с отступом)                            |
| `NavSectionHeader` | Подпись секции. В свёрнутой панели скрывается                                  |
| `NavDivider`       | Горизонтальный разделитель                                                     |

`NavItem`, `NavSubItem` и `NavCategory` работают только внутри `NavigationView`. Вне его бросят ошибку: «NavItem / NavCategory / NavSubItem нужно использовать внутри `<NavigationView>`».

## Подключение

Файлы лежат рядом с `index.css`:

```
NavigationView.tsx
NavigationView.module.css
pageTransitions.ts   // переходы между страницами; его же использует Page
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

Всё для переходов экспортируется оттуда же:

```tsx
import {
  matchNavValue,
  autoTransition,
  entranceTransition,
  drillInTransition,
  slideTransition,
  suppressTransition,
  pageMotion,
} from "./NavigationView";
import type {
  PageAnimation,
  PageKey,
  PageTransitionFn,
  PageTransitionInfo,
  PageTransitionName,
  PageTransitionSetting,
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
        <NavItem value="home" icon={<HomeIcon />}>
          Главная
        </NavItem>
        <NavItem value="users" icon={<UsersIcon />}>
          Пользователи
        </NavItem>
      </>
    }
    footerMenuItems={
      <NavItem value="settings" icon={<SettingsIcon />}>
        Настройки
      </NavItem>
    }
  >
    {/* Здесь рисуется текущая страница */}
    <CurrentPage />
  </NavigationView>
</div>
```

Страница не выбирается компонентом сама: `children` рисуются как есть. Выбранное значение нужно сопоставить со страницей в вашем коде (`switch`, объект с компонентами, роутер). Содержимое оборачивайте в [`Page`](./Page.md): он даёт шапку и умеет задавать свой переход (`transition`). `NavigationView` показывает и анимирует любое содержимое, но свойства `transition` у него нет.

## Свойства `NavigationView`

Остальные атрибуты `<div>` (кроме `onSelect`) попадают на корневой элемент. `className` и `style` тоже на корень.

### Содержимое

| Свойство            | Тип                                                                         | По умолчанию       | Описание                                                                                                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`          | `ReactNode`                                                                 | —                  | Текущая страница                                                                                                                                                                                                                  |
| `menuItems`         | `ReactNode`                                                                 | —                  | Основные пункты. Область прокручивается, если пунктов много                                                                                                                                                                       |
| `footerMenuItems`   | `ReactNode`                                                                 | —                  | Пункты в нижней части панели, под основными, прокручиваться не будут                                                                                                                                                              |
| `paneTitle`         | `ReactNode`                                                                 | —                  | Заголовок в верхней строке панели. В свёрнутой панели скрыт                                                                                                                                                                       |
| `paneHeader`        | `ReactNode \| ({ isPaneOpen }) => ReactNode`                                | —                  | Слот под верхней строкой (например, профиль). **Только в раскрытой панели**                                                                                                                                                       |
| `paneCustomContent` | `ReactNode \| ({ isPaneOpen }) => ReactNode`                                | —                  | Слот под `paneHeader` (например, поле поиска). **Только в раскрытой панели**                                                                                                                                                      |
| `paneFooter`        | `ReactNode \| ({ isPaneOpen }) => ReactNode`                                | —                  | Слот в самом низу панели. Рисуется всегда, поэтому в функции стоит проверять `isPaneOpen`                                                                                                                                         |
| `pageKey`           | `string \| number`                                                          | выбранное значение | Ключ страницы. При смене страница создаётся заново и играет переход. С роутером передавайте `location.pathname`: страницы вне меню не меняют выбранный пункт, а по пути определяется, как страницы связаны (вглубь, назад, рядом) |
| `pageTransition`    | `"auto" \| "entrance" \| "drillIn" \| "slide" \| "suppress" \| (info) => …` | `"auto"`           | Переход при смене страницы, см. [Переходы между страницами](#переходы-между-страницами). Страница может переопределить его своим `transition`                                                                                     |

Порядок сверху вниз: верхняя строка, `paneHeader`, `paneCustomContent`, `menuItems`, `footerMenuItems`, `paneFooter`.

### Режим панели

| Свойство                     | Тип                                                  | По умолчанию                           | Описание                                                                                                                                                                                                   |
| ---------------------------- | ---------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paneDisplayMode`            | `"auto" \| "left" \| "leftCompact" \| "leftMinimal"` | `"auto"`                               | См. таблицы ниже. Тип значений экспортируется как `PaneDisplayMode`                                                                                                                                        |
| `expandedModeThresholdWidth` | `number`                                             | `1008`                                 | Только `auto`. Ширина корня (px), от которой панель раскрыта (`left`). `0`: панель всегда `left` (с кнопкой), адаптивности нет                                                                             |
| `compactModeThresholdWidth`  | `number`                                             | `640`                                  | Только `auto`. Ширина корня (px), при которой и меньше остаётся только кнопка панели (`leftMinimal`). Между порогами `leftCompact`. `0` отключает `leftMinimal`                                            |
| `overlayFullWidthThreshold`  | `number`                                             | `640`                                  | Для `leftCompact` и `leftMinimal`. Если ширина корня не больше значения (px), панель, раскрытая поверх страницы, занимает всю ширину корня. `0` отключает: панель всегда шириной `--nav-open-width`        |
| `isPaneOpen`                 | `boolean`                                            | —                                      | Раскрыта ли панель (управляемый режим)                                                                                                                                                                     |
| `onPaneOpenChange`           | `(isOpen: boolean) => void`                          | —                                      | Вызывается при нажатии на кнопку панели, при смене режима `auto` по ширине, при смене `paneDisplayMode` и при закрытии панели, раскрытой поверх страницы (пункт, `Esc`, клик по затемнению)                |
| `isPaneToggleButtonVisible`  | `boolean`                                            | `true`                                 | Показывать кнопку раскрытия. В режиме `left` кнопки нет в любом случае. В `leftMinimal` кнопка — единственное, что видно у закрытой панели: если её скрыть, открыть панель можно только через `isPaneOpen` |
| `paneAriaLabel`              | `string`                                             | `"Основная навигация"`                 | `aria-label` элемента `<nav>`                                                                                                                                                                              |
| `toggleButtonLabel`          | `string`                                             | `"Показать или скрыть боковую панель"` | `aria-label` и подсказка кнопки раскрытия                                                                                                                                                                  |

| Режим         | Закрытая панель                                                            | Раскрытая панель                | Кнопка | Начало    |
| ------------- | -------------------------------------------------------------------------- | ------------------------------- | ------ | --------- |
| `left`        | полоса с иконками (только после нажатия на кнопку, у явного `left` её нет) | рядом со страницей, сдвигает её | нет    | раскрыта  |
| `leftCompact` | полоса с иконками рядом со страницей                                       | поверх страницы                 | есть   | свёрнута  |
| `leftMinimal` | только кнопка панели                                                       | поверх страницы                 | есть   | свёрнута  |
| `auto`        | зависит от ширины корня, см. ниже                                          | зависит от ширины корня         | есть   | по ширине |

В режиме `auto` ширина измеряется у самого `NavigationView`, а не у окна:

| Ширина корня                                      | Режим         | Панель                                                        |
| ------------------------------------------------- | ------------- | ------------------------------------------------------------- |
| от `expandedModeThresholdWidth` (1008)            | `left`        | раскрыта; кнопка сворачивает её в полосу, страница сдвигается |
| от 641 до 1007                                    | `leftCompact` | свёрнута в полосу, раскрывается поверх страницы               |
| до `compactModeThresholdWidth` (640) включительно | `leftMinimal` | только кнопка, раскрывается поверх страницы на всю ширину     |

Подробности в разделе [Режимы панели](#режимы-панели).

### Выбор и раскрытие категорий

| Свойство                 | Тип                          | По умолчанию | Описание                                                                                                          |
| ------------------------ | ---------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `selectedValue`          | `string \| number \| null`   | —            | Выбранное значение (управляемый режим). `null`: ничего не выбрано                                                 |
| `defaultSelectedValue`   | `string \| number \| null`   | —            | Начальное значение (неуправляемый режим)                                                                          |
| `onNavItemSelect`        | `(event, { value }) => void` | —            | Нажатие на пункт со `value`. Вызывается **при каждом нажатии**, в том числе на уже выбранный пункт                |
| `onSelectionChanged`     | `(event, { value }) => void` | —            | Выбранное значение изменилось. Не вызывается для уже выбранного пункта и для пунктов с `selectsOnInvoked={false}` |
| `openCategories`         | `Array<string \| number>`    | —            | Значения раскрытых категорий (управляемый режим)                                                                  |
| `defaultOpenCategories`  | `Array<string \| number>`    | `[]`         | Какие категории раскрыты в начале                                                                                 |
| `onOpenCategoriesChange` | `(categories) => void`       | —            | Список раскрытых категорий изменился                                                                              |

Управляемый режим включается, когда свойство не `undefined`. Чтобы «снять выбор» (например, на странице вне меню), передайте `null`: режим остаётся управляемым, выбранного пункта нет.

## Свойства `NavItem` и `NavSubItem`

`NavSubItem` отличается только видом: без иконки и с отступом, чтобы текст стоял под текстом категории.

| Свойство           | Тип                      | По умолчанию                      | Описание                                                                                                                                                  |
| ------------------ | ------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | `string \| number`       | —                                 | Идентификатор пункта. Пункт со `value`, равным `selectedValue`, считается выбранным. Без `value` пункт не может быть выбран, он просто вызывает `onClick` |
| `icon`             | `ReactNode`              | —                                 | Иконка 18×18 слева (у `NavSubItem` не рисуется)                                                                                                           |
| `href`             | `string`                 | —                                 | Если задан и `as` не указан, пункт рисуется как `<a>`                                                                                                     |
| `as`               | `ElementType`            | `"button"` (или `"a"` при `href`) | Любой элемент или компонент, например `Link` из роутера                                                                                                   |
| `disabled`         | `boolean`                | —                                 | Отключает пункт                                                                                                                                           |
| `selectsOnInvoked` | `boolean`                | `true`                            | Если `false`, нажатие вызывает `onNavItemSelect`, но выбор не меняется                                                                                    |
| `onClick`          | `(event) => void`        | —                                 | Вызывается до выбора. `event.preventDefault()` отменяет выбор                                                                                             |
| `className`        | `string`                 | —                                 | Класс на корневой элемент пункта                                                                                                                          |
| остальные          | атрибуты выбранного тега |                                   | Передаются на элемент как есть (`to` для `Link`, `target`, `data-*`…)                                                                                     |

Выбранный пункт получает `aria-current="page"`.

## Свойства `NavCategory`

| Свойство    | Тип                | По умолчанию | Описание                                                                         |
| ----------- | ------------------ | ------------ | -------------------------------------------------------------------------------- |
| `value`     | `string \| number` | —            | Идентификатор категории для списка `openCategories`. Выбранным она не становится |
| `title`     | `ReactNode`        | —            | Заголовок                                                                        |
| `icon`      | `ReactNode`        | —            | Иконка слева                                                                     |
| `disabled`  | `boolean`          | —            | Отключает категорию                                                              |
| `className` | `string`           | —            | Класс на корневой элемент                                                        |
| `children`  | `ReactNode`        | —            | Обычно `NavSubItem`                                                              |

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
      <NavItem value="home" icon={<HomeIcon />}>
        Главная
      </NavItem>

      <NavSectionHeader>Данные</NavSectionHeader>
      <NavCategory value="people" title="Люди" icon={<UsersIcon />}>
        <NavSubItem value="users">Пользователи</NavSubItem>
        <NavSubItem value="roles">Роли</NavSubItem>
      </NavCategory>

      <NavDivider />
      <NavItem value="reports" icon={<ChartIcon />} disabled>
        Отчёты
      </NavItem>
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
</NavigationView>;
```

### 3. Роутер

Задайте `as` и передайте нужные атрибуты. В `value` удобно класть путь. В `pageKey` передайте `pathname`, а выбранный пункт вычисляйте через `matchNavValue`: страницы вне меню (например, `/users/new`) не сбивают выделение раздела, но переход между страницами всё равно играет.

```tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { matchNavValue } from "./NavigationView";

const MENU = ["/", "/users"] as const;

function Shell() {
  const { pathname } = useLocation();

  return (
    <NavigationView
      pageKey={pathname}
      selectedValue={matchNavValue(pathname, MENU)}
      menuItems={
        <>
          <NavItem as={Link} to="/" value="/" icon={<HomeIcon />}>
            Главная
          </NavItem>
          <NavItem as={Link} to="/users" value="/users" icon={<UsersIcon />}>
            Пользователи
          </NavItem>
        </>
      }
    >
      <Outlet />
    </NavigationView>
  );
}

// <Route element={<Shell />}>
//   <Route index element={<HomePage />} />
//   <Route path="users" element={<UsersPage />} />
//   <Route path="users/new" element={<NewUserPage />} />   // вне меню
// </Route>
```

`matchNavValue(pathname, values)` выбирает из `values` подходящий пункт: значение равно пути или является его началом по сегментам, из нескольких побеждает самое длинное. Корень `"/"` подходит только самому себе. Если ничего не подошло, вернётся `null`, и это допустимое значение для `selectedValue`.

Пункт с `href` без `as` — обычная ссылка `<a>` и перезагрузит страницу. Для переходов внутри приложения всегда используйте `as={Link}` или отменяйте переход в `onClick`.

Содержимое всегда берётся из актуального маршрута: прежняя страница убирается сразу, а анимируется только новая. Сохранённых копий страниц нет, поэтому `<Outlet />` и `<Routes>` внутри `NavigationView` работают как обычно. Полный пример для маршрутов со страницами вне меню: пример 12.

### 4. Режимы панели

```tsx
// рядом со страницей, всегда раскрыта, без кнопки
<NavigationView paneDisplayMode="left" … />

// полоса с иконками, раскрытая лежит поверх страницы
<NavigationView paneDisplayMode="leftCompact" … />

// только кнопка панели, раскрытая лежит поверх страницы
<NavigationView paneDisplayMode="leftMinimal" … />

// по ширине корня (по умолчанию): от 1008 left, 641–1007 leftCompact, до 640 leftMinimal
<NavigationView paneDisplayMode="auto" … />

// раскрыта на ширине от 1007, иначе только кнопка (пример из статьи WinUI)
<NavigationView compactModeThresholdWidth={1007} expandedModeThresholdWidth={1007} … />

// без leftMinimal: раскрыта на широком, иначе полоса с иконками
<NavigationView compactModeThresholdWidth={0} … />

// адаптивности нет: всегда left, но панель сворачивается кнопкой
<NavigationView expandedModeThresholdWidth={0} … />

// на всю ширину раскрытая поверх страницы панель идёт только на корне до 480px
// (`0` отключает: панель всегда 248px)
<NavigationView overlayFullWidthThreshold={480} … />
```

В режиме `auto` панель реагирует только на **смену режима**: при переходе в `left` она раскрывается, при переходе в `leftCompact` или `leftMinimal` сворачивается. Пока режим тот же (например, ширина меняется в пределах от 1008 и шире), ручное раскрытие и сворачивание кнопкой сохраняются.

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

По умолчанию `pageKey` равен выбранному значению. С роутером передавайте `location.pathname` (пример 3). Ключ можно составить и самому, чтобы страница считалась новой при смене параметра:

```tsx
<NavigationView selectedValue={tab} pageKey={`${tab}:${userId}`} … />
```

Если `pageKey` не меняется, страница не пересоздаётся и перехода нет. Это относится и к смене `?query` или `#hash` при том же `pathname`.

Чтобы убрать анимацию, но оставить пересоздание страницы при смене ключа, задайте `pageTransition="suppress"`. Постоянный ключ отключает и пересоздание: страница обновляется на месте, прокрутка не сбрасывается.

```tsx
<NavigationView pageTransition="suppress" … />   // страница появляется сразу
<NavigationView pageKey="app" … />               // страница не пересоздаётся
```

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

### 9. Свой критерий вместо ширины корня и управляемое состояние

`auto` смотрит на ширину самого `NavigationView`. Если режим должен зависеть от чего-то другого (ширина окна, тип устройства), задайте его сами:

```tsx
import { useSyncExternalStore } from "react";

const PHONE = "(max-width: 600px)";

function useIsPhone() {
  return useSyncExternalStore(
    (notify) => {
      const query = matchMedia(PHONE);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => matchMedia(PHONE).matches,
    () => false,
  );
}

function Shell() {
  const isPhone = useIsPhone();

  return (
    <NavigationView paneDisplayMode={isPhone ? "leftMinimal" : "left"} … />
  );
}
```

При смене режима панель приводится к его начальному состоянию: `leftCompact` и `leftMinimal` сворачиваются, `left` раскрывается, `auto` подстраивается под ширину. В управляемом режиме (`isPaneOpen`) об этом сообщает `onPaneOpenChange`, а состояние ведёт родитель:

```tsx
const [paneOpen, setPaneOpen] = useState(false);

<NavigationView
  paneDisplayMode="leftMinimal"
  isPaneOpen={paneOpen}
  onPaneOpenChange={(isOpen) => setPaneOpen(isOpen)}
  …
/>
```

Панель, раскрытая поверх страницы, закрывается сама (пункт, `Esc`, затемнение) через `onPaneOpenChange(false)`, поэтому колбэк обязательно должен обновлять состояние. Колбэк может быть и новой функцией на каждый рендер: панель реагирует на смену режима, а не на смену колбэка.

### 10. Встроенные переходы

```tsx
// по умолчанию "auto": соседние страницы — entrance, вглубь и назад — drillIn
<NavigationView … />

// один переход для всех страниц
<NavigationView pageTransition="slide" … />

// настройка встроенного перехода
<NavigationView pageTransition={entranceTransition({ distance: 32 })} … />
<NavigationView pageTransition={drillInTransition({ duration: 250, scale: 0.9 })} … />
<NavigationView pageTransition={slideTransition({ effect: "fromLeft" })} … />
```

Параметры:

| Фабрика              | Параметры (все необязательные)                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `entranceTransition` | `duration` (мс, 333), `distance` (число в px или CSS-значение, по умолчанию `--nav-page-shift`)                            |
| `drillInTransition`  | `duration` (мс, 333), `scale` (начальный масштаб при переходе вглубь, по умолчанию `--nav-page-drill-scale`)               |
| `slideTransition`    | `effect` (`"auto"`, `"fromLeft"`, `"fromRight"`), `duration` (мс, 333), `distance` (по умолчанию `--nav-page-slide-shift`) |

Страница задаёт свой переход свойством `transition` у `Page`, оно важнее настройки `NavigationView`:

```tsx
<Page title="Запись" transition="slide" … />
```

### 11. Свой переход

Вместо имени можно передать функцию. Она получает `PageTransitionInfo` и возвращает имя встроенного перехода, одну дорожку анимации, массив дорожек или `null` (без анимации).

```tsx
// по связи страниц
pageTransition={(info) => (info.relation === "peer" ? "entrance" : "slide")}

// по адресу
pageTransition={(info) =>
  String(info.to).startsWith("/reports") ? "suppress" : "auto"
}

// своя анимация: аргументы Element.animate()
pageTransition={() => [
  {
    keyframes: [
      { opacity: 0, transform: "scale(0.98)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    options: { duration: 200, easing: "ease-out" },
  },
]}
```

Что получает функция:

| Поле        | Значение                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `from`      | ключ страницы, которая уходит                                                                   |
| `to`        | ключ страницы, которая появляется                                                               |
| `relation`  | `"peer"`, `"child"` или `"parent"`, см. [Переходы между страницами](#переходы-между-страницами) |
| `direction` | `"back"` при переходе на страницу выше по пути, иначе `"forward"`                               |

Подробности:

- Дорожка — это `{ keyframes, options }` для `Element.animate()`. По умолчанию `fill: "backwards"`: до старта страница уже в начальном состоянии. По окончании эффект снимается.
- В значениях keyframes можно писать `var(--имя)`, значения подставляются в момент старта.
- Функция вызывается один раз на переход.
- Время и кривые встроенных переходов доступны как `pageMotion` (`duration.fade`, `fast`, `normal`, `slow` и `easing.directEntrance`, `pointToPoint`, `linear`), чтобы свои анимации совпадали с остальными.
- Анимируйте только `transform` и `opacity`: это не вызывает перерасчёта раскладки.

### 12. Страницы вне меню (маршруты приложения)

Страницы вроде `/performance/new` или `/performance/:id/edit` не входят в меню, но переход должен играть и раздел в меню должен остаться выбранным. Для этого `pageKey` берётся из пути, а выбранный пункт из `matchNavValue`:

```tsx
// AppLayout.tsx: меню составьте под свои пункты
import { Link, Outlet, useLocation } from "react-router-dom";
import { NavigationView, NavItem, matchNavValue } from "./NavigationView";

const MENU = [
  "/performance",
  "/groups",
  "/students",
  "/teachers",
  "/subjects",
  "/semesters",
  "/session/schedule",
  "/session/sheet",
  "/analytics/rating",
  "/analytics/groups",
  "/analytics/subjects",
  "/reports/group-sheet",
  "/reports/student-book",
  "/reports/group-summary",
] as const;

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <NavigationView
      pageKey={pathname}
      selectedValue={matchNavValue(pathname, MENU)}
      menuItems={
        <>
          <NavItem as={Link} to="/performance" value="/performance">
            Успеваемость
          </NavItem>
          <NavItem as={Link} to="/groups" value="/groups">
            Группы
          </NavItem>
          {/* … остальные пункты и категории */}
        </>
      }
    >
      <Outlet />
    </NavigationView>
  );
}
```

Что произойдёт для маршрутов `performance`, `performance/new` и `performance/:id/edit`:

| Переход                                               | Связь  | Анимация по умолчанию                                             |
| ----------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| Группы → Студенты (пункты меню)                       | рядом  | `entrance`                                                        |
| Успеваемость → Новая запись                           | вглубь | `drillIn`, масштаб растёт                                         |
| Новая запись → Успеваемость (кнопка «Назад» у `Page`) | назад  | `drillIn` в обратную сторону                                      |
| Запись 5 → Запись 6                                   | рядом  | `entrance`, страница создаётся заново                             |
| Любая страница вне меню                               | —      | пункт «Успеваемость» остаётся выбранным, на `*` ничего не выбрано |

Страница вне меню может иметь собственный переход:

```tsx
<Page title="Новая запись" showBackButton transition="slide" onNavigate={load}>
  …
</Page>
```

## CSS-переменные

Задаются на корневом элементе (`className` или `style`) и наследуются всплывающим меню.

| Переменная                      | По умолчанию                                 | Описание                                                                                     |
| ------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `--nav-open-width`              | `248px`                                      | Ширина раскрытой панели                                                                      |
| `--nav-compact-width`           | `60px`                                       | Ширина свёрнутой панели (полосы с иконками). У `leftCompact` это ещё и отступ страницы слева |
| `--nav-minimal-bar-height`      | `48px`                                       | `leftMinimal`: высота строки с кнопкой панели над страницей и ширина закрытой панели         |
| `--nav-item-height`             | `32px`                                       | Высота пункта                                                                                |
| `--nav-icon-size`               | `18px`                                       | Размер иконки                                                                                |
| `--nav-gap`                     | `0px`                                        | Отступ вокруг и между панелью и страницей                                                    |
| `--nav-page-shift`              | `64px`                                       | Сдвиг снизу при появлении страницы в `entrance`                                              |
| `--nav-page-slide-shift`        | `64px`                                       | Сдвиг сбоку в `slide`                                                                        |
| `--nav-page-drill-scale`        | `0.94`                                       | Начальный масштаб страницы в `drillIn` при переходе вглубь (при возврате `2 − значение`)     |
| `--nav-overlay-scrim`           | `rgb(0 0 0 / 0.32)`                          | Цвет затемнения страницы под панелью, раскрытой поверх страницы                              |
| `--nav-overlay-pane-background` | 88% от `--SolidBackgroundFillColorBaseBrush` | Фон панели, раскрытой поверх страницы. Под ним размытие страницы                             |
| `--nav-anim-duration`           | `var(--ControlAnimationDuration)`            | Длительность анимации панели и групп                                                         |
| `--nav-anim-easing`             | `var(--ControlAnimationEasing)`              | Кривая анимации панели и групп                                                               |

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

### Переходы между страницами

1. `pageKey` изменился: рамка страницы создаётся заново, прежняя страница убирается сразу, а на её месте появляется новая и анимируется. Содержимое всегда берётся из актуального маршрута.
2. Переход выбирается в таком порядке: `transition` у `Page`, затем `pageTransition` у `NavigationView`, затем `"auto"`.
3. Анимация идёт через Web Animations на рамке страницы и трогает только `transform` и `opacity`. Она стартует до отрисовки первого кадра, поэтому страница не мелькает целиком. По окончании эффект снимается: на рамке не остаётся ни `transform`, ни `opacity`.
4. У каждой страницы своя область прокрутки: страница открывается с начала, а закреплённая шапка `Page` работает внутри неё. `<main>` обрезает содержимое (`overflow: clip`), поэтому сдвиг не создаёт полос прокрутки, а фокус на смещённом элементе не сдвигает окно страницы.
5. Перехода нет у первой страницы, при повторном выборе текущей страницы и при перерисовках без смены ключа (например, при сворачивании панели).
6. Если страница сменилась, не дождавшись конца анимации, остаётся одна рамка: прежняя уже убрана, её анимации снимаются.

#### Встроенные переходы

Время и кривые взяты из [Motion in Windows](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion): сдвиг и масштаб идут 333 мс по кривой `cubic-bezier(0, 0, 0, 1)` (Direct Entrance), проявление 83 мс линейно (Bare Minimum). Величины сдвига и масштаба в статьях не заданы: это значения по умолчанию, их можно менять переменными.

| Имя        | В WinUI          | Что происходит                                                                                                    | Для чего                       |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `entrance` | Page refresh     | страница выезжает снизу на `--nav-page-shift` и проявляется                                                       | пункты меню, вершина стека     |
| `drillIn`  | Drill            | вперёд: страница вырастает с `--nav-page-drill-scale` до 1; назад: с зеркального масштаба `2 − scale` (1.06) до 1 | вглубь иерархии и возврат      |
| `slide`    | Horizontal slide | вперёд страница выезжает справа, назад слева, на `--nav-page-slide-shift`                                         | соседние страницы рядом        |
| `suppress` | Suppress         | без анимации                                                                                                      | свои анимации, частые переходы |
| `auto`     | —                | соседние страницы: `entrance`; вглубь и назад: `drillIn`                                                          | по умолчанию                   |

Анимируется только появляющаяся страница, ухода прежней нет: статьи описывают только вход.

Статьи расходятся в одном: Motion in Windows говорит, что между верхним уровнем и подстраницами страницы «едут влево и вправо», а Page transitions для перехода вглубь советует Drill. `auto` следует второй. Если нужна первая, задайте `pageTransition="slide"` или функцию (пример 11). Возврат у Drill в статьях не описан, здесь он зеркальный: это решение компонента.

#### Как определяется связь страниц

Только для ключей-путей: строк, начинающихся с «/» (запрос и хеш отбрасываются, конечный «/» тоже).

| Было → стало                                                           | `relation` | `direction` |
| ---------------------------------------------------------------------- | ---------- | ----------- |
| `/performance` → `/performance/new`                                    | `child`    | `forward`   |
| `/performance/5/edit` → `/performance`                                 | `parent`   | `back`      |
| `/groups` → `/students`, `/performance/5/edit` → `/performance/6/edit` | `peer`     | `forward`   |
| не пути: `"home"` → `"users"`, числа                                   | `peer`     | `forward`   |

Корень «/» родителем не считается: верхние страницы меню равноправны. Направление определяется иерархией пути, а не историей браузера: кнопка «Назад» браузера с `/performance` на `/groups` остаётся переходом «рядом».

#### Уменьшение движения

При `prefers-reduced-motion: reduce` любой переход, кроме `suppress`, заменяется затуханием за 83 мс без движения. Это относится и к своим функциям.

### Режимы панели

Поведение повторяет [режимы WinUI NavigationView](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview): у `left` раскрытая панель стоит рядом со страницей, у `leftCompact` и `leftMinimal` лежит поверх неё.

- **`left`.** Панель в потоке слева от страницы и сдвигает её. У явного `left` кнопки нет, панель всегда раскрыта. У `left`, выбранного в `auto`, кнопка есть: она сворачивает панель в полосу `--nav-compact-width`, страница при этом сдвигается. Выбор пункта панель не закрывает.
- **`leftCompact`.** Закрытая панель остаётся в потоке полосой с иконками, страница стоит правее. Категории в полосе открываются всплывающим меню.
- **`leftMinimal`.** В закрытом виде видна только кнопка панели в левом верхнем углу. Полосы нет, страница занимает всю ширину, а сверху резервируется строка `--nav-minimal-bar-height` (48px), чтобы кнопка не перекрывала содержимое. Скрытая панель не перехватывает клики, её пункты не показываются и не попадают в Tab.
- **`auto`** выбирает один из трёх по ширине корня (таблица выше) и пересчитывает выбор при изменении размера. При переходе в `left` панель раскрывается, при переходе в `leftCompact` или `leftMinimal` сворачивается.
- **Панель, раскрытая поверх страницы** (`leftCompact` и `leftMinimal`): шириной `--nav-open-width`, страницу не сдвигает и не меняет её размер. У панели полупрозрачный фон с размытием (аналог in-app acrylic в WinUI) и тень, страница под ней затемнена (`--nav-overlay-scrim`).
- **Узкий корень.** Если ширина `NavigationView` не больше `overlayFullWidthThreshold` (по умолчанию 640), такая панель занимает всю ширину корня. Затемнение при этом не видно: панель закрывается пунктом, `Esc` или кнопкой.
- **Панель, раскрытая поверх страницы, закрывается** при выборе любого пункта (в том числе без `value` и с `selectsOnInvoked={false}`), по `Esc`, по клику на затемнение и по кнопке панели. Нажатие на категорию только раскрывает её группу. Отменить закрытие по пункту нельзя.
- **Фокус и клики.** Пока панель раскрыта поверх страницы, у области страницы стоит атрибут `inert`: Tab и клики на страницу не попадают. После закрытия по `Esc` фокус возвращается на кнопку панели, в `leftMinimal` ещё и после закрытия по пункту.
- **Смена `paneDisplayMode` на лету.** Панель приводится к начальному состоянию нового режима: `left` раскрывается, `leftCompact` и `leftMinimal` сворачиваются, `auto` подстраивается под ширину. См. пример 9.
- **Отступы содержимого.** WinUI рекомендует поля 12px в `leftMinimal` и 24px в остальных режимах. Компонент поля не задаёт, это дело вашей страницы.

### Подсказки

В свёрнутой панели у пунктов верхнего уровня и категорий с текстовым заголовком появляется нативная подсказка (`title`) с этим заголовком. Если заголовок не строка, подсказки нет, добавьте `title` или `aria-label` сами.

## Клавиатура

| Клавиша               | Действие                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tab` / `Shift`+`Tab` | Переход по пунктам обычным образом                                                                                                                                                 |
| `↓` / `↑`             | Следующий и предыдущий пункт панели с переходом по кругу                                                                                                                           |
| `Home` / `End`        | Первый и последний пункт панели                                                                                                                                                    |
| `Enter` / `Space`     | Выбрать пункт, переключить категорию или открыть всплывающее меню                                                                                                                  |
| `Esc`                 | Закрыть всплывающее меню, фокус возвращается на категорию. У панели, раскрытой поверх страницы (`leftCompact`, `leftMinimal`), закрыть панель, фокус возвращается на кнопку панели |

Стрелки пропускают отключённые пункты и пункты внутри свёрнутых групп. Во всплывающем меню те же клавиши работают по его пунктам. Внутри полей ввода стрелки и `Esc` не перехватываются: `Esc` в поле поиска внутри `paneCustomContent` панель не закрывает.

## Доступность

- Панель — элемент `<nav>` с `aria-label` (по умолчанию «Основная навигация»), страница — `<main>`.
- Кнопка панели имеет `aria-label`, `title`, `aria-expanded` и `aria-controls`.
- Выбранный пункт имеет `aria-current="page"`.
- Категория имеет `aria-expanded`. В свёрнутой панели добавляется `aria-haspopup="true"`, а в раскрытой `aria-controls` ссылается на группу (`role="group"`).
- Всплывающее меню — `role="group"` с `aria-label` из заголовка категории, если он строка.
- Для `prefers-reduced-motion: reduce` отключаются все переходы панели, групп и всплывающего меню, а переход между страницами заменяется затуханием за 83 мс без движения (`suppress` остаётся без анимации).
- Фокус пункта виден как внутренняя обводка 2px.
- Пока панель раскрыта поверх страницы, у `<main>` стоит `inert`, поэтому скринридеры и Tab не заходят в страницу под затемнением. Само затемнение скрыто от скринридеров (`aria-hidden`), закрыть панель с клавиатуры можно по `Esc`.
- В закрытом `leftMinimal` пункты панели скрыты (`display: none`): их нет ни в порядке Tab, ни в дереве доступности. Остаётся кнопка панели.
- На корне стоит `data-pane-mode` со значением применённого режима (`left`, `leftCompact` или `leftMinimal`, для `auto` это результат выбора по ширине) и `data-pane-open`.

## Внешний вид

| Элемент                           | Значение                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Размер шрифта                     | `13px`                                                                                                                                                                    |
| Раскрытая / свёрнутая панель      | `248px` / `60px`, ширина анимируется                                                                                                                                      |
| Пункт                             | высота `32px`, отступы `0 11px`, зазор `8px`, скругление `--CircularCornerRadius`                                                                                         |
| Пункт при наведении и нажатии     | `--ControlFillColorSecondaryBrush` и `--ControlFillColorTertiaryBrush`                                                                                                    |
| Выбранный пункт                   | фон `--ControlFillColorDefaultBrush`, при наведении `--ControlFillColorTertiaryBrush`                                                                                     |
| Отключённый пункт                 | прозрачность `0.4`, события мыши отключены                                                                                                                                |
| Панель, раскрытая поверх страницы | фон `--nav-overlay-pane-background` с размытием `24px`, тень `4px 0 24px rgb(0 0 0 / 0.2)`, затемнение страницы `--nav-overlay-scrim`, на узком корне ширина `100%` корня |
| Закрытая панель `leftMinimal`     | только кнопка в строке высотой `--nav-minimal-bar-height`, фон прозрачный                                                                                                 |
| Иконка                            | `18px`, цвет `--AccentTextFillColorPrimaryBrush`                                                                                                                          |
| Шеврон категории                  | цвет `--TextFillColorSecondaryBrush`, при раскрытии поворот на 90°                                                                                                        |
| Заголовок секции                  | `12px`, вес 600, `--TextFillColorSecondaryBrush`; в свёрнутой панели схлопывается по высоте                                                                               |
| Разделитель                       | `1px`, отступ `6px`, цвет `--DividerStrokeColorDefaultBrush`                                                                                                              |
| Всплывающее меню                  | `GlassPanel` со скруглением `36px`, фон 95% от `--ControlOnImageFillColorDefaultBrush`, отступ `10px`, минимальная ширина `200px`, `z-index: var(--ZIndexPopup)`          |

Панель прокручивается без видимой полосы. Страница прокручивается обычной полосой, но не сам `<main>`, а вложенный в него элемент (первый потомок `<main>`, новый для каждой страницы). `<main>` лишь обрезает содержимое. Поэтому закреплённая шапка `Page` работает внутри этой области, а положение прокрутки не переходит между страницами.

## Что изменилось в режимах панели

Режимы приведены к поведению WinUI NavigationView. Что поменялось для существующего кода:

- **`leftCompact`** раньше раскрывался и сдвигал страницу, теперь раскрытая панель лежит поверх неё, с затемнением и закрытием по пункту, `Esc` и клику вне панели. Ближе всего к прежнему поведению (панель в потоке сдвигает страницу, сворачивается только кнопкой) `auto` с `expandedModeThresholdWidth={0}`. Такая панель стартует раскрытой; чтобы она стартовала свёрнутой, управляйте ею через `isPaneOpen`.
- **`auto`** раньше имел два состояния по одному порогу (900px): раскрыта или полоса, которая сдвигала страницу. Теперь три режима и два порога: `expandedModeThresholdWidth` (по умолчанию `1008`) и новый `compactModeThresholdWidth` (`640`).
- **`expandedModeThresholdWidth={0}`** по-прежнему отключает адаптивность: панель всегда раскрыта и сворачивается кнопкой.
- **`leftMinimal`** новый: в закрытом виде только кнопка панели.
- **`overlayFullWidthThreshold`** новое свойство: панель, раскрытая поверх страницы, занимает всю ширину корня на узком экране. В WinUI такого нет, там панель остаётся шириной `OpenPaneLength`.
- **`onPaneOpenChange`** больше не требует постоянной ссылки в режиме `auto`: панель реагирует на смену режима по ширине, а не на смену колбэка.
- На корне появился `data-pane-mode`.

## Что изменилось в смене страницы

- **Анимация.** Раньше прежняя страница уходила 200 мс, затем 360 мс выезжала новая, всего около 620 мс, и около 50 мс экран оставался пустым. Теперь анимируется только новая страница: около 330 мс, без паузы. Время и кривые из Motion in Windows.
- **Двойная загрузка страницы.** Раньше «уходящая» страница рисовалась из сохранённого `children`. С роутером в нём лежал `<Outlet />`, поэтому при уходе показывалась уже новая страница, а затем она монтировалась ещё раз. При переходе на другую страницу она монтировалась и вызывала `onNavigate` **дважды** (проверено на тестовом роутере: «Группы → Студенты», «Успеваемость → Новая запись»). Теперь монтирование и загрузка по одному разу.
- **Страницы вне меню.** По умолчанию `pageKey` по-прежнему равен выбранному значению, поэтому страница вне меню перехода не запускала. Для маршрутов передавайте `pageKey={pathname}` и `selectedValue={matchNavValue(pathname, …)}` (пример 12).
- **Настройка.** Новые свойства `pageTransition` у `NavigationView` и `transition` у `Page`, фабрики `entranceTransition`, `drillInTransition`, `slideTransition`, `suppressTransition`.
- **`selectedValue`** принимает `null` (ничего не выбрано).
- **Прокрутка.** Прокручивается не `<main>`, а вложенный элемент страницы. Если вы слушали прокрутку `<main>` или сбрасывали её у него, переключитесь на первый потомок `<main>`.
- **Уменьшение движения.** Вместо мгновенной смены (0.01 мс) теперь затухание 83 мс.
- **`--nav-page-shift`** теперь задаёт сдвиг в `entrance` при появлении. Уходящей страницы больше нет.

## Ограничения

- Режима `Top` (горизонтальная панель сверху с меню переполнения) из WinUI нет: панель бывает только слева.
- Кнопки «Назад» и свойства `Header` страницы из WinUI нет. Строка над страницей в `leftMinimal` занята только кнопкой панели.
- Закрытие панели, раскрытой поверх страницы, по выбору пункта и по `Esc` отключить нельзя.
- Полупрозрачность и размытие панели, раскрытой поверх страницы, зависят от `backdrop-filter`. Там, где он не поддерживается, фон остаётся полупрозрачным без размытия: при необходимости задайте непрозрачный `--nav-overlay-pane-background`.
- Возврат фокуса на кнопку панели по `Esc` находит кнопку по атрибуту `data-nv-toggle`. Если ваш `Button` не пробрасывает `data-*` на элемент, панель всё равно закроется, но фокус останется там, где был.
- Выбор пункта категории не раскрывает её автоматически (см. пример 1).
- Подсветка категории по выбранному пункту ищет `value` только среди **прямых** потомков `NavCategory`. Если пункты обёрнуты в свой компонент или фрагмент с условиями, подсветки не будет.
- Категории рассчитаны на один уровень. Вложенные `NavCategory` не поддерживаются.
- Пока открыто всплывающее меню, содержимое категории существует в двух экземплярах: скрытая группа в панели и меню. Не кладите в категорию элементы с собственным состоянием, `autoFocus` или фиксированными `id`.
- Всплывающее меню позиционируется один раз при открытии и не следует за прокруткой панели. Нажатие вне меню закрывает его, прокрутка колесом нет.
- В управляемом режиме `isPaneOpen` в `auto`, если при монтировании режим не `left` (корень не шире 1007px), колбэк `onPaneOpenChange` не вызывается: панель останется в том состоянии, которое вы передали. Задайте начальное значение сами. Последующие смены режима по ширине колбэк вызывают.
- Страница при смене `pageKey` **пересоздаётся**, состояние внутри неё не сохраняется.
- Элемент `<main>` внутри компонента должен быть в приложении единственным.
- Анимации ухода прежней страницы нет, анимируется только появление. Сохранённая копия уходящей страницы с роутером показывает уже новую.
- Свойство `transition` у `Page` читается один раз, когда страница появилась вместе с рамкой. Страница, которая появится позже (`React.lazy` с `Suspense`, условный рендер), своё `transition` не применит: используйте `pageTransition` у `NavigationView`.
- Связь страниц (`child`, `parent`) определяется только по ключам-путям. Для других ключей все переходы «рядом»: используйте функцию в `pageTransition`.
- Фокус при смене страницы не переносится: если он был на элементе прежней страницы, он сбрасывается на `<body>`. При необходимости переведите его на новую страницу сами.
- Тексты `paneAriaLabel` и `toggleButtonLabel` настраиваются, других вшитых текстов у компонента нет.

## Токены

| Что                  | Токены                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Фон страницы и текст | `LayerFillColorDefaultBrush`, `TextFillColorPrimaryBrush`                                             |
| Фон панели           | `SolidBackgroundFillColorBaseBrush`                                                                   |
| Состояния пункта     | `ControlFillColorSecondaryBrush`, `ControlFillColorTertiaryBrush`, `ControlFillColorDefaultBrush`     |
| Фокус                | `AccentFillColorSelectedTextBackgroundBrush`                                                          |
| Иконки и шевроны     | `AccentTextFillColorPrimaryBrush`, `TextFillColorSecondaryBrush`                                      |
| Разделитель          | `DividerStrokeColorDefaultBrush`                                                                      |
| Всплывающее меню     | `ControlOnImageFillColorDefaultBrush`, `ZIndexPopup`                                                  |
| Скругление           | `CircularCornerRadius`                                                                                |
| Анимации панели      | `ControlAnimationDuration`, `ControlAnimationEasing`                                                  |
| Переходы страниц     | значения `pageMotion` (83, 167, 250, 333 мс и кривые из Motion in Windows), переменные `--nav-page-*` |

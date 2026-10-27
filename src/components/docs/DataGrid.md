# DataGrid

Таблица только для просмотра для длинных списков. Строки виртуализированы (в DOM только те, что видны), ширину колонок можно менять, строки можно выделять, следующая порция данных запрашивается, когда пользователь доходит до конца списка. У строки есть контекстное меню (`ContextMenu`).

По умолчанию таблица **скроллится вместе со страницей (`Page`)**: её шапка фиксируется под заголовком страницы, а строки при прокрутке проходят сквозь полупрозрачную шапку таблицы и плавно растворяются под градиентом заголовка страницы.

Таблица ничего не загружает, не сортирует и не фильтрует сама: данные, загрузку, ошибки, поиск и сортировку ведёт родитель. Таблица только показывает переданные `rows`.

## Подключение

```
DataGrid.tsx
DataGrid.module.css
ContextMenu/        // ContextMenu.tsx и ContextMenu.module.css, см. раздел «Контекстное меню»
Toggles/            // Checkbox для колонки выделения, см. Toggles.md
ProgressRing/       // кольцо подгрузки, см. ProgressRing.md
Button/             // кнопка «Повторить»
index.css           // должен быть подключён в приложении: токены и классы типографики
```

```tsx
import { DataGrid } from "./DataGrid";
import type { DataGridColumn, DataGridRowId } from "./DataGrid";
```

Оба файла (`DataGrid.tsx` и `ContextMenu.tsx`) содержат директиву `"use client"` и полностью совместимы с Next.js App Router (SSR).

## Быстрый старт

```tsx
type City = { id: number; name: string; country: string; population: number };

const columns: DataGridColumn<City>[] = [
  { id: "name", header: "Город", cell: (c) => c.name, width: 240 },
  { id: "country", header: "Страна", cell: (c) => c.country },
  { id: "population", header: "Население", cell: (c) => c.population, align: "end" },
];

// Внутри Page таблица скроллится вместе со страницей без дополнительных обёрток:
<Page title="Города">
  <DataGrid aria-label="Города" columns="{columns}" getRowId="{(c)" rows="{cities}"> c.id} />
</Page>
```

## Два режима прокрутки

1. **Прокрутка со страницей (по умолчанию, `height="auto"`):**
   - Таблица находит ближайший прокручиваемый контейнер страницы (`.scroller` в `NavigationView`, `.body` в `Modal` или `window`) и виртуализирует строки относительно него.
   - Шапка таблицы фиксируется под заголовком страницы (`top: 64px`, настраивается через `stickyTop` или `--DataGridStickyTop`) и имеет полупрозрачный размытый фон (`backdrop-filter: blur(16px)`).
   - При прокрутке страницы строки проходят под шапкой таблицы и уходят под градиент заголовка `Page`.
2. **Внутренняя прокрутка (если передан фиксированный `height`, например `height={480}` или `height="100%"`):**
   - Таблица прокручивается внутри собственного контейнера, а её шапка прилипает к `top: 0` самой таблицы с непрозрачным фоном.

## Свойства

| Свойство                        | Тип                                                  | По умолчанию   | Описание                                                                                                 |
| ------------------------------- | ---------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `rows`                          | `readonly T[]`                                       | —              | Загруженные на данный момент строки                                                                      |
| `columns`                       | `readonly DataGridColumn<T>[]`                       | —              | Описание колонок (ниже)                                                                                  |
| `getRowId`                      | `(row) => string \| number`                          | —              | Стабильный уникальный id строки                                                                          |
| `height`                        | `number \| string`                                   | `"auto"`       | `"auto"` — скролл со страницей; число или `"100%"` — внутренний скролл в контейнере фиксированной высоты |
| `stickyTop`                     | `number \| string`                                   | `64`           | Отступ сверху (px или CSS-значение) для липкой шапки таблицы при скролле со страницей                    |
| `striped`                       | `boolean`                                            | `false`        | Чередующаяся заливка строк вместо разделителей                                                           |
| `emptyContent`                  | `ReactNode`                                          | `"Нет данных"` | Что показать, когда строк нет                                                                            |
| `selectable`                    | `boolean`                                            | `false`        | Колонка с чекбоксами                                                                                     |
| `selectedIds`                   | `ReadonlySet<id>`                                    | —              | Выделенные id (управляемый режим)                                                                        |
| `defaultSelectedIds`            | `Iterable<id>`                                       | —              | Выделенные id в начале (неуправляемый режим)                                                             |
| `onSelectionChange`             | `(ids: ReadonlySet<id>) => void`                     | —              | Выделение изменилось. Приходит новый `Set`                                                               |
| `onRowClick`                    | `(row) => void`                                      | —              | Клик по строке                                                                                           |
| `onRowActivate`                 | `(row) => void`                                      | —              | Двойной клик или Enter на строке                                                                         |
| `hasMore`                       | `boolean`                                            | `false`        | На сервере есть ещё данные                                                                               |
| `loadingMore`                   | `boolean`                                            | `false`        | Идёт подгрузка: в конце списка кольцо                                                                    |
| `loadMoreError`                 | `boolean`                                            | `false`        | Подгрузка упала: сообщение и кнопка «Повторить»                                                          |
| `onEndReached`                  | `() => void`                                         | —              | Пора загрузить следующую порцию                                                                          |
| `endReachedThreshold`           | `number`                                             | `10`           | За сколько строк до конца вызывается `onEndReached`                                                      |
| `totalCount`                    | `number`                                             | —              | Всего строк на сервере, только для скринридеров                                                          |
| `resetKey`                      | `string \| number`                                   | —              | Смените, когда список заменён целиком (поиск, сортировка)                                                |
| `rowMenu`                       | `(target) => ContextMenuItem[] \| null \| undefined` | —              | Пункты контекстного меню строки                                                                          |
| `animateChanges`                | `boolean`                                            | `true`         | Анимировать появление и исчезновение строк                                                               |
| `className`, `style`            |                                                      |                | Корневой элемент                                                                                         |
| `aria-label`, `aria-labelledby` |                                                      |                | Имя таблицы. Передайте одно из них                                                                       |

## Колонки

```ts
type DataGridColumn<T> = {
  id: string; // уникален в таблице
  header: ReactNode; // заголовок
  cell: (row: T, index: number) => ReactNode;
  width?: number; // начальная ширина, 160
  minWidth?: number; // 80
  maxWidth?: number;
  resizable?: boolean; // true
  align?: "start" | "center" | "end"; // выравнивание заголовка и ячеек
};
```

### Изменение ширины и горизонтальная прокрутка

- Мышью: потяните правый край заголовка. С клавиатуры: Tab до ручки (`role="separator"`), затем ← и → меняют ширину на 10px (с Shift — на 50px).
- Если суммарная ширина колонок больше ширины страницы, у тела таблицы появляется горизонтальная прокрутка, а липкая шапка синхронно прокручивается вместе со строками, не теряя вертикальной фиксации (`position: sticky`).

## Выделение и работа с `useActionState` (React 19)

```tsx
const [selected, setSelected] = useState<ReadonlySet<DataGridRowId>>(new Set());
const [state, formAction, isPending] = useActionState(deleteRowsAction, null);

<form action={formAction}>
  {/* Так как строки виртуализированы, передаём выделенные id через скрытые поля */}
  {Array.from(selected).map((id) => (
    <input key={id} type="hidden" name="selectedIds" value={String(id)} />
  ))}
  <Button 0 appearance="destructive" disabled="{selected.size" isPending} type="submit" ||>
    Удалить выбранные ({selected.size})
  </Button>
</form>

<DataGrid columns="{columns}" getRowId="{(r)" rows="{rows}" selectable> r.id}
  selectedIds={selected}
  onSelectionChange={setSelected}
  aria-label="Список записей"
/>
```

- Колонка с чекбоксами выделяет строки. Клик по самой строке выделения не меняет, он вызывает только `onRowClick`.
- Shift+клик по чекбоксу выделяет диапазон от последней отмеченной строки.
- Когда действие (`useActionState` или `useOptimistic`) удаляет или добавляет до 20 строк, таблица автоматически плавно сдвигает соседние строки и подсвечивает новые записи акцентным цветом.

## Бесконечная прокрутка

```tsx
<DataGrid ... endReachedThreshold="{10}" hasMore="{hasMore}" loadMoreError="{failed}" loadingMore="{loading}" onEndReached="{loadNext}" rows="{rows}"/>
```

- `onEndReached` вызывается, когда до конца загруженных строк остаётся не больше `endReachedThreshold` строк (по умолчанию 10) и при этом `hasMore` равен `true`, нет `loadingMore` и нет `loadMoreError`.
- Если строк не хватает, чтобы заполнить экран, а `hasMore` равен `true`, `onEndReached` вызывается автоматически.

## Контекстное меню

```tsx
<DataGrid [ row, rowMenu="{({" rows })> ({ id: "open", label: "Открыть", icon: <OpenIcon/>, onSelect: () => open(row) },
    { id: "copy", label: "Копировать", hint: "Ctrl+C", onSelect: () => copy(rows) },
    { type: "separator" },
    { id: "delete", label: "Удалить", danger: true, onSelect: () => remove(rows) },
  ]}
  ...
/>
```

- Рендерится порталом в `<body>` с `position: fixed` и слоем `--ZIndexPopup`.
- Открывается правой кнопкой мыши или клавишами Shift+F10 / «Меню» на активной строке.
- При выборе пункта фокус возвращается на таблицу **до** вызова `onSelect`, поэтому `Modal`, открытый из `onSelect`, при закрытии корректно вернёт фокус обратно на таблицу.

## Клавиатура

| Клавиша            | Действие                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------- |
| ↑ / ↓              | Курсор на строку выше или ниже (с автоматической подкруткой страницы с учётом липкой шапки) |
| PageUp / PageDown  | Курсор на экран вверх или вниз                                                              |
| Home / End         | Первая или последняя загруженная строка                                                     |
| Space              | Выделить или снять выделение (при `selectable`)                                             |
| Enter              | `onRowActivate` для строки с курсором                                                       |
| Ctrl+A / Cmd+A     | Выделить все загруженные строки (при `selectable`)                                          |
| Shift+F10 / «Меню» | Контекстное меню строки (если задан `rowMenu`)                                              |

## Токены и CSS-переменные

| Что                        | Переменная / Токен                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Отступ липкой шапки сверху | `--DataGridStickyTop` (по умолчанию `64px`)                                                                           |
| Фон шапки таблицы          | `--DataGridHeaderBackground` (по умолчанию `78%` от `LayerFillColorDefaultBrush` с `blur(16px)` при скролле страницы) |
| Разделитель                | `DividerStrokeColorDefaultBrush`                                                                                      |
| Строки                     | `ControlFillColorDefaultBrush`, `ControlFillColorSecondaryBrush`, `AccentFillColorDefaultBrush`                       |
| Курсор и ручка             | `AccentFillColorSelectedTextBackgroundBrush`, `AccentFillColorDefaultBrush`, `TextFillColorTertiaryBrush`             |
| Меню                       | `ZIndexPopup`, `ControlOnImageFillColorDefaultBrush`, `SurfaceStrokeColorDefaultBrush`, `ControlCornerRadius`         |

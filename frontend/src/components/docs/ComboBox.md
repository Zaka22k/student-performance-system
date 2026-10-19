# ComboBox

Текстовое поле с кнопкой раскрытия списка (по [Apple HIG: Combo boxes](https://developer.apple.com/design/human-interface-guidelines/combo-boxes)). Пользователь может **ввести свой текст** или **выбрать значение из списка**. Введённый вручную текст в список не добавляется.

Выпадающий список обычный: сплошная заливка из токена `--ControlOnImageFillColorDefaultBrush`, тонкая рамка `--SurfaceStrokeColorDefaultBrush` и скругление `--ControlCornerRadius`. Остальные цвета, анимации и скругление кнопки тоже из токенов `index.css`.

Размеры и вид поля (высота, ширина, отступы, подпись, фокус, отключённое состояние) совпадают с `TextField` из `Fields.tsx`, см. [Fields.md](./Fields.md). Общие значения лежат в токенах `Control*` в `index.css`.

## Подключение

Файлы лежат рядом с `index.css`:

```
ComboBox.tsx
ComboBox.module.css
index.css        // должен быть подключён в приложении: токены и классы типографики
```

```tsx
import { ComboBox } from "./ComboBox";
```

## Быстрый старт

```tsx
<ComboBox
  label="Город:"
  options={["Москва", "София", "Берлин"]}
  defaultValue="София"
  placeholder="Введите город"
  onChange={(value) => console.log(value)}
/>
```

## Свойства

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `options` | `readonly (string \| object)[]` | — | Варианты: строки, объекты или смесь |
| `value` | `string` | — | Текущее значение (управляемый режим) |
| `defaultValue` | `string` | `""` | Начальное значение (неуправляемый режим) |
| `onChange` | `(value: string, option: T \| null) => void` | — | Вызывается при каждом изменении. `option` — выбранный элемент, `null` — если текст свой |
| `valueKey` | `keyof T` | — | Поле объекта, которое служит значением (например, `id`) |
| `labelKey` | `keyof T` | — | Поле объекта, которое показывается пользователю |
| `getOptionValue` | `(option) => string` | — | То же, что `valueKey`, но функцией. Приоритетнее |
| `getOptionLabel` | `(option) => string` | — | То же, что `labelKey`, но функцией. Приоритетнее |
| `renderOption` | `(option, state) => ReactNode` | — | Своё содержимое пункта списка |
| `filter` | `boolean \| (option, query, label) => boolean` | `true` | Фильтрация списка при вводе |
| `label` | `ReactNode` | — | Вводная подпись |
| `labelPlacement` | `"top" \| "start"` | `"top"` | Подпись над полем или перед ним |
| `toggleLabel` | `string` | `"Показать варианты"` | Доступное имя кнопки раскрытия |
| `className`, `style` | | | Применяются к корневому элементу |
| остальные | атрибуты `<input>` | | `placeholder`, `disabled`, `name`, `id`, `onFocus`, `onBlur`, `onKeyDown`… идут на `<input>` |

`ref` указывает на `<input>`.


## Что считается значением

| Что выбрал или ввёл пользователь | `value` | `option` в `onChange` |
| --- | --- | --- |
| Пункт из списка | `getOptionValue(option)` (для строки — сама строка) | сам элемент |
| Текст, совпавший с подписью пункта (без учёта регистра) | значение этого пункта | этот элемент |
| Любой другой текст | введённый текст | `null` |

Поле показывает подпись пункта, значение которого равно `value`. Если такого пункта нет, показывается сам `value`: так выглядит свой текст.

Значения пунктов и своего текста лежат в одном пространстве. Если пользователь введёт текст, равный `id` какого-то пункта, после выхода из поля он увидит подпись этого пункта.

## Примеры

### 1. Строки

```tsx
const cities = ["Москва", "София", "Берлин", "Париж"];

<ComboBox label="Город:" options={cities} defaultValue="София" />
```

### 2. Объекты: значение — `id`, отображение — `name`

```tsx
interface City {
  id: string;
  name: string;
  country: string;
}

const cities: City[] = [
  { id: "msk", name: "Москва", country: "Россия" },
  { id: "sof", name: "София", country: "Болгария" },
  { id: "ber", name: "Берлин", country: "Германия" },
];

<ComboBox
  label="Город:"
  options={cities}
  valueKey="id"
  labelKey="name"
  defaultValue="sof"
  onChange={(value, option) => {
    // value === "sof", option === { id: "sof", ... }
    // свой текст: option === null, value — введённая строка
  }}
/>;
```

### 3. Значение и подпись функциями

```tsx
<ComboBox
  options={cities}
  getOptionValue={(c) => c.id}
  getOptionLabel={(c) => `${c.name}, ${c.country}`}
/>
```

### 4. Управляемый режим

```tsx
const [cityId, setCityId] = useState("sof");

<ComboBox
  label="Город:"
  options={cities}
  valueKey="id"
  labelKey="name"
  value={cityId}
  onChange={(value) => setCityId(value)}
/>;
```

Чтобы понять, выбрал ли пользователь пункт или ввёл свой текст, смотрите на второй аргумент:

```tsx
onChange={(value, option) => {
  setCityId(value);
  setIsCustom(option === null);
}}
```

### 5. Свой пункт списка

`renderOption` заменяет содержимое пункта. Оболочка (подсветка, клик, клавиатура, `aria-selected`) остаётся стандартной.

```tsx
<ComboBox
  label="Город:"
  options={cities}
  valueKey="id"
  labelKey="name"
  renderOption={(city, { selected }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontWeight: selected ? 600 : 400 }}>{city.name}</span>
      <span className="CaptionTextBlockStyle"
            style={{ color: "var(--TextFillColorTertiaryBrush)" }}>
        {city.country}
      </span>
    </div>
  )}
/>
```

Содержимое лежит в блоке с `overflow: hidden` и `white-space: nowrap`. Если нужен перенос строк, задайте `white-space: normal` внутри своего элемента.

### 6. Подпись слева, как в macOS

```tsx
<ComboBox label="Город:" labelPlacement="start" options={cities} />
```

### 7. Без фильтрации или со своим фильтром

```tsx
// Список всегда показывает все варианты:
<ComboBox options={cities} filter={false} />

// Поиск ещё и по стране:
<ComboBox
  options={cities}
  labelKey="name"
  valueKey="id"
  filter={(c, query) =>
    `${c.name} ${c.country}`.toLowerCase().includes(query.toLowerCase())
  }
/>
```

### 8. Ширина

Ширина по умолчанию `auto`: её определяет само поле ввода (около 20 символов, она не зависит от длины выбранного значения), но не шире контейнера. Ширина списка всегда равна ширине поля. Так же устроен `TextField`. Чтобы поля одной формы выстроились в одну колонку, задайте им одинаковую ширину.

```tsx
<ComboBox options={cities} style={{ width: 320 }} />
<ComboBox options={cities} style={{ width: "100%" }} />
```

### 9. В форме

```tsx
<form onSubmit={handleSubmit}>
  <ComboBox name="city" label="Город:" options={cities} />
</form>
```

В форму уходит отображаемый текст поля (`name` ставится на `<input>`). Для отправки `id` держите значение в состоянии и добавьте `<input type="hidden">`.

## Поведение

- Кнопка со стрелкой открывает полный список, без фильтрации.
- Ввод текста открывает список и фильтрует его (если `filter` не `false`). Если совпавших пунктов нет, список не показывается.
- Выбранный пункт получает `aria-selected="true"`. Визуально он ничем не выделен: подсвечивается только пункт под курсором.
- Фокус на поле показывается контуром `2px` вокруг всего поля, как у `TextField`.
- Список открывается вниз; если снизу не хватает места, а сверху больше, то вверх.
- Список рисуется порталом в `document.body` с `position: fixed` и выравнивается по полю: по левому краю и ширине. При прокрутке любого родителя и изменении размера окна он следует за полем. Благодаря этому его не обрезают родители с `overflow` (например, прокручиваемое тело `Modal`). Слой списка `--ZIndexPopup` выше модальных окон.
- Длинные подписи в списке обрезаются многоточием, чтобы пункты не были шире поля (рекомендация HIG).
- Список закрывается при выборе, `Esc`, `Tab` и потере фокуса.

## Клавиатура

| Клавиша | Действие |
| --- | --- |
| `↓` / `↑` | Открыть список (курсор на выбранном или первом/последнем пункте); если открыт — переместить курсор по кругу |
| `Enter` | Выбрать пункт под курсором; если курсора нет — закрыть список (форма отправится как обычно) |
| `Esc` | Закрыть список |
| `Tab` | Закрыть список и перейти дальше |

## Доступность

`<input role="combobox">` с `aria-expanded`, `aria-controls`, `aria-autocomplete` и `aria-activedescendant`. Список — `role="listbox"`, пункты — `role="option"` с `aria-selected`. Подпись связана с полем через `htmlFor`. Кнопка раскрытия не попадает в Tab-порядок, управлять списком можно с поля. Анимации отключаются при `prefers-reduced-motion`.

## Рекомендации HIG

- Подставляйте в поле **осмысленное значение по умолчанию** из списка (`defaultValue` / `value`). Это не обязательно первый пункт.
- Добавляйте **вводную подпись**: заглавные буквы как в заголовке и двоеточие в конце (`"Город:"`). Двоеточие компонент сам не ставит.
- Предлагайте **релевантные варианты**: список для самых вероятных значений, а остальное пользователь введёт сам.
- Следите, чтобы **подписи пунктов были короткими**: пункт не шире поля.
- На iOS, iPadOS, tvOS, visionOS и watchOS у Apple combo box не поддерживается, это паттерн для macOS и десктопа. Для мобильных экранов лучше выбрать другой элемент.

## Токены

| Что | Токены |
| --- | --- |
| Список | заливка `ControlOnImageFillColorDefaultBrush`, рамка `SurfaceStrokeColorDefaultBrush` (1px), скругление `ControlCornerRadius` |
| Размеры поля | `ControlHeight`, `ControlPaddingInline`, `ControlLabelGap`, `ControlLabelInlineGap` (общие с `TextField`) |
| Поле | `ControlFillColor{Default,Secondary,Tertiary,Disabled}Brush`, `ControlElevationBorderBrush`, `ControlCornerRadius` |
| Текст | `TextFillColor{Primary,Secondary,Tertiary,Disabled}Brush` |
| Акценты | `AccentFillColorSelectedTextBackgroundBrush` (контур фокуса и выделение текста) |
| Слой списка | `ZIndexPopup` (выше `ZIndexModal`, поэтому список виден поверх модального окна) |
| Анимация | `ControlAnimationDuration`, `ControlAnimationEasing` |
| Кнопка | `CircularCornerRadius` |
| Типографика | классы `BodyTextBlockStyle` из `index.css` |

Скругление поля, пунктов и самого списка (`8px`) берётся из токена `ControlCornerRadius`.

## Ограничения

- Список лежит в портале и позиционируется по рамке поля, поэтому он не привязан к DOM-родителям поля. Если поле прокрутили за границу видимой области, список остаётся рядом с ним и может выглядеть оторванным от контейнера. Закрыть его в этот момент можно `Esc` или кликом мимо.
- Положение списка пересчитывается при прокрутке и изменении размера окна, но не при изменении размера самого поля без этих событий (например, когда соседние элементы сдвинули поле). После такого сдвига закройте и откройте список заново.
- Для портала нужен `react-dom` и браузерное окружение: список создаётся только при открытии, поэтому серверный рендер не затрагивается.
- Высота списка ограничена 240px и прокручивается. Значение лежит в константе `LIST_MAX_HEIGHT` в `ComboBox.tsx`.
- Для объектов нужно указать `valueKey`, `labelKey` или функции. Если задан только один из ключей, он используется и как значение, и как подпись.

# TextField и SearchField

Два поля ввода из `Fields.tsx`:

- **`TextField`** — обычное текстовое поле с необязательной подписью и иконками. Размеры, отступы, подпись и состояния совпадают с [ComboBox](./ComboBox.md).
- **`SearchField`** — стеклянная строка поиска на `GlassPanel` с кнопкой очистки. Это отдельный компонент со своими размерами (`280 × 36`), он намеренно не выровнен с `TextField` и `ComboBox`.

## Подключение

Файлы лежат рядом с `GlassPanel.tsx` и `index.css`:

```
Fields.tsx
Fields.module.css
GlassPanel.tsx
liquidGlass.ts
index.css        // должен быть подключён в приложении: токены и классы типографики
```

```tsx
import { TextField, SearchField } from "./Fields";
```

---

## TextField

### Быстрый старт

```tsx
<TextField
  label="Имя:"
  placeholder="Введите имя"
  onChange={(e) => console.log(e.target.value)}
/>
```

### Свойства

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | Вводная подпись |
| `labelPlacement` | `"top" \| "start"` | `"top"` | Подпись над полем или перед ним (как в macOS) |
| `startIcon` | `ReactNode` | — | Иконка перед текстом (18 × 18) |
| `endIcon` | `ReactNode` | — | Иконка после текста (18 × 18) |
| `className`, `style` | | | Применяются к **корневому** элементу |
| остальные | атрибуты `<input>` | | `value`, `defaultValue`, `onChange`, `placeholder`, `disabled`, `name`, `id`, `type` (по умолчанию `"text"`)… идут на `<input>` |

`ref` указывает на `<input>`. Атрибут `size` не поддерживается: ширина задаётся стилями.

### Размеры по умолчанию

Те же значения, что у `ComboBox`. Они лежат в токенах `index.css`, поэтому меняются в одном месте:

| Что | Значение | Токен |
| --- | --- | --- |
| Высота поля | `32px` | `--ControlHeight` |
| Ширина | `auto` (по самому полю ввода), но не шире контейнера | — |
| Горизонтальный отступ текста | `10px` | `--ControlPaddingInline` |
| Зазор между подписью и полем (`top`) | `6px` | `--ControlLabelGap` |
| Зазор между подписью и полем (`start`) | `12px` | `--ControlLabelInlineGap` |
| Скругление | `8px` | `--ControlCornerRadius` |
| Рамка | `1px` | `--ControlElevationBorderBrush` |
| Фокус | контур `2px` | `--AccentFillColorSelectedTextBackgroundBrush` |

Ширина по умолчанию относится ко всему компоненту, вместе с подписью `labelPlacement="start"`.

### Примеры

#### 1. Подпись сверху (по умолчанию)

```tsx
<TextField label="Имя:" placeholder="Введите имя" />
```

#### 2. Подпись слева, как в macOS

```tsx
<TextField label="Имя:" labelPlacement="start" placeholder="Введите имя" />
```

#### 3. Без подписи

```tsx
<TextField placeholder="Электронная почта" type="email" />
```

#### 4. С иконками

```tsx
<TextField
  label="Почта:"
  startIcon={<MailIcon />}
  endIcon={<CheckIcon />}
  placeholder="name@example.com"
/>
```

Иконка окрашивается через `currentColor`, размер подгоняется под `18 × 18`. Клик по иконке или по отступу фокусирует поле.

#### 5. Управляемый режим

```tsx
const [name, setName] = useState("");

<TextField
  label="Имя:"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

#### 6. Отключённое поле

```tsx
<TextField label="Имя:" value="Иван" disabled />
```

Подпись, иконки, текст и фон переходят в отключённое состояние, курсор становится `not-allowed`.

#### 7. Ширина

```tsx
<TextField label="Имя:" style={{ width: 320 }} />
<TextField label="Имя:" style={{ width: "100%" }} />
```

#### 8. В одной форме с ComboBox

`TextField` и `ComboBox` совпадают по высоте, ширине, отступам и фокусу, поэтому в форме выглядят одним набором:

```tsx
<form onSubmit={handleSubmit}>
  <TextField name="name" label="Имя:" />
  <ComboBox name="city" label="Город:" options={cities} />
</form>
```

### Что изменилось по сравнению с прежним `TextField`

- `className` и `style` теперь всегда применяются к корневому `<div>`, а не к `<input>` или `<label>`. Для стилизации самого поля используйте токены или CSS-модуль.
- Ширина по умолчанию `auto` вместо `100%`. Чтобы растянуть поле, передайте `style={{ width: "100%" }}`.
- Высота фиксированная `32px` (раньше `min-height`), горизонтальный отступ `10px` (раньше `12px`).
- Один и тот же вид с иконками и без них: поле всегда лежит в обёртке.

### Доступность

Подпись — `<label htmlFor>`, связанная с `<input>`. Если `id` не передан, он генерируется автоматически (`useId`). Фокус показывается контуром вокруг всего поля. Анимации отключаются при `prefers-reduced-motion`.

---

## SearchField

Стеклянная строка поиска: иконка лупы, `<input type="search">` и кнопка очистки, которая появляется, когда в поле есть текст.

### Быстрый старт

```tsx
<SearchField
  placeholder="Поиск по городам"
  onChange={(e) => setQuery(e.target.value)}
/>
```

### Свойства

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `width` | `number \| string` | `280` | Ширина строки |
| `size` | `number` | `36` | Высота строки в пикселях |
| `placeholder` | `string` | `"Поиск…"` | Подсказка |
| `onClear` | `() => void` | — | Вызывается после нажатия на кнопку очистки |
| `clearLabel` | `string` | `"Очистить поиск"` | Доступное имя и всплывающая подсказка кнопки очистки |
| `className`, `style` | | | Применяются к `GlassPanel` |
| остальные | атрибуты `<input>` (кроме `size` и `type`) | | `value`, `defaultValue`, `onChange`, `disabled`, `name`… идут на `<input>` |

`ref` указывает на `<input>`.

### Примеры

```tsx
// Неуправляемый режим
<SearchField placeholder="Поиск" />

// Управляемый режим
const [query, setQuery] = useState("");

<SearchField
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => console.log("очищено")}
/>

// Шире и выше
<SearchField width="100%" size={44} />
```

Нажатие на кнопку очистки сбрасывает значение через нативный сеттер и отправляет событие `input`, поэтому `onChange` срабатывает как при обычном вводе. Затем вызывается `onClear`, и фокус возвращается в поле.

### Ограничения

- Преломление стекла работает только в Chromium, в остальных браузерах `GlassPanel` показывает размытие (это поведение самого `GlassPanel`).
- Подписи (`label`) у `SearchField` нет. Если она нужна, используйте `TextField` или добавьте `aria-label` на `<input>`.

---

## Токены

| Что | Токены |
| --- | --- |
| Размеры `TextField` | `ControlHeight`, `ControlPaddingInline`, `ControlLabelGap`, `ControlLabelInlineGap` |
| Поле | `ControlFillColor{Default,Secondary,Tertiary,Disabled}Brush`, `ControlElevationBorderBrush`, `ControlCornerRadius` |
| Фокус | `AccentFillColorSelectedTextBackgroundBrush` |
| Текст | `TextFillColor{Primary,Secondary,Tertiary,Disabled}Brush` |
| Кнопка очистки | `CircularCornerRadius` |
| Анимация | `ControlAnimationDuration`, `ControlAnimationEasing` |
| Типографика | класс `BodyTextBlockStyle` из `index.css` |

`SearchField` использует цвета полей с прозрачностью через `color-mix`, чтобы поверх стекла строка оставалась полупрозрачной.

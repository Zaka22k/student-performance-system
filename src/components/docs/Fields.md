# TextField и SearchField

Два поля ввода из `Fields.tsx`:

- **`TextField`** — обычное текстовое поле с необязательной подписью, подсказкой или ошибкой снизу и иконками. Размеры, отступы, подпись и состояния совпадают с [ComboBox](./ComboBox.md).
- **`SearchField`** — стеклянная строка поиска на `GlassPanel` с кнопкой очистки. Это отдельный компонент со своими размерами (`280 x 36`), он намеренно не выровнен с `TextField` и `ComboBox`.

## Подключение

Компоненты лежат в `Fields.tsx` (`"use client"`) и стилизуются через `Fields.module.css`. Для работы нужно:

- `GlassPanel`, который `Fields.tsx` импортирует как `../GlassPanel` (он нужен только `SearchField`);
- подключённый в приложении `index.css`: токены `Control*` и классы типографики `BodyTextBlockStyle` и `CaptionTextBlockStyle`.

```tsx
import { TextField, SearchField } from "./Fields";
```

---

## TextField

### Быстрый старт

```tsx
<TextField
  hint="Имя будет видно другим пользователям"
  label="Имя:"
  onChange={(e) => console.log(e.target.value)}
  placeholder="Введите имя"
/>
```

### Свойства

| Свойство             | Тип                     | По умолчанию | Описание                                                                                                                        |
| -------------------- | ----------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `label`              | `ReactNode`             | —            | Вводная подпись                                                                                                                 |
| `labelPlacement`     | `"top" \| "start"`      | `"top"`      | Подпись над полем или перед ним (как в macOS)                                                                                   |
| `hint`               | `ReactNode`             | —            | Текст подсказки снизу поля ввода                                                                                                |
| `error`              | `ReactNode \| boolean`  | —            | Ошибка валидации: подсвечивает рамку красным и выводит текст ошибки вместо `hint`                                                |
| `startIcon`          | `ReactNode`             | —            | Иконка перед текстом (18 x 18)                                                                                                  |
| `endIcon`            | `ReactNode`             | —            | Иконка после текста (18 x 18)                                                                                                   |
| `className`, `style` |                         |              | Применяются к **корневому** элементу                                                                                            |
| остальные            | атрибуты `<input>`      |              | `value`, `defaultValue`, `onChange`, `placeholder`, `disabled`, `name`, `id`, `type` (по умолчанию `"text"`)… идут на `<input>` |

`label`, `hint` и `error` со значением `null`, `undefined`, `false` или `""` не выводятся.

`ref` указывает на `<input>`. Атрибут `size` не поддерживается: ширина задаётся стилями.

### Размеры по умолчанию

Те же значения, что у `ComboBox`. Они лежат в токенах `index.css`, поэтому меняются в одном месте:

| Что                                              | Значение                                             | Токен                                          |
| ------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------- |
| Высота поля                                      | `32px`                                               | `--ControlHeight`                              |
| Ширина                                           | `auto` (по самому полю ввода, подсказка не влияет), но не шире контейнера | —                                              |
| Горизонтальный отступ текста                     | `10px`                                               | `--ControlPaddingInline`                       |
| Зазор между подписью, полем и подсказкой (`top`) | `6px`                                                | `--ControlLabelGap`                            |
| Зазор между подписью и полем (`start`)           | `12px`                                               | `--ControlLabelInlineGap`                      |
| Скругление                                       | `8px`                                                | `--ControlCornerRadius`                        |
| Рамка                                            | `1px`                                                | `--ControlElevationBorderBrush`                |
| Фокус                                            | контур `2px`                                         | `--AccentFillColorSelectedTextBackgroundBrush` |
| Ошибка (`error`)                                 | рамка и текст                                        | `--SystemFillColorCriticalBrush`               |

### Примеры

#### 1. Подпись сверху (по умолчанию)

```tsx
<TextField label="Имя:" placeholder="Введите имя" />
```

#### 2. Подпись слева, как в macOS

```tsx
<TextField label="Имя:" labelPlacement="start" placeholder="Введите имя" />
```

#### 3. С подсказкой (`hint`) и ошибкой (`error`)

```tsx
<TextField
  hint="Минимум 8 символов, включая цифры"
  error={state?.errors?.password}
  label="Пароль:"
  name="password"
  type="password"
/>
```

Подсказка и ошибка не влияют на ширину поля: они переносятся по ширине поля, а не растягивают его. При `labelPlacement="start"` подпись остаётся выровненной по центру самого поля ввода, а подсказка или ошибка располагается строго под полем.

#### 4. С иконками

```tsx
<TextField
  endIcon={<CheckIcon />}
  label="Почта:"
  placeholder="name@example.com"
  startIcon={<MailIcon />}
/>
```

Иконка окрашивается через `currentColor`, размер подгоняется под `18 x 18`. Клик по иконке или по отступу фокусирует поле.

#### 5. В одной форме с ComboBox и `useActionState`

```tsx
const [state, formAction, isPending] = useActionState(registerAction, null);

<form action={formAction}>
  <TextField
    label="Имя:"
    name="name"
    defaultValue={state?.values?.name}
    error={state?.errors?.name}
    disabled={isPending}
  />
  <ComboBox
    label="Город:"
    name="city"
    options={cities}
    defaultValue={state?.values?.city}
    error={state?.errors?.city}
    disabled={isPending}
  />
  <Button type="submit" appearance="primary" disabled={isPending}>
    Отправить
  </Button>
</form>
```

### Доступность

Подпись — `<label htmlFor>`, связанная с `<input>`. Если передан `hint` или `error`, он связывается с `<input>` через атрибут `aria-describedby`, а при наличии `error` на `<input>` выставляется `aria-invalid="true"`. Если `id` не передан, он генерируется автоматически (`useId`). Анимации отключаются при `prefers-reduced-motion`.

---

## SearchField

Стеклянная строка поиска: иконка лупы, `<input type="search">` и кнопка очистки, которая появляется, когда в поле есть текст.

### Быстрый старт

```tsx
<SearchField
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Поиск по городам"
/>
```

### Свойства

| Свойство             | Тип                                        | По умолчанию       | Описание                                                                   |
| -------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------------------------------- |
| `width`              | `number \| string`                         | `280`              | Ширина строки                                                              |
| `size`               | `number`                                   | `36`               | Высота строки в пикселях                                                   |
| `placeholder`        | `string`                                   | `"Поиск…"`         | Подсказка                                                                  |
| `onClear`            | `() => void`                               | —                  | Вызывается после нажатия на кнопку очистки                                 |
| `clearLabel`         | `string`                                   | `"Очистить поиск"` | Доступное имя и всплывающая подсказка кнопки очистки                       |
| `className`, `style` |                                            |                    | Применяются к `GlassPanel`                                                 |
| остальные            | атрибуты `<input>` (кроме `size` и `type`) |                    | `value`, `defaultValue`, `onChange`, `disabled`, `name`… идут на `<input>` |

`ref` указывает на `<input>`.

### Поведение

Клик в любом месте строки, в том числе по иконке и по отступам, фокусирует поле. Кнопка очистки показывается, пока в поле есть текст и оно не отключено.

Нажатие на кнопку очистки сбрасывает значение через нативный сеттер и отправляет событие `input`, поэтому `onChange` срабатывает как при обычном вводе, и в управляемом режиме родитель получает пустое значение. Затем вызывается `onClear`, и фокус остаётся в поле. При сбросе родительской формы (`form.reset()`) состояние кнопки очистки также синхронизируется автоматически.
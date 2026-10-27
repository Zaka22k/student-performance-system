# ComboBox

Текстовое поле с кнопкой раскрытия списка (по [Apple HIG: Combo boxes](https://developer.apple.com/design/human-interface-guidelines/combo-boxes)). Пользователь может **ввести свой текст** или **выбрать значение из списка**. Введённый вручную текст в список не добавляется.

Размеры и вид поля (высота, ширина, отступы, подпись, подсказка и ошибка снизу, фокус, отключённое состояние) совпадают с `TextField` из `Fields.tsx`, см. [Fields.md](./Fields.md).

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

Компонент содержит директиву `"use client"` для работы в Next.js App Router.

## Быстрый старт

```tsx
<ComboBox
  defaultValue="София"
  hint="Выберите из списка или введите свой вариант"
  label="Город:"
  onChange={(value) => console.log(value)}
  options={["Москва", "София", "Берлин"]}
  placeholder="Введите город"
/>
```

## Свойства

| Свойство             | Тип                                            | По умолчанию          | Описание                                                                                     |
| -------------------- | ---------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `options`            | `readonly (string \| object)[]`                | —                     | Варианты: строки, объекты или смесь                                                          |
| `value`              | `string`                                       | —                     | Текущее значение (управляемый режим)                                                         |
| `defaultValue`       | `string`                                       | `""`                  | Начальное значение (неуправляемый режим)                                                     |
| `onChange`           | `(value: string, option: T \| null) => void`   | —                     | Вызывается при каждом изменении. `option` — выбранный элемент, `null` — если текст свой      |
| `valueKey`           | `keyof T`                                      | —                     | Поле объекта, которое служит значением (например, `id`)                                      |
| `labelKey`           | `keyof T`                                      | —                     | Поле объекта, которое показывается пользователю                                              |
| `getOptionValue`     | `(option) => string`                           | —                     | То же, что `valueKey`, но функцией. Приоритетнее                                             |
| `getOptionLabel`     | `(option) => string`                           | —                     | То же, что `labelKey`, но функцией. Приоритетнее                                             |
| `renderOption`       | `(option, state) => ReactNode`                 | —                     | Своё содержимое пункта списка                                                                |
| `filter`             | `boolean \| (option, query, label) => boolean` | `true`                | Фильтрация списка при вводе                                                                  |
| `label`              | `ReactNode`                                    | —                     | Вводная подпись                                                                              |
| `labelPlacement`     | `"top" \| "start"`                             | `"top"`               | Подпись над полем или перед ним                                                              |
| `hint`               | `ReactNode`                                    | —                     | Текст подсказки снизу поля ввода                                                             |
| `error`              | `ReactNode \| boolean`                         | —                     | Ошибка валидации: подсвечивает рамку красным и выводит текст ошибки вместо `hint`            |
| `toggleLabel`        | `string`                                       | `"Показать варианты"` | Доступное имя кнопки раскрытия                                                               |
| `className`, `style` |                                                |                       | Применяются к корневому элементу                                                             |
| остальные            | атрибуты `<input>`                             |                       | `placeholder`, `disabled`, `name`, `id`, `form`, `onFocus`, `onBlur`, `onKeyDown`… идут на `<input>` |

`label`, `hint` и `error` со значением `null`, `undefined`, `false` или `""` не выводятся.

`ref` указывает на видимый `<input>`.

## Что считается значением

| Что выбрал или ввёл пользователь                        | `value` (и значение в `FormData`)                   | `option` в `onChange` |
| ------------------------------------------------------- | --------------------------------------------------- | --------------------- |
| Пункт из списка                                         | `getOptionValue(option)` (для строки — сама строка) | сам элемент           |
| Текст, совпавший с подписью пункта (без учёта регистра) | значение этого пункта                               | этот элемент          |
| Любой другой текст                                      | введённый текст                                     | `null`                |

Поле показывает подпись пункта, значение которого равно `value`. Если такого пункта нет, показывается сам `value`: так выглядит свой текст.

Значения пунктов и своего текста лежат в одном пространстве. Если пользователь введёт текст, равный `id` какого-то пункта, после выхода из поля он увидит подпись этого пункта.

## Примеры

### 1. Строки

```tsx
const cities = ["Москва", "София", "Берлин", "Париж"];

<ComboBox defaultValue="София" label="Город:" options={cities} />;
```

### 2. С подсказкой (`hint`) и ошибкой валидации (`error`)

```tsx
<ComboBox
  defaultValue="София"
  hint="Можно выбрать город из списка или вписать вручную"
  error={state?.errors?.city}
  label="Город:"
  options={cities}
/>
```

Подсказка и ошибка не влияют на ширину поля: они переносятся по ширине поля, а не растягивают его. Если передан текст или узел в `error`, он выводится вместо `hint` и окрашивается в критический цвет (`--SystemFillColorCriticalBrush`). Если передать `error={true}`, поле подсветится красной рамкой, а снизу останется `hint`.

### 3. Объекты: значение — `id`, отображение — `name`

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
  defaultValue="sof"
  label="Город:"
  labelKey="name"
  onChange={(value, option) => {
    // value === "sof", option === { id: "sof", ... }
    // свой текст: option === null, value — введённая строка
  }}
  options={cities}
  valueKey="id"
/>;
```

### 4. Значение и подпись функциями

```tsx
<ComboBox
  getOptionLabel={(c) => `${c.name}, ${c.country}`}
  getOptionValue={(c) => c.id}
  options={cities}
/>
```

### 5. Управляемый режим

```tsx
const [cityId, setCityId] = useState("sof");

<ComboBox
  label="Город:"
  labelKey="name"
  onChange={(value) => setCityId(value)}
  options={cities}
  value={cityId}
  valueKey="id"
/>;
```

### 6. Свой пункт списка

`renderOption` заменяет содержимое пункта. Оболочка (подсветка, клик, клавиатура, `aria-selected`) остаётся стандартной.

```tsx
<ComboBox
  label="Город:"
  labelKey="name"
  options={cities}
  renderOption={(city, { selected }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontWeight: selected ? 600 : 400 }}>{city.name}</span>
      <span
        className="CaptionTextBlockStyle"
        style={{ color: "var(--TextFillColorTertiaryBrush)" }}
      >
        {city.country}
      </span>
    </div>
  )}
  valueKey="id"
/>
```

### 7. Подпись слева, как в macOS

```tsx
<ComboBox label="Город:" labelPlacement="start" options={cities} />
```

### 8. Без фильтрации или со своим фильтром

```tsx
// Список всегда показывает все варианты:
<ComboBox filter={false} options={cities} />

// Поиск ещё и по стране:
<ComboBox
  filter={(c, query) =>
    `${c.name} ${c.country}`.toLowerCase().includes(query.toLowerCase())
  }
  labelKey="name"
  options={cities}
  valueKey="id"
/>
```

### 9. Ширина

```tsx
<ComboBox options={cities} style={{ width: 320 }} />
<ComboBox options={cities} style={{ width: "100%" }} />
```

### 10. В форме с `useActionState` (React 19 / Next.js)

```tsx
const [state, formAction, isPending] = useActionState(saveCityAction, null);

<form action={formAction}>
  <ComboBox
    label="Город:"
    name="city"
    options={cities}
    valueKey="id"
    labelKey="name"
    defaultValue={state?.values?.city ?? "sof"}
    error={state?.errors?.city}
    disabled={isPending}
  />
  <Button type="submit" appearance="primary" disabled={isPending}>
    Сохранить
  </Button>
</form>
```

Если передан `name` (и поле не `disabled`), `ComboBox` автоматически рендерит скрытый `<input type="hidden" name={name} value={current} />`. Благодаря этому в `FormData` сразу попадает `id` выбранного объекта (например, `"sof"`) или введённый вручную текст, а в видимом поле отображается подпись (`"София"`).

При нативном сбросе формы (`form.reset()`, в том числе после успешного выполнения экшена в React 19) `ComboBox` автоматически возвращает значение к `defaultValue`.

## Поведение

- Кнопка со стрелкой открывает полный список, без фильтрации.
- Ввод текста открывает список и фильтрует его (если `filter` не `false`). Если совпавших пунктов нет, список не показывается.
- Выбранный пункт получает `aria-selected="true"`. Визуально он ничем не выделен: подсвечивается только пункт под курсором.
- Фокус на поле показывается контуром `2px` вокруг всего поля, как у `TextField`.
- Список открывается вниз; если снизу не хватает места, а сверху больше, то вверх.
- Список рисуется порталом в `document.body` с `position: fixed` и выравнивается по полю. При прокрутке любого родителя и изменении размера окна он следует за полем. Слой списка `--ZIndexPopup` выше модальных окон.
- Список закрывается при выборе, `Esc`, `Tab` и потере фокуса.

## Клавиатура

| Клавиша   | Действие                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `↓` / `↑` | Открыть список (курсор на выбранном или первом/последнем пункте); если открыт — переместить курсор по кругу |
| `Enter`   | Выбрать пункт под курсором; если курсора нет — закрыть список (форма отправится как обычно)                 |
| `Esc`     | Закрыть список                                                                                              |
| `Tab`     | Закрыть список и перейти дальше                                                                             |

## Доступность

`<input role="combobox">` с `aria-expanded`, `aria-controls`, `aria-autocomplete`, `aria-invalid` и `aria-activedescendant`. Список — `role="listbox"`, пункты — `role="option"` с `aria-selected`. Подпись связана с полем через `htmlFor`, а подсказка `hint` / `error` — через `aria-describedby`. Кнопка раскрытия не попадает в Tab-порядок. Анимации отключаются при `prefers-reduced-motion`.
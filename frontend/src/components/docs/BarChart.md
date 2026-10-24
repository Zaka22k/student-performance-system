# BarChart

Горизонтальная столбчатая диаграмма: подпись, полоса и значение в одной строке. Подходит для сравнения нескольких величин (средняя оценка по группам, распределение оценок).

Цвета полосы и дорожки, скругление и анимация берутся из токенов `index.css`, своих значений в компоненте нет. Компонент не использует клиентских хуков и полностью совместим с серверным рендером (SSR / Next.js Server Components).

## Подключение

```
BarChart.tsx
BarChart.module.css
index.css        // должен быть подключён в приложении: токены и классы типографики
```

```tsx
import BarChart from "./BarChart";
import type { BarChartItem, BarChartProps } from "./BarChart";
```

## Быстрый старт

```tsx
<BarChart "ИТ-21", "ИТ-22", "ИТ-23", // 3.8 4.25 ]} aria-label="Средняя оценка по группам" formatValue="{(v)" items="{[" label: max="{5}" null value: { }, данных нет> v.toFixed(2)}
/>
```

## Свойства

| Свойство             | Тип                         | По умолчанию        | Описание                                                                                                                          |
| -------------------- | --------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `items`              | `readonly BarChartItem[]`   | —                   | Строки диаграммы (`{ label: string; value: number \| null; key?: string \| number }`). Если `key` не задан, ключом служит `label` |
| `max`                | `number`                    | наибольшее значение | Значение, которому соответствует полная полоса. Для оценок передайте `5`                                                          |
| `formatValue`        | `(value: number) => string` | `String`            | Подпись значения справа                                                                                                           |
| `emptyContent`       | `ReactNode`                 | `"Нет данных"`      | Что показать, когда `items` пуст                                                                                                  |
| `aria-label`         | `string`                    | —                   | Доступное имя диаграммы                                                                                                           |
| `className`, `style` |                             |                     | Применяются к корневому элементу                                                                                                  |
| остальные            | атрибуты `<div>`            |                     | `id`, `data-*`, `aria-*` идут на корневой элемент                                                                                 |

`ref` указывает на корневой `<div>`.

## Использование с фильтрами и `useActionState`

При обновлении массива `items` из состояния `useActionState` (например, при фильтрации отчёта по семестру) полосы диаграммы с теми же ключами (`key` или `label`) не пересоздаются в DOM, а плавно анимируют изменение ширины (`width`).

```tsx
const [state, formAction, isPending] = useActionState(loadGroupStatsAction, initialStats);

<form action={formAction}>
  <ComboBox disabled="{isPending}" label="Семестр:" name="semester" options="{semesters}"/>
  <Button appearance="primary" disabled="{isPending}" type="submit">Показать</Button>
</form>

<BarChart aria-label="Средний балл по группам" formatValue="{(v)" items="{state.items}" max="{5}"> v.toFixed(2)}
  style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 200ms ease" }}
/>
```

## Поведение

- `value: null` (или `NaN`) показывается как «—» с пустой полосой.
- Доля заполнения полосы зажимается в диапазоне от `0%` до `100%`.
- Ширина полосы анимируется при смене значений (токены `ControlAnimationDuration`, `ControlAnimationEasing`), при `prefers-reduced-motion: reduce` анимации нет.
- Длинные подписи обрезаются многоточием, полный текст виден во всплывающей подсказке (`title`).
- Колонка подписей `minmax(80px, 200px)`, колонка значений `56px` (с табличными цифрами `tabular-nums`). При ширине меньше `~400px` полоса сжимается, подписи остаются читаемыми.

## Доступность

Контейнер имеет `role="list"`, строки `role="listitem"`, полоса `role="meter"` с `aria-valuemin={0}`, `aria-valuemax`, `aria-valuenow` и `aria-valuetext`. Значение читается скринридером текстом, а не только цветом.

## Ограничения

- Только горизонтальные столбцы, один ряд данных. Группировки, оси и подписи делений нет.
- Отрицательные значения не поддерживаются (полоса считается от нуля).

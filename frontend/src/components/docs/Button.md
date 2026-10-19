# Button

Кнопка на основе `GlassPanel`: стеклянная подложка, внутри нативный `<button>`. Есть два вида (обычная и акцентная) и два варианта содержимого: текст или только иконка.

## Подключение

Файлы лежат рядом с `index.css`:

```
Button.tsx
Button.module.css
GlassPanel/      // подложка кнопки
index.css        // токены и класс типографики BodyTextBlockStyle
```

```tsx
import Button from "./Button";
import type { ButtonProps, ButtonAppearance } from "./Button";
```

Компонент экспортируется по умолчанию.

## Быстрый старт

```tsx
<Button onClick={save}>Сохранить</Button>

<Button appearance="accent" onClick={send}>Отправить</Button>

<Button icon={<PlusIcon />} aria-label="Добавить" onClick={add} />
```

## Свойства

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `appearance` | `"default" \| "accent"` | `"default"` | Вид кнопки |
| `children` | `ReactNode` | — | Текст кнопки. Нельзя использовать вместе с `icon` |
| `icon` | `ReactNode` | — | Иконка. Включает режим «только иконка», требует `aria-label` |
| `aria-label` | `string` | — | **Обязателен**, если задан `icon` |
| `width` | `number \| string` | `"auto"` | Ширина. Число означает пиксели. В режиме иконки игнорируется |
| `height` | `number \| string` | `36` | Высота. В режиме иконки задаёт и ширину, кнопка получается квадратной |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Тип нативной кнопки |
| `className`, `style` | | | Применяются к **внешней обёртке** (`GlassPanel`), а не к `<button>` |
| остальные | атрибуты `<button>` | | `onClick`, `disabled`, `title`, `form`, `aria-*`, `data-*` идут на нативный `<button>` |

`ref` указывает на нативный `<button>`.

Типы не дают собрать неверную комбинацию: текст вместе с иконкой или иконка без `aria-label` не пройдут проверку TypeScript.

## Виды

| Вид | Когда использовать |
| --- | --- |
| `default` | Обычные действия, второстепенные кнопки, кнопки в панелях |
| `accent` | Главное действие на экране или в диалоге (одно на область) |

## Примеры

### 1. Размеры

```tsx
<Button width={160}>Фиксированная ширина</Button>
<Button width="100%">На всю ширину контейнера</Button>
<Button height={44}>Выше обычной</Button>
```

Содержимое выравнивается по центру. Внутренние отступы `5px 12px`.

### 2. Кнопка-иконка

```tsx
<Button icon={<SettingsIcon />} aria-label="Настройки" />
<Button icon={<TrashIcon />} aria-label="Удалить" height={32} />
```

Иконка рисуется размером 20×20, SVG растягивается на весь блок. Цвет берётся из `currentColor`, поэтому у иконок стоит использовать `stroke`/`fill="currentColor"`.

### 3. Отправка формы

```tsx
<form onSubmit={handleSubmit}>
  …
  <Button type="submit" appearance="accent">Сохранить</Button>
  <Button type="reset">Сбросить</Button>
</form>
```

По умолчанию `type="button"`, поэтому кнопка форму **не отправляет**. Для отправки нужен `type="submit"`.

### 4. Отключённая кнопка

```tsx
<Button disabled>Недоступно</Button>
<Button appearance="accent" disabled>Недоступно</Button>
```

### 5. Свой класс и положение

`className` и `style` попадают на обёртку, поэтому отступы и позиционирование задавайте через них:

```tsx
<Button className={styles.toolbarButton} style={{ marginLeft: "auto" }}>
  Далее
</Button>
```

Стили самого `<button>` (цвет, фон, рамку) так изменить нельзя, меняйте через токены или `Button.module.css`.

### 6. Фокус и ссылка

```tsx
const ref = useRef<HTMLButtonElement>(null);

<Button ref={ref}>Поле</Button>
// ref.current?.focus()
```

## Поведение

- **Наведение:** фон переходит на `ControlFillColorSecondary` (обычная) или `AccentFillColorSecondary` (акцентная).
- **Нажатие:** цвет текста и фон переключаются на «нажатые» токены, вся кнопка вместе с подложкой слегка уменьшается до `scale(0.97)`.
- **Отключена:** текст и фон из токенов `Disabled`, курсор `not-allowed`, вся кнопка с подложкой становится полупрозрачной (`opacity: 0.6`). Наведение и нажатие не срабатывают.
- **Переходы** фона, цвета и масштаба идут по `--ControlAnimationDuration` и `--ControlAnimationEasing`.
- Обычная кнопка полупрозрачная (20% заливки), и под ней просвечивает стеклянная подложка. Акцентная заливается сплошным цветом.

## Доступность

- Это нативный `<button>`: работают `Tab`, `Enter`, `Space`, `disabled`, `form`.
- Фокус показывается внутренней обводкой 2px (`--AccentFillColorSelectedTextBackgroundBrush`). Она внутри, потому что обёртка обрезает всё, что выходит за её границы.
- Кнопке-иконке нужен `aria-label`, TypeScript проверяет это сам.
- Для `prefers-reduced-motion: reduce` переходы и сжатие при нажатии отключаются.

## Ограничения

- Нельзя совместить иконку и текст в одной кнопке.
- Нет размеров `small`/`large`, вида «прозрачная», «опасная» и состояния загрузки. Высота и ширина задаются числами.
- Из `style` и `className` ничего не попадает на `<button>`, только на обёртку. Это важно, например, для `:hover`-стилей и селекторов, которые ожидают класс на самой кнопке.
- В режиме иконки `width` игнорируется, кнопка всегда квадрат со стороной `height`.
- Режим иконки включается при любом `icon` кроме `null`/`undefined`. Значение `icon={false}` создаст пустую квадратную кнопку.
- Скругление и стеклянный вид задаёт `GlassPanel`, в `Button.module.css` их нет.

## Токены

| Что | Токены |
| --- | --- |
| Обычная кнопка | `TextFillColorPrimaryBrush`, `TextFillColorSecondaryBrush` (нажата), `TextFillColorDisabledBrush`; `ControlFillColorDefaultBrush`, `ControlFillColorSecondaryBrush`, `ControlFillColorTertiaryBrush`, `ControlFillColorDisabledBrush` |
| Акцентная кнопка | `TextOnAccentFillColorPrimaryBrush`, `TextOnAccentFillColorSecondaryBrush`, `TextOnAccentFillColorDisabledBrush`; `AccentFillColorDefaultBrush`, `AccentFillColorSecondaryBrush`, `AccentFillColorTertiaryBrush`, `AccentFillColorDisabledBrush` |
| Фокус | `AccentFillColorSelectedTextBackgroundBrush` |
| Анимации | `ControlAnimationDuration`, `ControlAnimationEasing` |
| Типографика | класс `BodyTextBlockStyle` из `index.css` |

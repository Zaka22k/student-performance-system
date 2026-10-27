# Button

Кнопка на основе `GlassPanel`: стеклянная подложка, внутри нативный `<button>`. Есть три вида (`normal`, `primary`, `destructive`) и два варианта содержимого: текст или только иконка.

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

Компонент экспортируется по умолчанию и содержит директиву `"use client"` для работы в Next.js App Router.

## Быстрый старт

```tsx
<Button onClick={save}>Сохранить</Button>

<Button appearance="primary" onClick={send}>Отправить</Button>

<Button appearance="destructive" onClick={remove}>Удалить</Button>

<Button icon={<PlusIcon />} aria-label="Добавить" onClick={add} />
```

## Свойства

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `appearance` | `"normal" \| "primary" \| "destructive"` | `"normal"` | Вид кнопки |
| `children` | `ReactNode` | — | Текст кнопки. Нельзя использовать вместе с `icon` |
| `icon` | `ReactNode` | — | Иконка. Включает режим «только иконка», требует `aria-label` |
| `aria-label` | `string` | — | **Обязателен**, если задан `icon` |
| `width` | `number \| string` | `"auto"` | Ширина. Число означает пиксели. В режиме иконки игнорируется |
| `height` | `number \| string` | `36` | Высота. В режиме иконки задаёт и ширину, кнопка получается квадратной |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Тип нативной кнопки |
| `className`, `style` | | | Применяются к **внешней обёртке** (`GlassPanel`), а не к `<button>` |
| остальные | атрибуты `<button>` | | `onClick`, `disabled`, `title`, `form`, `formAction`, `aria-*`, `data-*` идут на нативный `<button>` |

`ref` указывает на нативный `<button>`.

Типы не дают собрать неверную комбинацию: текст вместе с иконкой или иконка без `aria-label` не пройдут проверку TypeScript.

## Виды

| Вид | Когда использовать |
| --- | --- |
| `normal` | Обычные действия, второстепенные кнопки, кнопки в панелях (полупрозрачная стеклянная заливка) |
| `primary` | Главное действие на экране, в форме или в диалоге (сплошная акцентная заливка) |
| `destructive` | Разрушительные действия: удаление, сброс, отмена (полупрозрачная заливка с критическим красным текстом) |

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
<Button icon={<TrashIcon />} appearance="destructive" aria-label="Удалить" height={32} />
```

Иконка рисуется размером 20x20, SVG растягивается на весь блок. Цвет берётся из `currentColor`, поэтому у иконок стоит использовать `stroke`/`fill="currentColor"`.

### 3. Отправка формы и `useActionState` (Next.js / React 19)

```tsx
<form action={formAction}>
  <Button type="submit" appearance="primary" disabled={isPending} width={140}>
    {isPending ? "Сохранение…" : "Сохранить"}
  </Button>
  <Button type="reset" disabled={isPending}>
    Сбросить
  </Button>
</form>
```

По умолчанию `type="button"`, поэтому кнопка форму **не отправляет**. Для отправки нужен `type="submit"`. Если текст кнопки меняется во время `isPending`, рекомендуется задать фиксированную `width`, чтобы `GlassPanel` не пересчитывал карту преломления при смене статуса.

### 4. Отключённая кнопка

```tsx
<Button disabled>Недоступно</Button>
<Button appearance="primary" disabled>Недоступно</Button>
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

- **Наведение:** фон переходит на `ControlFillColorSecondary` (`normal` и `destructive`) или `AccentFillColorSecondary` (`primary`).
- **Нажатие:** цвет текста и фон переключаются на «нажатые» токены, вся кнопка вместе с подложкой слегка уменьшается до `scale(0.97)`.
- **Отключена:** текст и фон из токенов `Disabled`, курсор `not-allowed`, вся кнопка с подложкой становится полупрозрачной (`opacity: 0.6`). Наведение и нажатие не срабатывают, пересчёт карт стекла не запускается.
- **Переходы** фона, цвета и масштаба идут по `--ControlAnimationDuration` и `--ControlAnimationEasing`.
- Кнопки `normal` и `destructive` полупрозрачные (20% заливки), и под ними просвечивает стеклянная подложка. Кнопка `primary` заливается сплошным цветом.

## Доступность

- Это нативный `<button>`: работают `Tab`, `Enter`, `Space`, `disabled`, `form`, `formAction`.
- Фокус показывается внутренней обводкой 2px (`--AccentFillColorSelectedTextBackgroundBrush`). Она внутри, потому что обёртка обрезает всё, что выходит за её границы.
- Кнопке-иконке нужен `aria-label`, TypeScript проверяет это сам.
- Для `prefers-reduced-motion: reduce` переходы и сжатие при нажатии отключаются.

## Ограничения

- Нельзя совместить иконку и текст в одной кнопке.
- Из `style` и `className` ничего не попадает на `<button>`, только на обёртку. Это важно, например, для `:hover`-стилей и селекторов, которые ожидают класс на самой кнопке.
- В режиме иконки `width` игнорируется, кнопка всегда квадрат со стороной `height`.
- Режим иконки включается при любом `icon` кроме `null`/`undefined`. Значение `icon={false}` создаст пустую квадратную кнопку.
- Скругление и стеклянный вид задаёт `GlassPanel`, в `Button.module.css` их нет.

## Токены

| Что | Токены |
| --- | --- |
| Обычная кнопка (`normal`) | `TextFillColorPrimaryBrush`, `TextFillColorSecondaryBrush` (нажата), `TextFillColorDisabledBrush`; `ControlFillColorDefaultBrush`, `ControlFillColorSecondaryBrush`, `ControlFillColorTertiaryBrush`, `ControlFillColorDisabledBrush` |
| Акцентная кнопка (`primary`) | `TextOnAccentFillColorPrimaryBrush`, `TextOnAccentFillColorSecondaryBrush`, `TextOnAccentFillColorDisabledBrush`; `AccentFillColorDefaultBrush`, `AccentFillColorSecondaryBrush`, `AccentFillColorTertiaryBrush`, `AccentFillColorDisabledBrush` |
| Разрушительная кнопка (`destructive`) | `SystemFillColorCriticalBrush`, `TextFillColorDisabledBrush`; фон как у `normal` |
| Фокус | `AccentFillColorSelectedTextBackgroundBrush` |
| Анимации | `ControlAnimationDuration`, `ControlAnimationEasing` |
| Типографика | класс `BodyTextBlockStyle` из `index.css` |
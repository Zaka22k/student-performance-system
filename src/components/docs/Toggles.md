# Toggles: Checkbox и Switch

Два переключателя между парой противоположных состояний (включено и выключено). Построены по рекомендациям [Apple HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles) и на токенах `index.css`.

- **`Checkbox`** — чекбокс: пустой квадрат, галочка или тире (смешанное состояние), подпись справа.
- **`Switch`** — свичер: дорожка и ползунок. Ползунок сделан из `GlassPanel` (жидкое стекло): в покое он непрозрачный, а пока его нажимают и пока он едет, становится почти прозрачным и сквозь него виден фон.

Оба компонента лежат в одном файле `Toggles.tsx` (с директивой `"use client"` для Next.js App Router), используют нативный `<input type="checkbox">` и работают с клавиатурой, формами (`useActionState`) и скринридерами «из коробки».

## Подключение

```
Toggles.tsx
Toggles.module.css
GlassPanel.tsx      // ползунок Switch
liquidGlass.ts      // нужен GlassPanel
index.css           // должен быть подключён в приложении: токены и классы типографики
```

```tsx
import { Checkbox, Switch } from "./Toggles";
```

`Toggles.tsx` импортирует `GlassPanel` из `../GlassPanel`. Стили используют CSS-селектор `:has()` (Chrome 105+, Safari 15.4+, Firefox 121+).

## Быстрый старт

```tsx
<Checkbox defaultChecked label="Запомнить меня"/>

<Switch label="Уведомления" onChange="{(e)"> save(e.target.checked)} />
```

## Что выбрать (по HIG)

| Ситуация                                                     | Что использовать                                                                                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Одна настройка «вкл/выкл»                                    | `Checkbox`: наличие галочки считывается с первого взгляда лучше, чем положение ползунка                                            |
| Настройка, которую нужно выделить, или группа настроек сразу | `Switch`: у него больше визуальный вес                                                                                             |
| Иерархия настроек (главная и подчинённые)                    | `Checkbox` с выравниванием по левому краю и отступами. Смешанное состояние у главной показывает, что подчинённые включены частично |
| Строка в плотном списке или форме                            | `Switch` с `size="mini"`                                                                                                           |
| Уже есть чекбокс                                             | Оставьте чекбокс: заменять его свичером, как правило, не нужно                                                                     |
| Выбор одного из нескольких вариантов, выбор из списка        | Не переключатель: нужны переключатели-радио или выпадающий список                                                                  |

## Свойства

Общие для обоих компонентов:

| Свойство             | Тип                | По умолчанию | Описание                                                                                                            |
| -------------------- | ------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `label`              | `ReactNode`        | —            | Подпись рядом с элементом. Клик по ней тоже переключает                                                             |
| `labelPlacement`     | `"end" \| "start"` | `"end"`      | Подпись после элемента (как в HIG) или перед ним                                                                    |
| `className`, `style` |                    |              | Применяются к **корневому** элементу (`<label>`)                                                                    |
| остальные            | атрибуты `<input>` |              | `checked`, `defaultChecked`, `onChange`, `disabled`, `name`, `value`, `id`, `required`, `aria-*`… идут на `<input>` |

`ref` указывает на `<input>`. Атрибуты `type` и `role` задаются компонентом.

### Только `Checkbox`

| Свойство        | Тип       | По умолчанию | Описание                                              |
| --------------- | --------- | ------------ | ----------------------------------------------------- |
| `indeterminate` | `boolean` | `false`      | Смешанное состояние: вместо галочки показывается тире |

### Только `Switch`

| Свойство | Тип                   | По умолчанию | Описание                                                                                                       |
| -------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `size`   | `"regular" \| "mini"` | `"regular"`  | Размер. `regular` по высоте равен остальным элементам (`32px`), `mini` предназначен для плотных строк (`22px`) |

## Размеры

| Что                     | `Checkbox`                  | `Switch` `regular` | `Switch` `mini`  |
| ----------------------- | --------------------------- | ------------------ | ---------------- |
| Элемент                 | `20 × 20`, скругление `6px` | `56 × 32`          | `45 × 22`        |
| Ползунок                | —                           | `36 × 28` (овал)   | `22 × 18` (овал) |
| Ход ползунка            | —                           | `16px`             | `19px`           |
| Отступ ползунка от края | —                           | `2px`              | `2px`            |
| Зазор до подписи        | `8px`                       | `8px`              | `8px`            |
| Подпись                 | `BodyTextBlockStyle` (14px) | то же              | то же            |

Размеры `Switch` лежат в одном месте, в константе `SWITCH_SIZES` в `Toggles.tsx`: оттуда числа попадают и в CSS (переменные `--switch-*`), и в `GlassPanel`.

## Состояния

### Checkbox

| Состояние                      | Заливка                                                                      | Рамка                        | Значок                                        |
| ------------------------------ | ---------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------- |
| Выключен                       | `ControlFillColorDefaultBrush`                                               | `TextFillColorTertiaryBrush` | нет                                           |
| Наведение                      | `ControlFillColorSecondaryBrush`                                             | та же                        | нет                                           |
| Нажатие                        | `ControlFillColorTertiaryBrush`                                              | та же                        | нет                                           |
| Включён                        | `AccentFillColorDefaultBrush`                                                | цвет заливки                 | галочка (`TextOnAccentFillColorPrimaryBrush`) |
| Смешанный                      | как включён                                                                  | как включён                  | тире                                          |
| Включён, наведение или нажатие | `AccentFillColorSecondaryBrush`, `AccentFillColorTertiaryBrush`              | цвет заливки                 | галочка                                       |
| Отключён                       | `ControlFillColorDisabledBrush` (с галочкой: `AccentFillColorDisabledBrush`) | `TextFillColorDisabledBrush` | `TextOnAccentFillColorDisabledBrush`          |

Галочка и тире не появляются мгновенно, а «дорисовываются» линией. Фокус с клавиатуры показывается контуром `2px` вокруг квадрата.

### Switch

| Состояние           | Дорожка                                                                    | Ползунок                             |
| ------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| Выключен            | заливка `ControlFillColorDefaultBrush`, рамка `TextFillColorTertiaryBrush` | слева                                |
| Включён             | `AccentFillColorDefaultBrush`                                              | справа                               |
| Наведение и нажатие | на шаг светлее или темнее (`Secondary`, `Tertiary`)                        | —                                    |
| Отключён            | `ControlFillColorDisabledBrush` (включён: `AccentFillColorDisabledBrush`)  | заливка `TextFillColorDisabledBrush` |

## Ползунок из GlassPanel

Ползунок — это `GlassPanel` (овал, преломление и блик по краю, небольшая тень). Его заливка меняется:

| Когда                                                           | Заливка ползунка                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| В покое                                                         | непрозрачная, `TextFillColorPrimaryBrush`                                       |
| Пока ползунок **нажимают** (мышь, касание, удержание `Пробела`) | почти прозрачная: `8 %` от `TextFillColorPrimaryBrush`, сквозь стекло виден фон |
| Пока ползунок **едет** после переключения                       | почти прозрачная                                                                |

После окончания движения заливка плавно возвращается к непрозрачной (`ControlAnimationDuration`, `ControlAnimationEasing`).

Что важно знать:

- **Степень прозрачности настраивается** переменной `--SwitchThumbSwitchingOpacity` (по умолчанию `8%`). Задайте её на корне:

  ```tsx
  <Switch "--SwitchThumbSwitchingOpacity": "4%" React.CSSProperties} as label="Режим" style="{{" }/>
  ```

- **Размер ползунка не меняется, он только двигается.** Карты преломления в `GlassPanel` строятся только один раз при монтировании и не пересчитываются при переключении или блокировке `disabled={isPending}`.
- **Не ставьте на родителей `Switch` свойства `opacity`, `filter` и `will-change`:** они ломают `backdrop-filter` стекла, и преломление пропадёт.

## Примеры

### 1. Неуправляемый режим

```tsx
<Checkbox defaultChecked label="Запомнить меня"/>
<Switch defaultChecked label="Уведомления"/>
```

### 2. Управляемый режим

```tsx
const [enabled, setEnabled] = useState(false);

<Switch checked="{enabled}" label="Уведомления" onChange="{(e)"> setEnabled(e.target.checked)}
/>
```

### 3. Смешанное состояние: «выбрать всё»

```tsx
const [items, setItems] = useState({ bold: true, italic: false, underline: false });
const values = Object.values(items);
const all = values.every(Boolean);
const some = values.some(Boolean) && !all;

<Checkbox checked="{all}" indeterminate="{some}" label="Стили текста" onChange="{(e)">
    setItems({
      bold: e.target.checked,
      italic: e.target.checked,
      underline: e.target.checked,
    })
  }
/>
```

### 4. Подпись перед элементом и строка списка

```tsx
<Switch "100%", "space-between" justifyContent: label="Уведомления" labelPlacement="start" style="{{" width: }}/>
```

### 5. Mini-свичер в плотных строках

```tsx
<Switch label="Показывать подсказки" size="mini" />
```

### 6. В форме и с `useActionState` (React 19 / Next.js)

```tsx
const [state, formAction, isPending] = useActionState(saveSettingsAction, null);

<form action={formAction}>
  <Checkbox ?? defaultChecked="{state?.values?.remember" disabled="{isPending}" label="Запомнить меня" name="remember" true}/>
  <Switch ?? defaultChecked="{state?.values?.notifications" disabled="{isPending}" false} label="Уведомления" name="notifications" value="on"/>
  <Button appearance="primary" disabled="{isPending}" type="submit">
    Сохранить
  </Button>
</form>
```

Работает нативная отправка: выключенный переключатель в `FormData` не попадает (`formData.get("notifications") === null`), включённый отправляется со значением `value` (по умолчанию `"on"`). При обновлении `defaultChecked` из ответа Server Action переключатель автоматически синхронизирует своё состояние.

## Клавиатура

| Клавиша             | Действие                                                         |
| ------------------- | ---------------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Перейти к переключателю и от него                                |
| `Пробел`            | Переключить. У `Switch` пока клавиша зажата, ползунок прозрачный |

## Доступность

- Это настоящие `<input type="checkbox">`. У `Switch` дополнительно стоит `role="switch"`.
- Смешанное состояние `Checkbox` передаётся через нативное свойство `indeterminate`.
- Подпись — обёртка `<label>`, поэтому клик по ней переключает элемент.
- Фокус с клавиатуры (`:focus-visible`) показывается контуром `2px` вокруг квадрата или дорожки.
- Анимации отключаются при `prefers-reduced-motion`.

## Токены

| Что                  | Токены                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Заливка и рамка      | `ControlFillColor{Default,Secondary,Tertiary,Disabled}Brush`, `TextFillColorTertiaryBrush`, `TextFillColorDisabledBrush` |
| Включённое состояние | `AccentFillColor{Default,Secondary,Tertiary,Disabled}Brush`                                                              |
| Галочка              | `TextOnAccentFillColorPrimaryBrush`, `TextOnAccentFillColorDisabledBrush`                                                |
| Ползунок             | `TextFillColorPrimaryBrush` (в покое), `TextFillColorDisabledBrush` (отключён)                                           |
| Фокус                | `AccentFillColorSelectedTextBackgroundBrush`                                                                             |
| Скругление дорожки   | `CircularCornerRadius`                                                                                                   |
| Анимация             | `ControlAnimationDuration`, `ControlAnimationEasing`                                                                     |
| Подпись              | класс `BodyTextBlockStyle` из `index.css`, цвет `TextFillColorPrimaryBrush`                                              |

# Toggles: Checkbox и Switch

Два переключателя между парой противоположных состояний (включено и выключено). Построены по рекомендациям [Apple HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles) и на токенах `index.css`.

- **`Checkbox`** — чекбокс: пустой квадрат, галочка или тире (смешанное состояние), подпись справа.
- **`Switch`** — свичер: дорожка и ползунок. Ползунок сделан из `GlassPanel` (жидкое стекло): в покое он непрозрачный, а пока его нажимают и пока он едет, становится почти прозрачным и сквозь него виден фон.

Оба компонента лежат в одном файле `Toggles.tsx`, используют нативный `<input type="checkbox">` и работают с клавиатурой, формами и скринридерами «из коробки».

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

`Toggles.tsx` импортирует `GlassPanel` из `../GlassPanel`, как `ComboBox`. Если у вас другой путь, поправьте его.

Стили используют CSS-селектор `:has()` (Chrome 105+, Safari 15.4+, Firefox 121+).

## Быстрый старт

```tsx
<Checkbox label="Запомнить меня" defaultChecked />

<Switch label="Уведомления" onChange={(e) => save(e.target.checked)} />
```

## Что выбрать (по HIG)

| Ситуация | Что использовать |
| --- | --- |
| Одна настройка «вкл/выкл» | `Checkbox`: наличие галочки считывается с первого взгляда лучше, чем положение ползунка |
| Настройка, которую нужно выделить, или группа настроек сразу | `Switch`: у него больше визуальный вес |
| Иерархия настроек (главная и подчинённые) | `Checkbox` с выравниванием по левому краю и отступами. Смешанное состояние у главной показывает, что подчинённые включены частично |
| Строка в плотном списке или форме | `Switch` с `size="mini"` |
| Уже есть чекбокс | Оставьте чекбокс: заменять его свичером, как правило, не нужно |
| Выбор одного из нескольких вариантов, выбор из списка | Не переключатель: нужны переключатели-радио или выпадающий список |

Дополнительно по HIG:

- Ясно показывайте, на что влияет переключатель. Чаще всего это понятно из окружения, иначе добавьте `label`.
- Состояние не должно читаться только по цвету. Здесь оно дополнительно различается формой: у чекбокса это галочка, тире или пустота, у свичера положение ползунка.
- Размещайте переключатели в теле окна, а не в панели инструментов или строке состояния.
- Радиокнопок в этом файле нет.

## Свойства

Общие для обоих компонентов:

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | Подпись рядом с элементом. Клик по ней тоже переключает |
| `labelPlacement` | `"end" \| "start"` | `"end"` | Подпись после элемента (как в HIG) или перед ним |
| `className`, `style` | | | Применяются к **корневому** элементу (`<label>`) |
| остальные | атрибуты `<input>` | | `checked`, `defaultChecked`, `onChange`, `disabled`, `name`, `value`, `id`, `required`, `aria-*`… идут на `<input>` |

`ref` указывает на `<input>`. Атрибуты `type` и `role` задаются компонентом.

### Только `Checkbox`

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `indeterminate` | `boolean` | `false` | Смешанное состояние: вместо галочки показывается тире |

### Только `Switch`

| Свойство | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `size` | `"regular" \| "mini"` | `"regular"` | Размер. `regular` по высоте равен остальным элементам (32px), `mini` предназначен для плотных строк |

## Размеры

| Что | `Checkbox` | `Switch` `regular` | `Switch` `mini` |
| --- | --- | --- | --- |
| Элемент | `20 × 20`, скругление `6px` | `56 × 32` | `40 × 22` |
| Ползунок | — | `36 × 28` (овал) | `26 × 18` (овал) |
| Ход ползунка | — | `16px` | `10px` |
| Отступ ползунка от края | — | `2px` | `2px` |
| Зазор до подписи | `8px` | `8px` | `8px` |
| Подпись | `BodyTextBlockStyle` (14px) | то же | то же |

Размеры `Switch` лежат в одном месте, в константе `SWITCH_SIZES` в `Toggles.tsx`: оттуда числа попадают и в CSS (переменные `--switch-*`), и в `GlassPanel`.

## Состояния

### Checkbox

| Состояние | Заливка | Рамка | Значок |
| --- | --- | --- | --- |
| Выключен | `ControlFillColorDefaultBrush` | `TextFillColorTertiaryBrush` | нет |
| Наведение | `ControlFillColorSecondaryBrush` | та же | нет |
| Нажатие | `ControlFillColorTertiaryBrush` | та же | нет |
| Включён | `AccentFillColorDefaultBrush` | цвет заливки | галочка (`TextOnAccentFillColorPrimaryBrush`) |
| Смешанный | как включён | как включён | тире |
| Включён, наведение или нажатие | `AccentFillColorSecondaryBrush`, `AccentFillColorTertiaryBrush` | цвет заливки | галочка |
| Отключён | `ControlFillColorDisabledBrush` (с галочкой: `AccentFillColorDisabledBrush`) | `TextFillColorDisabledBrush` | `TextOnAccentFillColorDisabledBrush` |

Галочка и тире не появляются мгновенно, а «дорисовываются» линией. Фокус с клавиатуры показывается контуром `2px` вокруг квадрата. Реакция на наведение и нажатие охватывает всю область, включая подпись.

### Switch

| Состояние | Дорожка | Ползунок |
| --- | --- | --- |
| Выключен | заливка `ControlFillColorDefaultBrush`, рамка `TextFillColorTertiaryBrush` | слева |
| Включён | `AccentFillColorDefaultBrush` | справа |
| Наведение и нажатие | на шаг светлее или темнее (`Secondary`, `Tertiary`) | — |
| Отключён | `ControlFillColorDisabledBrush` (включён: `AccentFillColorDisabledBrush`) | заливка `TextFillColorDisabledBrush` |

## Ползунок из GlassPanel

Ползунок — это `GlassPanel` (овал, преломление и блик по краю, небольшая тень). Его заливка меняется:

| Когда | Заливка ползунка |
| --- | --- |
| В покое | непрозрачная, `TextFillColorPrimaryBrush` (белая) |
| Пока ползунок **нажимают** (мышь, касание, удержание `Пробела`) | почти прозрачная: `8 %` от `TextFillColorPrimaryBrush`, сквозь стекло виден фон |
| Пока ползунок **едет** после переключения | почти прозрачная |

После окончания движения заливка плавно возвращается к непрозрачной (`ControlAnimationDuration`, `ControlAnimationEasing`).

Что важно знать:

- **Степень прозрачности настраивается** переменной `--SwitchThumbSwitchingOpacity` (по умолчанию `8%`). Задайте её на корне:

  ```tsx
  <Switch label="Режим" style={{ "--SwitchThumbSwitchingOpacity": "4%" } as React.CSSProperties} />
  ```

- **Размер ползунка не меняется, он только двигается.** `GlassPanel` строит карты преломления по размеру, поэтому анимация размера пересчитывала бы их на каждом кадре.
- **Не ставьте на родителей `Switch` свойства `opacity`, `filter` и `will-change`:** они ломают `backdrop-filter` стекла, и преломление пропадёт.
- **Преломление работает только в Chromium.** В остальных браузерах `GlassPanel` показывает размытие (`fallbackBlur` ползунка равен `8`), блик по краю остаётся.
- **При `prefers-reduced-motion: reduce`** ползунок не едет плавно, поэтому «прозрачность на время движения» не включается. Прозрачность при нажатии остаётся.
- **Запасной таймер.** Если окончание движения не придёт (например, родитель отклонил смену `checked` и ползунок остался на месте), ползунок снова станет непрозрачным через `500 мс`.

## Примеры

### 1. Неуправляемый режим

```tsx
<Checkbox label="Запомнить меня" defaultChecked />
<Switch label="Уведомления" defaultChecked />
```

### 2. Управляемый режим

```tsx
const [enabled, setEnabled] = useState(false);

<Switch
  label="Уведомления"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

### 3. Смешанное состояние: «выбрать всё»

Главный чекбокс показывает тире, когда подчинённые включены частично. Подчинённые выровнены по левому краю и сдвинуты отступом.

```tsx
const [items, setItems] = useState({ bold: true, italic: false, underline: false });
const values = Object.values(items);
const all = values.every(Boolean);
const some = values.some(Boolean) && !all;

<Checkbox
  label="Стили текста"
  checked={all}
  indeterminate={some}
  onChange={(e) =>
    setItems({
      bold: e.target.checked,
      italic: e.target.checked,
      underline: e.target.checked,
    })
  }
/>

<div style={{ display: "grid", gap: 8, paddingLeft: 28 }}>
  <Checkbox
    label="Жирный"
    checked={items.bold}
    onChange={(e) => setItems({ ...items, bold: e.target.checked })}
  />
  <Checkbox
    label="Курсив"
    checked={items.italic}
    onChange={(e) => setItems({ ...items, italic: e.target.checked })}
  />
  <Checkbox
    label="Подчёркнутый"
    checked={items.underline}
    onChange={(e) => setItems({ ...items, underline: e.target.checked })}
  />
</div>
```

`indeterminate` управляется родителем: после клика браузер сам сбрасывает смешанное состояние, а компонент возвращает его к значению свойства. Поэтому его нужно пересчитывать из данных, как выше.

### 4. Подпись перед элементом и строка списка

```tsx
<Switch label="Уведомления" labelPlacement="start" />
```

Строка, где подпись слева, а свичер прижат к правому краю:

```tsx
<Switch
  label="Уведомления"
  labelPlacement="start"
  style={{ width: "100%", justifyContent: "space-between" }}
/>
```

### 5. Mini-свичер в плотных строках

```tsx
<Switch size="mini" label="Показывать подсказки" />
```

Схема из HIG: главную настройку делайте обычным свичером, а подчинённые строки внутри группы — `mini`.

### 6. Без подписи

Если подписи нет, задайте доступное имя через `aria-label` (или свяжите с внешним текстом через `aria-labelledby`):

```tsx
<Switch aria-label="Включить уведомления" />
<Checkbox aria-label="Выбрать строку" />
```

В редактируемом списке чекбокс допустимо показывать вообще без подписи.

### 7. Отключённое состояние

```tsx
<Checkbox label="Недоступно" disabled />
<Switch label="Недоступно" disabled defaultChecked />
```

### 8. В форме

```tsx
<form onSubmit={handleSubmit}>
  <Checkbox name="remember" label="Запомнить меня" />
  <Switch name="notifications" value="on" label="Уведомления" />
</form>
```

Работает нативная отправка: выключенный переключатель в форму не попадает, включённый отправляется со значением `value` (по умолчанию `"on"`).

### 9. Доступ к полю

```tsx
const ref = useRef<HTMLInputElement>(null);

<Switch ref={ref} label="Уведомления" />
// ref.current — это <input>
```

### 10. Внутри окна

```tsx
openModal({
  title: "Настройки",
  content: (
    <div style={{ display: "grid", gap: 12 }}>
      <Switch label="Уведомления" labelPlacement="start" style={{ width: "100%", justifyContent: "space-between" }} />
      <Checkbox label="Запомнить меня" />
    </div>
  ),
});
```

## Клавиатура

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift+Tab` | Перейти к переключателю и от него |
| `Пробел` | Переключить. У `Switch` пока клавиша зажата, ползунок прозрачный |

`Enter` переключатели не переключает (стандартное поведение чекбокса).

## Доступность

- Это настоящие `<input type="checkbox">`. У `Switch` дополнительно стоит `role="switch"`, поэтому скринридеры читают «включено» и «выключено».
- Смешанное состояние `Checkbox` передаётся через нативное свойство `indeterminate`, скринридеры читают его как «частично».
- Подпись — обёртка `<label>`, поэтому клик по ней переключает элемент, а имя берётся из текста.
- Фокус с клавиатуры (`:focus-visible`) показывается контуром `2px` вокруг квадрата или дорожки (цвет `AccentFillColorSelectedTextBackgroundBrush`).
- Состояние читается не только по цвету: у чекбокса меняется значок, у свичера положение ползунка.
- Анимации отключаются при `prefers-reduced-motion`.

## Ограничения

- **Ползунок нельзя перетащить.** Свичер переключается кликом, касанием и клавишей, жеста перетаскивания пока нет.
- **Нет свойства для цвета.** Включённое состояние использует акцентные токены (`AccentFillColor*`). Меняйте цвет через токены в `index.css`: по HIG менять стандартный цвет нужно, только если это необходимо.
- **Не кладите интерактивные элементы в `label`** (ссылки, кнопки): корень — `<label>`, и клик по ним переключит элемент.
- **Только два размера** у `Switch` и один у `Checkbox`.
- **`indeterminate` не работает «сам по себе».** Это управляемое свойство: без пересчёта в `onChange` тире останется после клика.
- **Зависит от `GlassPanel`:** без него `Switch` не соберётся, а в браузерах без Chromium стекло не преломляет фон.
- **Нужен `:has()`**: в браузерах без его поддержки цвета состояний не применятся.

## Токены

| Что | Токены |
| --- | --- |
| Заливка и рамка | `ControlFillColor{Default,Secondary,Tertiary,Disabled}Brush`, `TextFillColorTertiaryBrush`, `TextFillColorDisabledBrush` |
| Включённое состояние | `AccentFillColor{Default,Secondary,Tertiary,Disabled}Brush` |
| Галочка | `TextOnAccentFillColorPrimaryBrush`, `TextOnAccentFillColorDisabledBrush` |
| Ползунок | `TextFillColorPrimaryBrush` (в покое), `TextFillColorDisabledBrush` (отключён) |
| Фокус | `AccentFillColorSelectedTextBackgroundBrush` |
| Скругление дорожки | `CircularCornerRadius` |
| Анимация | `ControlAnimationDuration`, `ControlAnimationEasing` |
| Подпись | класс `BodyTextBlockStyle` из `index.css`, цвет `TextFillColorPrimaryBrush` |

Скругление квадрата чекбокса (`6px`) и размер (`20px`) заданы локальными переменными `--CheckboxRadius` и `--CheckboxSize` в `Toggles.module.css`: подходящего токена радиуса для такого маленького квадрата в `index.css` нет (`ControlCornerRadius` равен `8px` и сделал бы его слишком круглым).

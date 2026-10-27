# Toolbar

Панель инструментов в стиле Apple Liquid Glass. Используется **только внутри компонента [`Page`](./Page.md)** (передаётся через проп `toolbar` у `Page`). Построена по принципам [Apple HIG: Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars) на базе `GlassPanel`.

## Состав

| Часть            | Назначение                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Toolbar`        | Внутренний контейнер шапки `Page` с тремя зонами: `leading`, `center`, `trailing`. Напрямую в страницах не вызывается — его рендерит сам `Page`. |
| `ToolbarGroup`   | Стеклянная «таблетка» (`GlassPanel`) для объединения двух и более кнопок.                                                                        |
| `ToolbarButton`  | Прозрачная кнопка для использования **внутри** `ToolbarGroup`.                                                                                   |
| `ToolbarDivider` | Тонкий вертикальный разделитель (`1 × 16px`) между кнопками внутри `ToolbarGroup`.                                                               |
| `ToolbarSpacer`  | Пробел между группами: фиксированный (`8px`) или растягивающийся (`flexible`).                                                                   |

## Подключение в странице

Импортируйте `Page`, а для наполнения зон `toolbar` — вспомогательные элементы из `Toolbar`, `Button` и `Fields`:

```tsx
import Page from "@/components/Page";
import Button from "@/components/Button";
import { SearchField } from "@/components/Fields";
import {
  ToolbarGroup,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
} from "@/components/Toolbar";
```

## Использование в `Page`

```tsx
<Page ( // <ToolbarGroup center: showBackButton title="Файлы" toolbar="{{" Центр: более группа двух действий и из на одной стеклянной таблетке частых>
        <ToolbarButton aria-label="Сортировка" icon="{<SortIcon"/>} />
        <ToolbarDivider/>
        <ToolbarButton aria-label="Фильтр" icon="{<FilterIcon"/>} />
        <ToolbarDivider/>
        <ToolbarButton aria-label="Удалить" icon="{<DeleteIcon"/>} />
      </ToolbarGroup>
    ),
    // Правый край: поиск и одиночные кнопки
    trailing: (
      <>
        {/* SearchField уже стеклянный — в ToolbarGroup не оборачиваем */}
        <SearchField placeholder="Поиск файлов…" width="{220}"/>
        {/* Одиночная кнопка — обычный Button, без группы */}
        <Button aria-label="Ещё" icon="{<MoreIcon"/>} />
        {/* Главное действие страницы — последним в trailing */}
        <Button appearance="primary">Готово</Button>
      </>
    ),
  }}
>
  {/* Содержимое страницы */}
</Page>
```

### Главное правило против «стекла в стекле»

- **Одиночная кнопка** в тулбаре — это обычный `<Button>` (он уже построен на `GlassPanel`).
- **Строка поиска** — это `<SearchField>` (она тоже уже построена на `GlassPanel`).
- **Две и более связанные кнопки** оборачиваются в `<ToolbarGroup>`, а внутри ставятся `<ToolbarButton>`, у которых нет собственного стекла (только подсветка при наведении и нажатии). Никогда не кладите `<Button>` или `<SearchField>` внутрь `<ToolbarGroup>`.

## Работа с `useActionState` (React 19 / Next.js)

Как у кнопок `<Button>`, так и у `<ToolbarButton>` по умолчанию стоит `type="button"`. Если кнопка в тулбаре страницы должна отправлять форму или вызывать Server Action:

1. Для привязки к `<form id={formId} action={formAction}>` внутри `Page` передайте кнопке в тулбаре `type="submit"` и `form={formId}` (так как шапка `Page` рендерится через портал в `NavigationView` вне DOM-дерева формы):

```tsx
<Page ( < showBackButton title="Редактирование" toolbar="{{" trailing:>
        <ToolbarGroup>
          <ToolbarButton disabled="{isPending}" form="{formId}" type="reset">
            Сбросить
          </ToolbarButton>
          <ToolbarDivider/>
          <ToolbarButton disabled="{isPending}" form="{formId}" formAction="{saveDraftAction}" type="submit">
            В черновик
          </ToolbarButton>
        </ToolbarGroup>

        <Button appearance="primary" disabled="{isPending}" form="{formId}" type="submit" width="{130}">
          {isPending ? "Сохранение…" : "Сохранить"}
        </Button>
      </>
    ),
  }}
>
  <form id={formId} action={publishAction}>
    {/* Поля формы */}
  </form>
</Page>
```

2. Блокировка `disabled={isPending}` у `ToolbarButton` меняет только прозрачность (`opacity: 0.4`) и отключает клики, не пересчитывая карты преломления у родительской `ToolbarGroup`.

## Свойства компонентов

### Зоны `toolbar` в `Page`

| Зона       | Тип         | Описание                                                                                                            |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `leading`  | `ReactNode` | Встаёт слева перед заголовком страницы (сразу после кнопки «Назад», если включён `showBackButton`).                 |
| `center`   | `ReactNode` | Центральная зона для частых действий. Занимает свободное место и центрирует элементы.                               |
| `trailing` | `ReactNode` | Правый край: поиск, второстепенные действия и главное действие страницы (ставится последним). Всегда прижат вправо. |

### `ToolbarGroup`

| Свойство  | Тип                | По умолчанию | Описание                                                                        |
| --------- | ------------------ | ------------ | ------------------------------------------------------------------------------- |
| `height`  | `number`           | `36`         | Высота группы в px (совпадает с высотой `Button` и `SearchField` по умолчанию). |
| `width`   | `number \| string` | `"auto"`     | Ширина группы.                                                                  |
| остальные | атрибуты `<div>`   |              | Пробрасываются на корневой `GlassPanel` (`role="group"`).                       |

### `ToolbarButton`

| Свойство  | Тип                               | По умолчанию | Описание                                                                                                 |
| --------- | --------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `icon`    | `ReactNode`                       | —            | Иконка кнопки. Если текста (`children`) нет, обязательно укажите `aria-label`.                           |
| `type`    | `"button" \| "submit" \| "reset"` | `"button"`   | Тип нативной кнопки.                                                                                     |
| остальные | атрибуты `<button>`               |              | `onClick`, `disabled`, `form`, `formAction`, `aria-*` идут на `<button>`. `ref` указывает на `<button>`. |

### `ToolbarDivider`

Вертикальная линия `1 × 16px` (`role="separator"`). Ставится между `ToolbarButton` внутри `ToolbarGroup`.

### `ToolbarSpacer`

| Свойство   | Тип       | По умолчанию | Описание                                                                      |
| ---------- | --------- | ------------ | ----------------------------------------------------------------------------- |
| `flexible` | `boolean` | `false`      | `true` — растягивается (`flex: 1 1 0`), `false` — фиксированный пробел `8px`. |

## Правила из HIG

- **Не больше трёх групп** в тулбаре.
- **Группа нужна от двух кнопок.** Одиночное действие ставьте как `<Button>`.
- **Действие с текстом ставьте в отдельную группу или отдельным `<Button>`**, чтобы текст не сливался с соседними иконками.
- **Главное действие одно**, оформляется отдельной кнопкой `<Button appearance="primary">` и стоит последним в `trailing`.
- **Короткий заголовок страницы** (до ~15 символов).

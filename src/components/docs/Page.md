# Page

Каркас страницы приложения: шапка с заголовком, кнопкой «Назад» и панелью инструментов [`Toolbar`](./Toolbar.md), а под ней тело страницы. Если передать `onNavigate`, страница сама покажет загрузку, содержимое или ошибку с кнопкой «Повторить».

Компонент использует `useNavigate` из `react-router-dom`, поэтому должен находиться внутри роутера (`<BrowserRouter>`, `<RouterProvider>` и т. п.).

Весь контент [NavigationView](./NavigationView.md) предполагается оформлять как `Page`. Внутри `NavigationView` шапка страницы выносится в неподвижный верхний слот, а само тело страницы анимируется при переходах (свойством `transition` задаётся свой переход, см. [Переход при появлении](#переход-при-появлении)). Вне `NavigationView` шапка остаётся внутри страницы со свойством `position: sticky`.

## Подключение

```
Page.tsx
Page.module.css
ProgressRing/                       // ProgressRing.tsx и ProgressRing.module.css, см. ProgressRing.md
Button/
Toolbar/
NavigationView/pageTransitions.ts   // тип перехода, контекст рамки и хук usePageTransition
index.css                           // должен быть подключён в приложении: токены и классы типографики
```

```tsx
import Page from "./Page";
import type { PageProps } from "./Page";
```

Компонент экспортируется как `export default`, тип свойств — `PageProps`.

## Быстрый старт

```tsx
<Page title="Города">
  <CityList />
</Page>
```

С загрузкой данных:

```tsx
<Page onNavigate="{async" title="Города"> {
    setCities(await api.getCities());
  }}
>
  <CityList cities="{cities}"/>
</Page>
```

## Свойства

| Свойство         | Тип                                                       | По умолчанию | Описание                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`          | `ReactNode`                                               | —            | Заголовок в шапке (стиль `SubtitleTextBlockStyle`, 20px)                                                                                                                                                                              |
| `children`       | `ReactNode`                                               | —            | Содержимое страницы                                                                                                                                                                                                                   |
| `showBackButton` | `boolean`                                                 | `false`      | Показывать ли кнопку «Назад» слева в шапке                                                                                                                                                                                            |
| `onBack`         | `() => void`                                              | —            | Дополнительный колбэк кнопки «Назад» (см. ниже)                                                                                                                                                                                       |
| `toolbar`        | `Pick<ToolbarProps, "leading" \| "center" \| "trailing">` | —            | Содержимое панели инструментов: слева, по центру, справа                                                                                                                                                                              |
| `onNavigate`     | `() => void \| Promise<void>`                             | —            | Функция, которая выполняется при появлении страницы. Пока она работает, вместо содержимого показывается кольцо загрузки. Необязательная                                                                                               |
| `transition`     | `PageTransitionSetting`                                   | —            | Переход, которым страница появляется внутри `NavigationView`: `"auto"`, `"entrance"`, `"drillIn"`, `"slide"`, `"suppress"` или функция. Без него действует `pageTransition` из `NavigationView`. Вне `NavigationView` не используется |

### Кнопка «Назад»

Кнопка с `aria-label="Назад"` сначала переходит на уровень выше по маршруту (`navigate("..", { relative: "route" })`), затем вызывает `onBack`, если он передан. То есть `onBack` — это дополнительное действие после перехода, а не замена перехода: отменить его через `onBack` нельзя.

Если задан `toolbar.leading`, он показывается сразу после кнопки «Назад».

## `onNavigate`: загрузка и ошибка

`onNavigate` — необязательная функция. Она может быть синхронной или асинхронной.

### Состояния

| Состояние | Когда                                                      | Что показывается в теле страницы                            |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Загрузка  | пока `onNavigate` выполняется                              | только `ProgressRing`, без текста                           |
| Готово    | `onNavigate` завершилась без ошибки или не передана        | `children`                                                  |
| Ошибка    | `onNavigate` бросила ошибку или вернула отклонённый промис | текст «Не удалось загрузить страницу.» и кнопка «Повторить» |

Шапка (заголовок, кнопка «Назад», панель инструментов) остаётся на месте во всех состояниях, поэтому пользователь может вернуться назад, даже если загрузка зависла или упала.

### Что важно знать

- **Функция вызывается один раз при появлении страницы.** Новая ссылка на функцию на следующих рендерах повторный вызов не запускает. Оборачивать её в `useCallback` не нужно.
- **Если страница остаётся смонтированной при смене данных** (например, меняется параметр маршрута `/cities/:id`, а React переиспользует тот же `Page`), задайте `key`, чтобы страница пересоздавалась:

  ```tsx
  <Page key="{id}" onNavigate="{loadCity}" title="Город">
  ```

- **Результат устаревших запусков игнорируется.** Если страница размонтирована до завершения функции, состояние не обновляется.

## Переход при появлении и устройство шапки в `NavigationView`

Внутри `NavigationView` шапка страницы рендерится через портал в неподвижный верхний слот `headerSlot`, а тело страницы лежит в прокручиваемой и анимируемой рамке:

```tsx
<Page showBackButton title="Новая запись" transition="slide">
  <Form />
</Page>
```

- Значения и порядок выбора: `transition` у `Page`, затем `pageTransition` у `NavigationView`, затем `"auto"`. Описание переходов и своих функций в [NavigationView.md](./NavigationView.md#переходы-между-страницами).
- Шапка при смене страницы остаётся неподвижной, а анимируется тело страницы (включая кольцо загрузки `onNavigate`).
- Кнопка «Назад» делает `navigate("..", { relative: "route" })`, то есть переход на страницу выше по пути. Если `NavigationView` получает `pageKey={pathname}`, для него это возврат (`direction: "back"`), и `drillIn` сыграет в обратную сторону.

## Примеры

### 1. Простая страница без загрузки

```tsx
<Page title="Настройки">
  <Settings />
</Page>
```

### 2. Кнопка «Назад» и панель инструментов

```tsx
<Page onBack="{()" showBackButton title="Город"> analytics.track("city_back")}
  toolbar={{
    leading: <Button icon="{<RefreshIcon"/>} aria-label="Обновить" />,
    trailing: <Button appearance="primary">Редактировать</Button>,
  }}
>
  <CityDetails/>
</Page>
```

### 3. Загрузка данных страницы

```tsx
function CityPage() {
  const { id } = useParams();
  const [city, setCity] = useState<City null |>(null);

  return (
    <Page key="{id}" onNavigate="{async" showBackButton title="Город"> {
        setCity(await api.getCity(id!));
      }}
    >
      {city && <CityDetails city="{city}"/>}
    </Page>
  );
}
```

### 4. Страница с формой, `useActionState` и кнопкой сохранения в `toolbar`

Так как внутри `NavigationView` шапка `Page` выносится порталом в `headerSlot`, кнопка в `toolbar.trailing` в DOM находится вне `<form>`. Чтобы кнопка в шапке отправляла форму, свяжите их атрибутом `form={formId}` и укажите `type="submit"`:

```tsx
function NewCityPage() {
  const formId = useId();
  const [state, formAction, isPending] = useActionState(saveCityAction, null);

  return (
    <Page ( <Button appearance="primary" disabled="{isPending}" form="{formId}" showBackButton title="Новый город" toolbar="{{" trailing: type="submit" width="{130}">
            {isPending ? "Сохранение…" : "Сохранить"}
          </Button>
        ),
      }}
    >
      <form id={formId} action={formAction} style={{ display: "grid", gap: 16, maxWidth: 400 }}>
        <TextField defaultValue="{state?.values?.name}" disabled="{isPending}" error="{state?.errors?.name}" label="Название:" name="name" required/>
        <ComboBox defaultValue="{state?.values?.country}" disabled="{isPending}" error="{state?.errors?.country}" label="Страна:" labelKey="name" name="country" options="{countries}" valueKey="id"/>
      </form>
    </Page>
  );
}
```

## Внешний вид и размеры

| Что                         | Значение                                                                                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Страница (`.page`)          | `min-height: 100%`, `position: relative`                                                                                                                                                      |
| Шапка (`.pageHeader`)       | внутри `NavigationView` рендерится порталом в `headerSlot` поверх области прокрутки (вне `NavigationView` — `position: sticky; top: 0`); слой `z-index: 5`, отступы `16px 24px`, зазор `12px` |
| Фон шапки                   | градиент от `--LayerFillColorDefaultBrush` к прозрачному: содержимое плавно уходит под шапку при прокрутке                                                                                    |
| Тело (`.pageBody`)          | отступы `76px 24px 12px` (`64px` под шапку + `12px` отступ до содержимого)                                                                                                                    |
| Состояния загрузки и ошибки | блок по центру, минимальная высота `240px`, зазор `16px`, текст по центру                                                                                                                     |
| Кольцо загрузки             | `ProgressRing`, размер `32`, `aria-label="Загрузка"`                                                                                                                                          |
| Сообщение об ошибке         | `BodyTextBlockStyle`, цвет `--TextFillColorSecondaryBrush`                                                                                                                                    |

## Доступность

- Кнопка «Назад» имеет `aria-label="Назад"`.
- Кольцо загрузки имеет `role="progressbar"` и `aria-label="Загрузка"`.
- Блок ошибки имеет `role="alert"`, поэтому сообщение озвучивается сразу при появлении.
- Шапка остаётся доступной в любом состоянии.

## Токены

| Что                 | Токены                                                                |
| ------------------- | --------------------------------------------------------------------- |
| Фон шапки           | `LayerFillColorDefaultBrush`                                          |
| Сообщение об ошибке | `TextFillColorSecondaryBrush`                                         |
| Типографика         | классы `SubtitleTextBlockStyle` и `BodyTextBlockStyle` из `index.css` |
| Кольцо загрузки     | токены `ProgressRing`, см. [ProgressRing.md](./ProgressRing.md)       |

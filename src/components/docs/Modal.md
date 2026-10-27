# Modal

Модальное окно поверх страницы: затемнённый фон с размытием, окно по центру (на мобильных экранах до `768px` — на весь экран), заголовок с кнопкой закрытия, прокручиваемое тело и необязательная кнопка действия внизу. Окно рендерится через портал в `document.body`.

Есть два способа использовать его:

* **`<Modal>`** — компонент, которым вы управляете сами через `isOpen` и `onClose`.
* **`ModalProvider` + `useModal()`** — окно открывается вызовом `openModal({...})` из любого места приложения, без состояния `isOpen` в каждом компоненте.

## Подключение

```
Modal.tsx
Modal.module.css
ModalContext.tsx    // ModalProvider и useModal
Button/Button.tsx   // кнопки в заголовке и футере
index.css           // должен быть подключён в приложении: токены и классы типографики
```

```tsx
import Modal from "./Modal";
import { ModalProvider, useModal } from "./ModalContext";
```

Оба файла (`Modal.tsx` и `ModalContext.tsx`) содержат директиву `"use client"` для работы в Next.js App Router. `ModalProvider` можно оборачивать вокруг серверных компонентов в `app/layout.tsx`.

## Быстрый старт

### Через провайдер

Оберните приложение в `ModalProvider` один раз:

```tsx
<ModalProvider>
  <App />
</ModalProvider>
```

И открывайте окна откуда угодно:

```tsx
function DeleteButton({ id }: { id: string }) {
  const { openModal } = useModal();

  return (
    <Button
      appearance="destructive"
      onClick={() =>
        openModal({
          title: "Удалить город?",
          content: "Это действие нельзя отменить.",
          actionText: "Удалить",
          actionAppearance: "destructive",
          onAction: async () => {
            await api.deleteCity(id);
          },
        })
      }
    >
      Удалить
    </Button>
  );
}
```

### Напрямую

```tsx
const [open, setOpen] = useState(false);

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Удалить город?"
  actionText="Удалить"
  actionAppearance="destructive"
  onAction={() => api.deleteCity(id)}
>
  Это действие нельзя отменить.
</Modal>
```

## Свойства `Modal`

| Свойство | Тип | По умолчанию | Описание |
| ----- | ----- | ----- | ----- |
| `isOpen` | `boolean` | — | Открыто ли окно. Закрытие проигрывает анимацию, после неё окно убирается из DOM |
| `onClose` | `() => void` | — | Вызывается, когда окно просит закрыться: кнопка закрытия, `Esc`, клик по фону, успешное действие |
| `title` | `ReactNode` | — | Заголовок (одна строка, длинный обрезается многоточием) |
| `children` | `ReactNode \| (props: ModalFormRenderProps) => ReactNode` | — | Содержимое: обычный JSX или функция для форм |
| `actionText` | `string` | `"Подтвердить"` | Текст кнопки действия |
| `actionAppearance` | `ButtonAppearance` | `"primary"` | Вид кнопки действия (`"normal" \| "primary" \| "destructive"`) |
| `onAction` | `() => void \| Promise<void>` | — | Обработчик кнопки действия |
| `isSubmitting` | `boolean` | `false` | Внешний флаг выполнения действия (например, `isPending` из `useActionState`) |
| `error` | `ReactNode` | — | Внешнее сообщение об ошибке для отображения в футере (например, `state?.error` из `useActionState`) |
| `onError` | `(error: unknown) => void` | — | Вызывается, если `onAction` / `registerAction` бросил исключение |
| `errorMessage` | `ReactNode \| (error: unknown) => ReactNode` | `"Не удалось выполнить действие. Попробуйте ещё раз."` | Сообщение об ошибке в футере при перехвате исключения в `onAction` / `registerAction` |
| `width` | `number \| string` | `480` | Ширина окна. На мобильных экранах игнорируется (всегда `100%`) |
| `closeOnBackdropClick` | `boolean` | `true` | Закрывать ли окно кликом по затемнённому фону |

### `ModalFormRenderProps`

Эти значения получает `children`, если это функция:

| Поле | Тип | Описание |
| ----- | ----- | ----- |
| `formId` | `string` | Уникальный id (`useId`). Повесьте его на `<form id={formId}>`: тогда кнопка в футере, `Enter` в полях этой формы и её отправка запускают одно и то же действие с предварительной браузерной валидацией |
| `isSubmitting` | `boolean` | `true`, пока выполняется действие. Используйте, чтобы блокировать поля |
| `registerAction` | `(fn: () => void \| Promise<void>) => void` | Регистрирует обработчик кнопки действия со свежим состоянием формы |

## Примеры с формами и `useActionState` (Next.js / React 19)

### Вариант 1. Декларативный `<Modal>` с `<form action={formAction}>`

Если у формы с `id={formId}` задан `action={formAction}` из `useActionState` (и не передан `onAction` / `registerAction`), модальное окно не отменяет отправку формы, позволяя React 19 выполнить Server Action:

```tsx
function CreateCityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const res = await createCityAction(formData);
      if (res.ok) {
        onClose();
        return null;
      }
      return res;
    },
    null,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Новый город"
      actionText="Сохранить"
      isSubmitting={isPending}
      error={state?.formError}
      closeOnBackdropClick={false}
    >
      {({ formId, isSubmitting }) => (
        <form id={formId} action={formAction}>
          <TextField
            label="Название:"
            name="name"
            required
            defaultValue={state?.values?.name}
            error={state?.fieldErrors?.name}
            disabled={isSubmitting}
          />
          <ComboBox
            label="Страна:"
            name="country"
            options={countries}
            valueKey="id"
            labelKey="name"
            defaultValue={state?.values?.country ?? "bg"}
            error={state?.fieldErrors?.country}
            disabled={isSubmitting}
          />
        </form>
      )}
    </Modal>
  );
}
```

### Вариант 2. Через `openModal` и `registerAction`

При открытии через `openModal` вы можете вызывать Server Action внутри `registerAction` — если Server Action вернёт ошибку, достаточно бросить `throw new Error(res.error)`, чтобы окно осталось открытым и показало ошибку в футере:

```tsx
function CityForm({
  formId,
  isSubmitting,
  registerAction,
}: ModalFormRenderProps) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("bg");

  useEffect(() => {
    registerAction(async () => {
      const result = await createCityServerAction({ name, country });
      if (result?.error) {
        throw new Error(result.error);
      }
    });
  }, [registerAction, name, country]);

  return (
    <form id={formId}>
      <TextField
        label="Название:"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
        required
      />
      <ComboBox
        label="Страна:"
        options={countries}
        valueKey="id"
        labelKey="name"
        value={country}
        onChange={(value) => setCountry(value)}
        disabled={isSubmitting}
      />
    </form>
  );
}

openModal({
  title: "Новый город",
  actionText: "Сохранить",
  errorMessage: (err) => (err instanceof Error ? err.message : "Ошибка сохранения"),
  content: (formProps) => <CityForm {...formProps} />,
});
```

## Поведение и доступность

* Окно рендерится только в браузере (защищено проверкой `typeof document !== "undefined"` для SSR).
* Пока окно в DOM, прокрутка страницы блокируется (`body { overflow: hidden }`).
* При открытии фокус переходит в окно, `Tab` и `Shift+Tab` ходят по кругу внутри окна. При закрытии фокус возвращается на прежний элемент.
* `Esc` закрывает окно, если оно открыто и не идёт сохранение. Если `Esc` уже обработал вложенный элемент (например, закрыл открытый список `ComboBox`), само окно остаётся открытым.
* При включённом `prefers-reduced-motion: reduce` длительность анимации сокращается до минимума без отключения события `animationend`, чтобы окно гарантированно размонтировалось после закрытия.
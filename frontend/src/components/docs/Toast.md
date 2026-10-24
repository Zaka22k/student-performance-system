# Toast: инструкция

Уведомления на основе `GlassPanel` и токенов из `index.css`. Состоит из трёх файлов в одной папке:

| Файл | Что внутри |
|---|---|
| `Toast.tsx` | `ToastProvider`, хук `useToast`, типы, рендер тостов (`"use client"`) |
| `Toast.module.css` | Стили, анимации, позиции. Только токены из `index.css` |
| `index.ts` | Общий экспорт |

Нужен React 18 или новее и Next.js App Router (подходит и Pages Router). Папка `toast` должна лежать рядом с папкой `glass-panel`: компонент импортирует `../glass-panel`. Если структура другая, поправьте этот импорт в `Toast.tsx`.

```tsx
import { ToastProvider, useToast } from '@/components/toast';
```

## 1. Подключение

Оберните приложение в `ToastProvider` один раз. В `app/layout.tsx` (Server Component) это делается так:

```tsx
import { ToastProvider } from '@/components/toast';
import './index.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ToastProvider position="top-right" duration={5000} limit={5}>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

`index.css` с токенами должен быть подключён глобально. Без него фон, цвета и анимации не определятся.

Тосты рисуются через портал в `document.body`. На сервере и при первой отрисовке они не выводятся, ошибок гидратации нет.

## 2. Вызов из любого места

`useToast` работает только в Client Components внутри провайдера. Вне провайдера он бросает ошибку.

```tsx
'use client';
import { useToast } from '@/components/toast';

export function SaveButton() {
  const toast = useToast();

  return (
    <button onClick={() => toast.success('Сохранено')}>
      Сохранить
    </button>
  );
}
```

### Методы

| Метод | Что делает |
|---|---|
| `show(input)` | Показывает тост. `input` строка (станет заголовком) или объект `ToastOptions`. Возвращает `id` |
| `info(title, options?)` | Вариант `info` |
| `success(title, options?)` | Вариант `success` |
| `warning(title, options?)` | Вариант `warning` |
| `error(title, options?)` | Вариант `error` |
| `dismiss(id?)` | Закрывает тост по `id`, без аргумента закрывает все |
| `position` | Текущая позиция по умолчанию (только чтение) |
| `setPosition(position)` | Меняет позицию по умолчанию на лету |

`options` у коротких методов это `ToastOptions` без `title` и `variant`.

```tsx
toast.show('Просто текст');

toast.error('Ошибка сети', {
  description: 'Повторите попытку позже',
  duration: 0, // не закрывать автоматически
});

const id = toast.info('Загрузка…', { duration: 0 });
// позже
toast.dismiss(id);
```

## 3. Позиция

Доступны три места:

| Значение | Где |
|---|---|
| `'top-center'` | вверху по центру |
| `'top-right'` | вверху справа |
| `'bottom-right'` | внизу справа |

Выбрать место можно тремя способами:

```tsx
{/* 1. Для всех тостов: пропс провайдера (по умолчанию 'top-right') */}
<ToastProvider position="bottom-right">…</ToastProvider>

{/* 2. Для одного тоста */}
toast.success('Готово', { position: 'top-center' });

{/* 3. На лету, для всех тостов без своего position */}
toast.setPosition('top-center');
```

Если сменился пропс `position` у провайдера, значение подхватывается снова. `setPosition` переносит и уже показанные тосты, у которых нет собственного `position`.

Новые тосты всегда появляются ближе к краю экрана: вверху над старыми, внизу под ними.

## 4. Параметры тоста (`ToastOptions`)

| Параметр | По умолчанию | Что делает |
|---|---|---|
| `id` | генерируется | Свой идентификатор. Показ с существующим `id` заменяет этот тост и перезапускает таймер |
| `title` | не задан | Заголовок (полужирный) |
| `description` | не задан | Пояснение под заголовком |
| `variant` | `'default'` | `'default'` (без значка), `'info'`, `'success'`, `'warning'`, `'error'` |
| `duration` | из провайдера | Время показа, мс. `0` оставляет тост, пока его не закроют |
| `position` | из провайдера | Позиция этого тоста |
| `dismissible` | `true` | Показывать кнопку закрытия |
| `action` | не задан | Кнопка действия: `{ label, onClick }`. После клика тост закрывается |
| `onClose` | не задан | Вызывается, когда тост начинает закрываться (по таймеру, крестку, `dismiss` или лимиту) |

`title` и `description` принимают любой `ReactNode`.

```tsx
toast.show({
  variant: 'warning',
  title: 'Файл удалён',
  description: 'Его можно вернуть в течение минуты',
  action: { label: 'Отменить', onClick: undo },
  onClose: () => console.log('закрыт'),
});
```

## 5. Параметры провайдера (`ToastProvider`)

| Параметр | По умолчанию | Что делает |
|---|---|---|
| `position` | `'top-right'` | Позиция по умолчанию |
| `duration` | `5000` | Время показа по умолчанию, мс |
| `limit` | `5` | Максимум видимых тостов на каждую позицию. Лишние старые закрываются автоматически |

## 6. Поведение

- **Пауза таймера.** При наведении мыши и при фокусе внутри тоста таймер ставится на паузу, оставшееся время запоминается и продолжается после ухода.
- **Закрытие.** Тост закрывается по таймеру, крестиком, кнопкой действия, через `dismiss` или по лимиту. Перед удалением проигрывается анимация выхода.
- **Доступность.** Каждая группа тостов это область `role="region"` с подписью «Уведомления». Обычный тост имеет `role="status"`, ошибка (`variant: 'error'`) имеет `role="alert"`. У кнопки закрытия подпись «Закрыть». При `prefers-reduced-motion: reduce` анимации отключаются.
- **Мобильные экраны.** Ширина тоста `min(380px, 100vw - 32px)`, отступы учитывают `safe-area-inset`.

## 7. Внешний вид

Корень тоста это `GlassPanel` (радиус 18, `bezel` 16, `glassHeight` 24, `edgeShadowWidth` 10). Остальные параметры стекла берутся из `GLASS_DEFAULTS`.

Фон задан в `Toast.module.css`, класс `.toast`:

```css
background: var(--ControlOnImageFillColorDefaultBrush);
```

| Элемент | Токены |
|---|---|
| Текст | `--TextFillColorPrimaryBrush`, `--TextFillColorSecondaryBrush`, размеры из `.BodyTextBlockStyle` |
| Значки вариантов | `--SystemFillColor{Success,Caution,Critical}Brush` и `…BackgroundBrush`, для `info` акцентные токены |
| Кнопки | `--ControlFillColor*Brush`, `--ControlElevationBorderBrush`, `--ControlCornerRadius` |
| Анимация | `--ControlAnimationDuration`, `--ControlAnimationEasing` |
| Слой | `--ZIndexPopup` (выше модальных окон) |

**Фон непрозрачный.** `--ControlOnImageFillColorDefaultBrush` это `rgb(252, 252, 252)` в светлой теме и `rgb(30, 30, 30)` в тёмной, поэтому преломление фона под панелью не видно. Видны блик, контур и тени по краям. Чтобы стекло просвечивало, замените фон на полупрозрачный:

```css
background: color-mix(in srgb, var(--ControlOnImageFillColorDefaultBrush) 70%, transparent);
```

Как и у `GlassPanel`, преломление работает только в Chromium (кроме iOS), в остальных браузерах включается обычное размытие.

## 8. Что лучше не делать

- **Не вешайте `opacity`, `filter` или `mask` на предков тоста.** Тосты лежат в `document.body` и уже вне ваших контейнеров, но не оборачивайте им сам `body`. Анимации появления и ухода сделаны на самой панели именно поэтому.
- **Не меняйте `EXIT_DURATION` отдельно от токена.** Константа в `Toast.tsx` (200 мс) должна совпадать с `--ControlAnimationDuration`, иначе тост удалится раньше или позже окончания анимации.
- **Не вызывайте `show` в теле рендера.** Вызывайте в обработчиках событий и эффектах, иначе тосты будут создаваться на каждый рендер.
- **Не ждите плавного сдвига соседей.** Когда тост исчезает, остальные переставляются сразу, без анимации.

## 9. Частые вопросы

**`useToast must be used within <ToastProvider>`.** Компонент находится вне провайдера. Проверьте, что `ToastProvider` лежит в `layout.tsx` выше нужного компонента.

**Хук нельзя вызвать в Server Component.** Добавьте `'use client'` в файл компонента, который вызывает `useToast`.

**Тост не исчезает.** Проверьте `duration`: значение `0` отключает автозакрытие.

**Нужен тост из кода вне React** (например, из обработчика запросов). Передайте функции `toast` из хука туда, где они вызываются. Глобального экземпляра вне провайдера нет.

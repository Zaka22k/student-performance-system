import { forwardRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { GlassPanel } from "../GlassPanel";
import styles from "./Toolbar.module.css";

/** Высота группы по умолчанию, px. */
export const TOOLBAR_GROUP_HEIGHT = 36;

export interface ToolbarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title" | "children"
> {
  /**
   * Leading edge: возврат назад, показ/скрытие сайдбара. Стоит перед заголовком, не кастомизируется.
   * Края слева: возврат, сайдбар. Затем идёт заголовок.
   */
  leading?: ReactNode;
  /** Заголовок текущего представления. Короткий, до ~15 символов. Не называйте им приложение. */
  title?: ReactNode;
  /** Center area: частые полезные действия. */
  center?: ReactNode;
  /**
   * Trailing edge: важные действия, инспекторы, поиск, меню «Ещё», главное действие (Готово).
   * Главное действие ставьте последним.
   */
  trailing?: ReactNode;
}

/**
 * Панель инструментов по Apple HIG (Liquid Glass): три зоны — leading, center, trailing.
 * Содержимое каждой зоны собирается из <ToolbarGroup>, между ними можно ставить <ToolbarSpacer>.
 * Сама панель фона не имеет: стекло есть только у групп, а подложку (scroll edge effect)
 * даёт контейнер, в котором она лежит (в Page это шапка с градиентом).
 */
export const Toolbar = ({
  leading,
  title,
  center,
  trailing,
  className,
  ...rest
}: ToolbarProps) => (
  <header
    role="toolbar"
    className={[styles.toolbar, className].filter(Boolean).join(" ")}
    {...rest}
  >
    {(leading || title) && (
      <div className={styles.leading}>
        {leading}
        {title && <div className={styles.title}>{title}</div>}
      </div>
    )}
    {center && <div className={styles.center}>{center}</div>}
    {trailing && <div className={styles.trailing}>{trailing}</div>}
  </header>
);

export interface ToolbarGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  children?: ReactNode;
  /** Высота группы в px. По умолчанию 36. */
  height?: number;
  /** Ширина группы. По умолчанию по содержимому. */
  width?: number | string;
}

/**
 * Группа элементов на одной стеклянной «таблетке».
 * Группируйте по функции и частоте использования, всего групп не больше трёх.
 * Действие с текстовой подписью выносите в отдельную группу, чтобы оно не слилось с соседней иконкой.
 */
export const ToolbarGroup = ({
  children,
  height = TOOLBAR_GROUP_HEIGHT,
  width = "auto",
  className,
  ...rest
}: ToolbarGroupProps) => (
  <GlassPanel
    role="group"
    width={width}
    height={height}
    className={[styles.group, className].filter(Boolean).join(" ")}
    {...rest}
  >
    {children}
  </GlassPanel>
);

export interface ToolbarSpacerProps {
  /** true — растягивается и раздвигает соседей, false — фиксированный отступ. */
  flexible?: boolean;
}

/** Пробел между группами. */
export const ToolbarSpacer = ({ flexible = false }: ToolbarSpacerProps) => (
  <span
    aria-hidden="true"
    className={flexible ? styles.flexibleSpacer : styles.fixedSpacer}
  />
);

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Иконка. Для кнопки только с иконкой обязательно задайте aria-label. */
  icon?: ReactNode;
}

/**
 * Прозрачная кнопка для использования ВНУТРИ <ToolbarGroup>. Своего стекла у неё нет,
 * поэтому стекло не накладывается на стекло группы: видны только hover и нажатие.
 * Одиночную кнопку вне группы делайте обычным GlassButton.
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    { icon, children, className, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={[styles.button, className].filter(Boolean).join(" ")}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  },
);

/** Тонкий разделитель между кнопками внутри <ToolbarGroup>. */
export const ToolbarDivider = () => (
  <span role="separator" aria-orientation="vertical" className={styles.divider} />
);

export default Toolbar;

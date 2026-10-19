import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { GlassPanel } from "../GlassPanel";
import Button from "../Button";
import styles from "./NavigationView.module.css";

/* ------------------------------------------------------------------ */
/* Вспомогательные функции и хуки                                      */
/* ------------------------------------------------------------------ */

interface NavContextValue {
  selectedValue?: string | number;
  select: (
    event: React.SyntheticEvent,
    value: string | number,
    options?: { selects?: boolean },
  ) => void;
  openCategories: Array<string | number>;
  toggleCategory: (value: string | number) => void;
  isPaneOpen: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
}

const NavContext = createContext<NavContextValue | null>(null);

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

function useControllable<T>(
  controlledValue: T | undefined,
  defaultValue: T,
): [T, (val: T) => void, boolean] {
  const [inner, setInner] = useState<T>(defaultValue);
  const isControlled = controlledValue !== undefined;
  return [isControlled ? controlledValue : inner, setInner, isControlled];
}

function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error(
      "NavItem / NavCategory / NavSubItem нужно использовать внутри <NavigationView>",
    );
  }
  return ctx;
}

/**
 * Отслеживает только пересечение порога ширины, не вызывая ререндер на каждый пиксель.
 */
function useIsWide(
  ref: React.RefObject<HTMLElement | null>,
  threshold: number,
  enabled: boolean,
): boolean | null {
  const [isWide, setIsWide] = useState<boolean | null>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled || threshold <= 0) return undefined;
    const update = () => setIsWide(el.offsetWidth >= threshold);
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, enabled]);
  return isWide;
}

const FOCUSABLE_ITEM =
  '[data-nv-item]:not(:disabled):not([aria-disabled="true"])';

/**
 * Общая клавиатурная навигация стрелками и Home/End для боковой панели и всплывающего меню.
 */
function moveFocusInContainer(
  container: HTMLElement | null,
  key: string,
  excludeCollapsed = false,
): boolean {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(key) || !container) {
    return false;
  }
  const items = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_ITEM),
  ).filter(
    (el) => !excludeCollapsed || !el.closest('[data-nv-collapsed="true"]'),
  );
  if (items.length === 0) return false;

  const current = items.indexOf(document.activeElement as HTMLElement);
  let next: number;
  if (key === "Home") next = 0;
  else if (key === "End") next = items.length - 1;
  else if (key === "ArrowDown")
    next = current < 0 ? 0 : (current + 1) % items.length;
  else
    next =
      current < 0
        ? items.length - 1
        : (current - 1 + items.length) % items.length;

  items[next].focus();
  return true;
}

/* ------------------------------------------------------------------ */
/* Настройки всплывающего стекла (фон задаётся в CSS .flyout)          */
/* ------------------------------------------------------------------ */

const MENU_GLASS = {
  radius: 36,
} as const;

/* ------------------------------------------------------------------ */
/* Иконки                                                              */
/* ------------------------------------------------------------------ */

function SidebarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2.25"
        y="3.75"
        width="15.5"
        height="12.5"
        rx="3.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.6 4.2v11.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4.2 2.4 7.8 6l-3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Смена страницы                                                      */
/* ------------------------------------------------------------------ */

interface PageTransitionProps {
  pageKey?: string | number;
  scrollRef: React.RefObject<HTMLElement | null>;
  children?: ReactNode;
}

function PageTransition({ pageKey, scrollRef, children }: PageTransitionProps) {
  const [displayed, setDisplayed] = useState({
    key: pageKey,
    node: children,
    entering: false,
  });

  const leaving = pageKey !== displayed.key;

  // Обновляем контент синхронно, если ключ страницы не менялся
  useIsoLayoutEffect(() => {
    if (!leaving && displayed.node !== children) {
      setDisplayed((prev) => ({ ...prev, node: children }));
    }
  }, [leaving, children, displayed.node]);

  // Сбрасываем прокрутку при смене отображаемого ключа
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [displayed.key, scrollRef]);

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (leaving) {
      setDisplayed({ key: pageKey, node: children, entering: true });
    } else if (displayed.entering) {
      setDisplayed((prev) => ({ ...prev, entering: false }));
    }
  };

  return (
    <div
      key={displayed.key}
      className={cx(
        styles.page,
        leaving && styles.pageExit,
        !leaving && displayed.entering && styles.pageEnter,
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      {leaving ? displayed.node : children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NavigationView                                                      */
/* ------------------------------------------------------------------ */

export interface NavigationViewProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  children?: ReactNode;
  pageKey?: string | number;
  menuItems?: ReactNode;
  footerMenuItems?: ReactNode;
  paneTitle?: ReactNode;
  paneHeader?: ReactNode | ((props: { isPaneOpen: boolean }) => ReactNode);
  paneCustomContent?:
    | ReactNode
    | ((props: { isPaneOpen: boolean }) => ReactNode);
  paneFooter?: ReactNode | ((props: { isPaneOpen: boolean }) => ReactNode);
  paneDisplayMode?: "auto" | "left" | "leftCompact";
  expandedModeThresholdWidth?: number;
  isPaneOpen?: boolean;
  onPaneOpenChange?: (isOpen: boolean) => void;
  isPaneToggleButtonVisible?: boolean;
  selectedValue?: string | number;
  defaultSelectedValue?: string | number;
  onNavItemSelect?: (
    event: React.SyntheticEvent,
    info: { value: string | number },
  ) => void;
  onSelectionChanged?: (
    event: React.SyntheticEvent,
    info: { value: string | number },
  ) => void;
  openCategories?: Array<string | number>;
  defaultOpenCategories?: Array<string | number>;
  onOpenCategoriesChange?: (categories: Array<string | number>) => void;
  paneAriaLabel?: string;
  toggleButtonLabel?: string;
}

export function NavigationView({
  children,
  pageKey,
  menuItems,
  footerMenuItems,
  paneTitle,
  paneHeader,
  paneCustomContent,
  paneFooter,
  paneDisplayMode = "auto",
  expandedModeThresholdWidth = 900,
  isPaneOpen,
  onPaneOpenChange,
  isPaneToggleButtonVisible = true,
  selectedValue,
  defaultSelectedValue,
  onNavItemSelect,
  onSelectionChanged,
  openCategories,
  defaultOpenCategories = [],
  onOpenCategoriesChange,
  paneAriaLabel = "Основная навигация",
  toggleButtonLabel = "Показать или скрыть боковую панель",
  className,
  style,
  ...rest
}: NavigationViewProps) {
  const paneId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLElement>(null);

  const [open, setOpenState, openControlled] = useControllable<boolean>(
    isPaneOpen,
    paneDisplayMode !== "leftCompact",
  );
  const [selected, setSelected, selectedControlled] = useControllable(
    selectedValue,
    defaultSelectedValue,
  );
  const [openCats, setOpenCats, openCatsControlled] = useControllable(
    openCategories,
    defaultOpenCategories,
  );

  const setPaneOpen = useCallback(
    (next: boolean) => {
      if (!openControlled) setOpenState(next);
      onPaneOpenChange?.(next);
    },
    [openControlled, setOpenState, onPaneOpenChange],
  );

  const adaptive = paneDisplayMode === "auto" && expandedModeThresholdWidth > 0;
  const isWide = useIsWide(rootRef, expandedModeThresholdWidth, adaptive);
  const initializedRef = useRef(false);

  useIsoLayoutEffect(() => {
    if (!adaptive || isWide === null) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (!isWide && !openControlled) setOpenState(false);
    } else {
      setPaneOpen(isWide);
    }
  }, [adaptive, isWide, openControlled, setOpenState, setPaneOpen]);

  const select = useCallback(
    (
      event: React.SyntheticEvent,
      value: string | number,
      { selects = true } = {},
    ) => {
      onNavItemSelect?.(event, { value });
      if (selects && value !== selected) {
        if (!selectedControlled) setSelected(value);
        onSelectionChanged?.(event, { value });
      }
    },
    [
      onNavItemSelect,
      onSelectionChanged,
      selected,
      selectedControlled,
      setSelected,
    ],
  );

  const toggleCategory = useCallback(
    (value: string | number) => {
      const next = openCats.includes(value)
        ? openCats.filter((v) => v !== value)
        : [...openCats, value];
      if (!openCatsControlled) setOpenCats(next);
      onOpenCategoriesChange?.(next);
    },
    [openCats, openCatsControlled, setOpenCats, onOpenCategoriesChange],
  );

  const ctx = useMemo<NavContextValue>(
    () => ({
      selectedValue: selected,
      select,
      openCategories: openCats,
      toggleCategory,
      isPaneOpen: open,
      rootRef,
    }),
    [selected, select, openCats, toggleCategory, open],
  );

  const handlePaneKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented) return;
    if (
      (event.target as HTMLElement).closest(
        'input, textarea, select, [contenteditable="true"]',
      )
    ) {
      return;
    }
    if (moveFocusInContainer(paneRef.current, event.key, true)) {
      event.preventDefault();
    }
  };

  const renderSlot = (
    node: ReactNode | ((props: { isPaneOpen: boolean }) => ReactNode),
  ) => (typeof node === "function" ? node({ isPaneOpen: open }) : node);

  const showToggleButton =
    isPaneToggleButtonVisible && paneDisplayMode !== "left";

  return (
    <NavContext.Provider value={ctx}>
      <div
        {...rest}
        ref={rootRef}
        className={cx(
          styles.root,
          open ? styles.paneOpen : styles.strip,
          className,
        )}
        style={style}
        data-pane-open={open}
      >
        {/* Боковая панель */}
        <nav
          ref={paneRef}
          id={paneId}
          className={styles.paneNav}
          aria-label={paneAriaLabel}
          onKeyDown={handlePaneKeyDown}
        >
          {(paneTitle || showToggleButton) && (
            <div className={styles.paneTop}>
              {paneTitle && (
                <span className={styles.paneTitle}>{paneTitle}</span>
              )}
              {showToggleButton && (
                <Button
                  aria-label={toggleButtonLabel}
                  aria-expanded={open}
                  aria-controls={paneId}
                  title={toggleButtonLabel}
                  onClick={() => setPaneOpen(!open)}
                  icon={<SidebarIcon />}
                />
              )}
            </div>
          )}
          {open && paneHeader && (
            <div className={styles.paneSlot}>{renderSlot(paneHeader)}</div>
          )}
          {open && paneCustomContent && (
            <div className={styles.paneSlot}>
              {renderSlot(paneCustomContent)}
            </div>
          )}
          <div className={styles.paneBody}>{menuItems}</div>
          {footerMenuItems && (
            <div className={styles.paneFooterItems}>{footerMenuItems}</div>
          )}
          {paneFooter && (
            <div className={styles.paneSlot}>{renderSlot(paneFooter)}</div>
          )}
        </nav>

        {/* Область контента страницы */}
        <main ref={scrollRef} className={styles.stage}>
          <PageTransition
            pageKey={pageKey !== undefined ? pageKey : selected}
            scrollRef={scrollRef}
          >
            {children}
          </PageTransition>
        </main>
      </div>
    </NavContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Общая основа для NavItem и NavSubItem                               */
/* ------------------------------------------------------------------ */

type NavItemOwnProps<E extends ElementType = "button"> = {
  value?: string | number;
  icon?: ReactNode;
  href?: string;
  as?: E;
  disabled?: boolean;
  selectsOnInvoked?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export type NavItemProps<E extends ElementType = "button"> =
  NavItemOwnProps<E> &
    Omit<ComponentPropsWithoutRef<E>, keyof NavItemOwnProps<E>>;

export type NavSubItemProps<E extends ElementType = "button"> = NavItemProps<E>;

type NavLinkBaseProps = NavItemOwnProps<ElementType> & {
  isSub?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, keyof NavItemOwnProps<ElementType>>;

function NavLinkBase({
  value,
  icon,
  href,
  as,
  disabled,
  selectsOnInvoked = true,
  onClick,
  className,
  children,
  isSub,
  ...rest
}: NavLinkBaseProps) {
  const { selectedValue, select, isPaneOpen } = useNav();
  const selected = value !== undefined && value === selectedValue;

  const Tag: ElementType = as || (href ? "a" : "button");
  const tagProps: Record<string, unknown> = {};
  if (Tag === "button") {
    tagProps.type = "button";
    tagProps.disabled = disabled;
  } else {
    tagProps["aria-disabled"] = disabled ? true : undefined;
    if (Tag === "a") tagProps.href = disabled ? undefined : href;
    else if (href) tagProps.href = href;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (!event.defaultPrevented && value !== undefined) {
      select(event, value, { selects: selectsOnInvoked });
    }
  };

  const tooltip =
    !isPaneOpen && !isSub && typeof children === "string"
      ? children
      : undefined;

  return (
    <Tag
      data-nv-item=""
      title={tooltip}
      className={cx(
        styles.item,
        isSub && styles.sub,
        selected && styles.selected,
        disabled && styles.disabled,
        className,
      )}
      aria-current={selected ? "page" : undefined}
      onClick={handleClick}
      {...tagProps}
      {...rest}
    >
      {icon && !isSub && <span className={styles.icon}>{icon}</span>}
      <span className={styles.content}>{children}</span>
    </Tag>
  );
}

export function NavItem<E extends ElementType = "button">(
  props: NavItemProps<E>,
) {
  return <NavLinkBase {...(props as NavLinkBaseProps)} />;
}

export function NavSubItem<E extends ElementType = "button">(
  props: NavSubItemProps<E>,
) {
  return <NavLinkBase {...(props as NavLinkBaseProps)} isSub />;
}

/* ------------------------------------------------------------------ */
/* NavCategory — раскрывающаяся группа                                 */
/* ------------------------------------------------------------------ */

export interface NavCategoryProps {
  value: string | number;
  icon?: ReactNode;
  title: ReactNode;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export function NavCategory({
  value,
  icon,
  title,
  disabled,
  className,
  children,
}: NavCategoryProps) {
  const { selectedValue, openCategories, toggleCategory, isPaneOpen, rootRef } =
    useNav();
  const groupId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [flyout, setFlyout] = useState<{ left: number; top: number } | null>(
    null,
  );

  const compact = !isPaneOpen;
  const isOpen = openCategories.includes(value);
  const inlineOpen = isOpen && isPaneOpen;
  const flyoutOpen = compact && flyout !== null;

  const hasSelectedChild = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement<{ value?: string | number }>(child) &&
      child.props.value !== undefined &&
      child.props.value === selectedValue,
  );

  useEffect(() => {
    if (isPaneOpen) setFlyout(null);
  }, [isPaneOpen]);

  useIsoLayoutEffect(() => {
    const el = flyoutRef.current;
    const root = rootRef.current;
    if (!flyoutOpen || !el || !flyout || !root) return;
    const maxTop = root.clientHeight - el.offsetHeight - 8;
    if (flyout.top > maxTop) el.style.top = `${Math.max(8, maxTop)}px`;
    el.querySelector<HTMLElement>(FOCUSABLE_ITEM)?.focus();
  }, [flyoutOpen, flyout, rootRef]);

  useEffect(() => {
    if (!flyoutOpen) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (
        flyoutRef.current?.contains(event.target as Node) ||
        buttonRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setFlyout(null);
    };
    const onResize = () => setFlyout(null);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [flyoutOpen]);

  const handleCategoryClick = () => {
    if (isPaneOpen) {
      toggleCategory(value);
      return;
    }
    if (flyout) {
      setFlyout(null);
      return;
    }
    if (buttonRef.current && rootRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      setFlyout({
        left: buttonRect.right - rootRect.left + 8,
        top: buttonRect.top - rootRect.top - 6,
      });
    }
  };

  const handleFlyoutKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setFlyout(null);
      buttonRef.current?.focus();
      return;
    }
    if (moveFocusInContainer(flyoutRef.current, event.key, false)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleFlyoutClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-nv-item]")) {
      setFlyout(null);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className={cx(styles.category, className)}>
      <button
        ref={buttonRef}
        type="button"
        data-nv-item=""
        title={compact && typeof title === "string" ? title : undefined}
        className={cx(
          styles.item,
          hasSelectedChild && !inlineOpen && styles.selected,
          disabled && styles.disabled,
        )}
        aria-expanded={compact ? flyoutOpen : isOpen}
        aria-haspopup={compact ? "true" : undefined}
        aria-controls={compact ? undefined : groupId}
        disabled={disabled}
        onClick={handleCategoryClick}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.content}>{title}</span>
        <span className={cx(styles.chevron, inlineOpen && styles.chevronOpen)}>
          <ChevronIcon />
        </span>
      </button>

      <div
        id={groupId}
        role="group"
        data-nv-collapsed={!inlineOpen}
        className={cx(styles.group, inlineOpen && styles.groupOpen)}
      >
        <div className={styles.groupInner}>{children}</div>
      </div>

      {flyoutOpen &&
        rootRef.current &&
        createPortal(
          <GlassPanel
            ref={flyoutRef}
            {...MENU_GLASS}
            width="auto"
            height="auto"
            role="group"
            aria-label={typeof title === "string" ? title : undefined}
            data-nv-flyout=""
            className={styles.flyout}
            style={{
              position: "absolute",
              left: flyout.left,
              top: flyout.top,
            }}
            onKeyDown={handleFlyoutKeyDown}
            onClick={handleFlyoutClick}
          >
            {children}
          </GlassPanel>,
          rootRef.current,
        )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Заголовок секции и разделитель                                      */
/* ------------------------------------------------------------------ */

export function NavSectionHeader({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <div className={cx(styles.sectionHeader, className)}>{children}</div>;
}

export function NavDivider({ className }: { className?: string }) {
  return <hr className={cx(styles.divider, className)} />;
}

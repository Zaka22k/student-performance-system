import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  CSSProperties,
  FocusEvent,
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ComboBox.module.css";

/**
 * An item of the list: a plain string or any object.
 * Элемент списка: просто строка или любой объект.
 */
export type ComboBoxOption = string | object;

/**
 * State passed to `renderOption`.
 * Состояние, которое получает `renderOption`.
 */
export interface ComboBoxOptionState {
  /** Text of the item. / Текст элемента. */
  label: string;
  /** Value of the item (id or another field). / Значение элемента (id или другое поле). */
  value: string;
  /** The item matches the current value. / Элемент совпадает с текущим значением. */
  selected: boolean;
  /** The item is under the pointer or the keyboard cursor. / Элемент под курсором мыши или клавиатуры. */
  active: boolean;
  /** Index in the visible (filtered) list. / Индекс в видимом (отфильтрованном) списке. */
  index: number;
}

/** Keys of an object option; strings have none. / Ключи объекта-элемента; у строк их нет. */
type OptionKey<T> = T extends string ? never : keyof T;

export interface ComboBoxProps<
  T extends ComboBoxOption = ComboBoxOption,
> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "type"
  | "role"
  | "size"
  | "children"
  | "className"
  | "style"
> {
  /**
   * List of choices: strings, objects, or both.
   * Список вариантов: строки, объекты или то и другое.
   */
  options: readonly T[];
  /**
   * Current value (controlled). For objects it is the value of `valueKey`, for a custom text it is the text itself.
   * Текущее значение (управляемый режим). Для объектов это значение поля `valueKey`, для своего текста — сам текст.
   */
  value?: string;
  /**
   * Initial value (uncontrolled). Per HIG, prefer a meaningful value from the list.
   * Начальное значение (неуправляемый режим). По HIG лучше подставлять осмысленное значение из списка.
   */
  defaultValue?: string;
  /**
   * Called on every change. `option` is the chosen item, or null when the text is custom.
   * Вызывается при каждом изменении. `option` — выбранный элемент или null, если текст свой.
   */
  onChange?: (value: string, option: T | null) => void;
  /**
   * Field of an object used as the value (for example 'id'). Strings are their own value.
   * Поле объекта, которое служит значением (например, 'id'). Строка сама является своим значением.
   */
  valueKey?: OptionKey<T>;
  /**
   * Field of an object shown in the field and in the list (for example 'name').
   * Поле объекта, которое показывается в поле и в списке (например, 'name').
   */
  labelKey?: OptionKey<T>;
  /**
   * Function form of `valueKey`; wins over it.
   * Функциональная форма `valueKey`; приоритетнее него.
   */
  getOptionValue?: (option: T) => string;
  /**
   * Function form of `labelKey`; wins over it.
   * Функциональная форма `labelKey`; приоритетнее него.
   */
  getOptionLabel?: (option: T) => string;
  /**
   * Custom content of a list item. The item box (hover, selection mark, click) stays standard.
   * Своё содержимое пункта списка. Оболочка пункта (наведение, отметка выбора, клик) остаётся стандартной.
   */
  renderOption?: (option: T, state: ComboBoxOptionState) => ReactNode;
  /**
   * Filtering of the list while typing. true: label contains the text; false: no filtering; or your own function.
   * Фильтрация списка при вводе. true: подпись содержит текст; false: без фильтра; либо своя функция.
   */
  filter?: boolean | ((option: T, query: string, label: string) => boolean);
  /**
   * Introductory label. Per HIG, use title-style capitalization and end it with a colon.
   * Вводная подпись. По HIG: заглавные буквы как в заголовке и двоеточие в конце.
   */
  label?: ReactNode;
  /**
   * Where the label sits: above the field or before it (macOS style).
   * Где стоит подпись: над полем или перед ним (как в macOS).
   */
  labelPlacement?: "top" | "start";
  /**
   * Helper text shown below the input field.
   * Текст подсказки снизу поля ввода.
   */
  hint?: ReactNode;
  /**
   * Accessible name of the pull-down button.
   * Доступное имя кнопки раскрытия списка.
   */
  toggleLabel?: string;
  /** Class of the root element. / Класс корневого элемента. */
  className?: string;
  /** Style of the root element. / Стиль корневого элемента. */
  style?: CSSProperties;
}

// Geometry of the list. LIST_MAX_HEIGHT is the only place with the list height.
// Геометрия списка. LIST_MAX_HEIGHT — единственное место с высотой списка.
const LIST_MAX_HEIGHT = 240;
const ITEM_HEIGHT = 32;
const LIST_GAP = 8; // gap between field and list / зазор между полем и списком
const LIST_CHROME = 8 + LIST_GAP; // padding + gap / отступы и зазор

/**
 * Where the field sits in the viewport; the list is positioned from it.
 * Положение поля в окне браузера; от него считается положение списка.
 */
interface ListAnchor {
  left: number;
  width: number;
  /** Bottom edge of the field. / Нижняя граница поля. */
  top: number;
  /** Distance from the top edge of the field to the viewport bottom. / Расстояние от верха поля до низа окна. */
  bottom: number;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const cx = (...parts: Array<string | false | undefined>): string =>
  parts.filter(Boolean).join(" ");

function readKey(option: object, key: PropertyKey): string {
  const v = (option as Record<PropertyKey, unknown>)[key];
  return v === undefined || v === null ? "" : String(v);
}

interface Item<T> {
  option: T;
  value: string;
  label: string;
}

function ComboBoxInner<T extends ComboBoxOption>(
  {
    options,
    value,
    defaultValue,
    onChange,
    valueKey,
    labelKey,
    getOptionValue,
    getOptionLabel,
    renderOption,
    filter = true,
    label,
    labelPlacement = "top",
    hint,
    toggleLabel = "Показать варианты",
    className,
    style,
    disabled,
    id,
    onKeyDown,
    "aria-describedby": ariaDescribedBy,
    ...rest
  }: ComboBoxProps<T>,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const baseId = useId();
  const inputId = id ?? `${baseId}-input`;
  const listId = `${baseId}-list`;
  const hintId = `${baseId}-hint`;
  const hasHint = hint !== undefined && hint !== null;

  const describedBy =
    [ariaDescribedBy, hasHint ? hintId : undefined].filter(Boolean).join(" ") ||
    undefined;

  const [inner, setInner] = useState(defaultValue ?? "");
  // Text being typed right now; null when the field shows the value itself.
  // Текст, который вводят прямо сейчас; null, когда поле показывает само значение.
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [anchor, setAnchor] = useState<ListAnchor | null>(null);

  const current = value !== undefined ? value : inner;

  const getValue = useCallback(
    (o: T): string => {
      if (getOptionValue) return getOptionValue(o);
      if (typeof o === "string") return o;
      const key = (valueKey ?? labelKey) as PropertyKey | undefined;
      return key === undefined ? "" : readKey(o as object, key);
    },
    [getOptionValue, valueKey, labelKey],
  );

  const getLabel = useCallback(
    (o: T): string => {
      if (getOptionLabel) return getOptionLabel(o);
      if (typeof o === "string") return o;
      const key = (labelKey ?? valueKey) as PropertyKey | undefined;
      return key === undefined ? "" : readKey(o as object, key);
    },
    [getOptionLabel, valueKey, labelKey],
  );

  const items = useMemo<Item<T>[]>(
    () =>
      options.map((option) => ({
        option,
        value: getValue(option),
        label: getLabel(option),
      })),
    [options, getValue, getLabel],
  );

  const visible = useMemo(() => {
    if (query === null || filter === false) return items;
    if (typeof filter === "function") {
      return items.filter((i) => filter(i.option, query, i.label));
    }
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query, filter]);

  const listVisible = open && !disabled && visible.length > 0;
  const currentLabel = items.find((i) => i.value === current)?.label ?? current;
  const displayText = query ?? currentLabel;
  // The list is rendered in a portal, so it is positioned from the field's
  // rectangle: on open, on resize, and on scroll of any ancestor. It flips
  // above the field when there is no room below.
  // Список рендерится порталом, поэтому его положение считается по рамке поля:
  // при открытии, при изменении размера окна и прокрутке любого предка.
  // Если снизу не хватает места, список разворачивается вверх.
  const visibleCount = visible.length;
  useIsomorphicLayoutEffect(() => {
    if (!listVisible) {
      setAnchor(null);
      return;
    }

    const update = () => {
      const field = fieldRef.current;
      if (!field) return;
      const rect = field.getBoundingClientRect();
      const need =
        Math.min(LIST_MAX_HEIGHT, visibleCount * ITEM_HEIGHT) + LIST_CHROME;
      const below = window.innerHeight - rect.bottom;
      setPlacement(below < need && rect.top > below ? "top" : "bottom");
      const next: ListAnchor = {
        left: rect.left,
        width: rect.width,
        top: rect.bottom,
        bottom: window.innerHeight - rect.top,
      };
      setAnchor((prev) =>
        prev &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.top === next.top &&
        prev.bottom === next.bottom
          ? prev
          : next,
      );
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [listVisible, visibleCount]);

  useEffect(() => {
    if (!listVisible || activeIndex < 0) return;
    document
      .getElementById(`${listId}-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [listVisible, activeIndex, listId]);

  const commit = (next: string, option: T | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next, option);
  };

  const selectItem = (item: Item<T>) => {
    commit(item.value, item.option);
    setQuery(null);
    setOpen(false);
    inputRef.current?.focus();
  };

  // Open with the whole list, the cursor on the chosen item.
  // Открываем весь список, курсор на выбранном элементе.
  const openList = (edge?: "first" | "last") => {
    const selected = items.findIndex((i) => i.value === current);
    setQuery(null);
    setOpen(true);
    setActiveIndex(
      selected >= 0
        ? selected
        : edge === "last"
          ? items.length - 1
          : edge
            ? 0
            : -1,
    );
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const lower = text.toLowerCase();
    const matched = items.find((i) => i.label.toLowerCase() === lower);
    setQuery(text);
    setOpen(true);
    setActiveIndex(-1);
    // A custom text is not added to the list (HIG): it is just the new value.
    // Свой текст не добавляется в список (HIG): он просто становится новым значением.
    commit(matched ? matched.value : text, matched ? matched.option : null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        const down = e.key === "ArrowDown";
        if (!listVisible) {
          openList(down ? "first" : "last");
          return;
        }
        const n = visible.length;
        setActiveIndex((i) =>
          i < 0 ? (down ? 0 : n - 1) : (i + (down ? 1 : -1) + n) % n,
        );
        return;
      }
      case "Enter": {
        const item = listVisible ? visible[activeIndex] : undefined;
        if (item) {
          e.preventDefault();
          selectItem(item);
        } else {
          setOpen(false);
        }
        return;
      }
      case "Escape":
        if (listVisible) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        setOpen(false);
        return;
    }
  };

  const handleFieldBlur = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (e.currentTarget.contains(next)) return;
    // The list lives in a portal, so it is not inside the field in the DOM.
    // Список лежит в портале и в DOM не является потомком поля.
    if (next && document.getElementById(listId)?.contains(next)) return;
    setOpen(false);
    setQuery(null);
  };

  const toggle = () => {
    inputRef.current?.focus();
    if (listVisible) setOpen(false);
    else openList();
  };

  const listStyle: CSSProperties | undefined = anchor
    ? {
        position: "fixed",
        left: anchor.left,
        width: anchor.width,
        ...(placement === "top"
          ? { bottom: anchor.bottom + LIST_GAP }
          : { top: anchor.top + LIST_GAP }),
      }
    : undefined;

  return (
    <div
      className={cx(
        styles.root,
        labelPlacement === "start" && styles.labelStart,
        disabled && styles.disabled,
        listVisible && styles.open,
        className,
      )}
      style={style}
    >
      {label !== undefined && label !== null && (
        <label
          className={cx(styles.label, "BodyTextBlockStyle")}
          htmlFor={inputId}
        >
          {label}
        </label>
      )}

      <div className={styles.fieldWrapper}>
        <div ref={fieldRef} className={styles.field} onBlur={handleFieldBlur}>
          <div className={styles.control}>
            <input
              autoComplete="off"
              {...rest}
              ref={setRefs}
              id={inputId}
              className={cx(styles.input, "BodyTextBlockStyle")}
              type="text"
              role="combobox"
              disabled={disabled}
              value={displayText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              aria-expanded={listVisible}
              aria-controls={listVisible ? listId : undefined}
              aria-autocomplete={filter === false ? "none" : "list"}
              aria-describedby={describedBy}
              aria-activedescendant={
                listVisible && activeIndex >= 0
                  ? `${listId}-${activeIndex}`
                  : undefined
              }
            />
            <button
              type="button"
              tabIndex={-1}
              className={styles.button}
              aria-label={toggleLabel}
              disabled={disabled}
              // Keep the focus in the input.
              // Оставляем фокус в поле ввода.
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggle}
            >
              <svg
                className={styles.chevron}
                viewBox="0 0 16 16"
                width="12"
                height="12"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M3.5 6 8 10.5 12.5 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {listVisible &&
            anchor &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className={cx(
                  styles.list,
                  placement === "top" && styles.listTop,
                )}
                style={listStyle}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div
                  id={listId}
                  role="listbox"
                  className={styles.listbox}
                  style={{ maxHeight: LIST_MAX_HEIGHT }}
                >
                  {visible.map((item, index) => {
                    const selected = item.value === current;
                    const active = index === activeIndex;
                    return (
                      <div
                        key={`${item.value}\u0000${index}`}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={selected}
                        className={cx(
                          styles.option,
                          "BodyTextBlockStyle",
                          active && styles.optionActive,
                        )}
                        onClick={() => selectItem(item)}
                        onMouseMove={() => {
                          if (!active) setActiveIndex(index);
                        }}
                      >
                        <div className={styles.optionContent}>
                          {renderOption
                            ? renderOption(item.option, {
                                label: item.label,
                                value: item.value,
                                selected,
                                active,
                                index,
                              })
                            : item.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>,
              document.body,
            )}
        </div>

        {hasHint && (
          <div id={hintId} className={cx(styles.hint, "CaptionTextBlockStyle")}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Combo box: a text field with a pull-down button. A custom text can be typed in,
 * or a value picked from the list.
 *
 * Combo box: текстовое поле с кнопкой раскрытия списка. Можно ввести свой текст
 * или выбрать значение из списка.
 */
export const ComboBox = forwardRef(ComboBoxInner) as <
  T extends ComboBoxOption = string,
>(
  props: ComboBoxProps<T> & { ref?: Ref<HTMLInputElement> },
) => ReactElement;

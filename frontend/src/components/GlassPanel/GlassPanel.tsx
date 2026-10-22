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
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { createGlassMaps } from "./liquidGlass";
import type { GlassProfile } from "./liquidGlass";

export type { GlassProfile } from "./liquidGlass";

/**
 * Visual parameters of the glass. Every one is optional, defaults are in GLASS_DEFAULTS.
 * Визуальные параметры стекла. Все необязательные, значения по умолчанию лежат в GLASS_DEFAULTS.
 */
export interface GlassOptions {
  /**
   * Shape of the bezel cross-section.
   * Форма сечения кромки: squircle, circle (выпуклые), concave (вогнутая), lip (выпуклый край и впадина).
   */
  profile?: GlassProfile;
  /**
   * Bezel width in px: the zone along the edge where light is refracted.
   * Ширина кромки в px: зона у края, где свет преломляется.
   */
  bezel?: number;
  /**
   * Glass height in px above the background. Larger values refract more.
   * Высота стекла над фоном в px. Чем больше, тем сильнее преломление.
   */
  glassHeight?: number;
  /**
   * Refractive index n. 1 means no refraction, 1.5 is ordinary glass.
   * Показатель преломления n. 1 означает «без преломления», 1.5 соответствует обычному стеклу.
   */
  ior?: number;
  /**
   * Multiplier for the displacement scale. 0 turns refraction off.
   * Множитель смещения. 0 отключает преломление.
   */
  strength?: number;
  /**
   * Gaussian blur of the backdrop in px.
   * Гауссово размытие фона за стеклом в px.
   */
  blur?: number;
  /**
   * Backdrop saturation multiplier. 1 leaves colours unchanged.
   * Множитель насыщенности фона. 1 не меняет цвета.
   */
  saturation?: number;
  /**
   * Direction of the light in degrees. 0 is right, 90 is down, -60 is up and to the right.
   * Направление света в градусах. 0 вправо, 90 вниз, -60 вверх и вправо.
   */
  specularAngle?: number;
  /**
   * Brightness of the edge highlight, 0..1. A number or a CSS value such as 'var(--token)'.
   * Яркость блика на краю, 0..1. Число или CSS-значение вроде 'var(--token)'.
   */
  specularOpacity?: number | string;
  /**
   * Thickness of the edge highlight in px.
   * Толщина блика на краю в px.
   */
  specularWidth?: number;
  /**
   * Strength of the thin outline and the soft inner shadow along the edge, 0..1.
   * 0 turns it off. Around 0.15 to 0.3 gives the look of glass on a light background.
   * A number or a CSS value such as 'var(--token)'; a token must resolve to a plain number.
   *
   * Сила тонкого контура и мягкой внутренней тени по краю, 0..1. 0 отключает.
   * Около 0.15..0.3 даёт вид стекла на светлом фоне.
   * Число или CSS-значение вроде 'var(--token)'; токен должен раскрываться в обычное число.
   */
  edgeShadowOpacity?: number | string;
  /**
   * Width of the soft inner shadow in px. The outline itself is always about 1.4 px.
   * A number, or a CSS value such as 'var(--glass-edge-width)'. A token may hold a plain number ('8')
   * or a length ('8px', '0.5rem'); calc() also works. Tokens are re-read when the theme changes
   * (class, style or data-* on <html> or <body>, or the system colour scheme).
   *
   * Ширина мягкой внутренней тени в px. Сам контур всегда около 1.4 px.
   * Число или CSS-значение вроде 'var(--glass-edge-width)'. В токене может лежать число ('8')
   * или длина ('8px', '0.5rem'); calc() тоже работает. Токен перечитывается при смене темы
   * (class, style или data-* на <html> или <body>, либо системная цветовая схема).
   * Токен нужно объявлять на :root или на body: значения, заданные на предках панели, не отслеживаются.
   */
  edgeShadowWidth?: number | string;
  /**
   * Opacity of the drop shadow around the panel, 0..1. Ignored when `boxShadow` is set.
   * A number or a CSS value such as 'var(--token)'; a token must resolve to a plain number.
   *
   * Непрозрачность внешней тени вокруг панели, 0..1. Игнорируется, если задан `boxShadow`.
   * Число или CSS-значение вроде 'var(--token)'; токен должен раскрываться в обычное число.
   */
  outerShadowOpacity?: number | string;
  /**
   * Panel width: a number in px or any CSS size. Use 'auto' to size by content.
   * Ширина панели: число в px или любой CSS-размер. 'auto' берёт размер по содержимому.
   */
  width?: number | string;
  /**
   * Panel height: a number in px or any CSS size. Use 'auto' to size by content.
   * Высота панели: число в px или любой CSS-размер. 'auto' берёт размер по содержимому.
   */
  height?: number | string;
  /**
   * Corner radius in px. A value above half the shorter side gives a pill or a circle.
   * Радиус углов в px. Значение больше половины короткой стороны даёт «таблетку» или круг.
   */
  radius?: number;

  /**
   * Full CSS box-shadow of the panel. When set, it replaces the shadow made by `outerShadowOpacity`.
   * Полное значение CSS box-shadow. Если задано, заменяет тень, которую строит `outerShadowOpacity`.
   */
  boxShadow?: string;
  /**
   * Blur in px used where SVG backdrop filters are not supported (everything except Chromium).
   * Размытие в px там, где SVG-фильтр в backdrop-filter не поддерживается (всё, кроме Chromium).
   */
  fallbackBlur?: number;
  /**
   * Chromatic dispersion 0..1: red, green and blue are refracted with different strength
   * (red by 1 - d, green by 1, blue by 1 + d), which gives colour fringes at the edge.
   * 0 turns it off and uses a single displacement pass instead of three.
   * Хроматическая дисперсия 0..1: красный, зелёный и синий преломляются с разной силой
   * (красный на 1 - d, зелёный на 1, синий на 1 + d), из-за чего на краю появляется цветная кайма.
   * 0 отключает её и использует один проход смещения вместо трёх.
   */
  dispersion?: number;
}

/**
 * The only place with base settings. Every prop of GlassPanel falls back to the value here.
 * Единственное место с базовыми настройками. Любой пропс GlassPanel берёт значение отсюда, если не передан.
 */
export const GLASS_DEFAULTS = {
  profile: "squircle",
  bezel: 30,
  glassHeight: 50,
  ior: 1.5,
  strength: 1,
  blur: 0.25,
  saturation: 1.4,
  specularAngle: -110,
  specularOpacity: 0.6,
  specularWidth: 2,
  edgeShadowOpacity: "var(--edgeShadowOpacity)",
  edgeShadowWidth: 24,
  outerShadowOpacity: "var(--outerShadowOpacity)",
  width: 320,
  height: 160,
  radius: 9999,
  fallbackBlur: 24,
  dispersion: 0,
} as const satisfies Required<Omit<GlassOptions, "boxShadow">>;

/**
 * The drop shadow used when `boxShadow` is not set. Two layers: a wide soft one and a tight one
 * (the second layer is 0.66 of the first). A string opacity is passed through as a CSS value.
 * Внешняя тень, когда `boxShadow` не задан. Два слоя: широкий мягкий и узкий (второй слой равен 0.66 от первого).
 * Строковая непрозрачность подставляется в CSS как есть.
 */
export function outerShadow(opacity: number | string): string {
  const second =
    typeof opacity === "number"
      ? Math.round(opacity * 0.66 * 1000) / 1000
      : `calc(${opacity} * 0.66)`;
  return `0 14px 40px rgba(0, 0, 0, ${opacity}), 0 2px 8px rgba(0, 0, 0, ${second})`;
}

/**
 * Props of GlassPanel: all glass options plus any native div attribute.
 * Пропсы GlassPanel: все параметры стекла и любые атрибуты div.
 */
export interface GlassPanelProps
  extends GlassOptions, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
}

/**
 * A token cannot be compared in JS, so a string value always counts as visible.
 * Токен нельзя сравнить в JS, поэтому строка всегда считается «видимой».
 */
const isVisible = (v: number | string): boolean =>
  typeof v === "string" || v > 0;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Turns a number or a CSS value ('var(--x)', '8px', 'calc(...)') into a number of px.
 * Returns null when the value cannot be resolved (the caller then uses its fallback).
 * Переводит число или CSS-значение ('var(--x)', '8px', 'calc(...)') в число px.
 * Возвращает null, если значение не раскрылось (тогда вызывающий берёт запасное значение).
 */
function resolveCssNumber(
  value: number | string,
  el: HTMLElement,
): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = value.trim();
  const plain = Number(text);
  if (text !== "" && Number.isFinite(plain)) return plain;

  // var(--name) or var(--name, fallback): a unitless token ('8') is read straight from the computed style.
  // var(--name) или var(--name, запасное): токен без единицы ('8') читаем напрямую из computed style.
  const m = /^var\(\s*(--[^,\s)]+)\s*(?:,\s*([^)]+))?\)$/.exec(text);
  if (m) {
    const raw =
      getComputedStyle(el).getPropertyValue(m[1]).trim() || (m[2] ?? "").trim();
    const n = Number(raw);
    if (raw !== "" && Number.isFinite(n)) return n;
  }

  // Lengths and calc(): let the browser compute them on a throw-away probe element.
  // Длины и calc(): отдаём расчёт браузеру через временный элемент-пробу.
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none;height:0;";
  probe.style.width = text;
  el.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  el.removeChild(probe);
  return probe.style.width !== "" && Number.isFinite(px) ? px : null;
}

/**
 * Keeps a numeric value in sync with a CSS token. Re-reads it when the theme may have changed:
 * attributes of <html> or <body>, or the system colour scheme.
 * Держит числовое значение в синхроне с CSS-токеном. Перечитывает его, когда могла смениться тема:
 * атрибуты <html> или <body>, либо системная цветовая схема.
 */
function useCssNumber(
  value: number | string,
  elRef: { current: HTMLElement | null },
  fallback: number,
): number {
  const [resolved, setResolved] = useState<number>(
    typeof value === "number" ? value : fallback,
  );

  useIsomorphicLayoutEffect(() => {
    if (typeof value === "number") {
      setResolved(Number.isFinite(value) ? value : fallback);
      return;
    }
    const el = elRef.current;
    if (!el) return;
    const read = () => setResolved(resolveCssNumber(value, el) ?? fallback);
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true });
    if (document.body) observer.observe(document.body, { attributes: true });
    const mq =
      typeof matchMedia === "function"
        ? matchMedia("(prefers-color-scheme: dark)")
        : null;
    mq?.addEventListener("change", read);
    return () => {
      observer.disconnect();
      mq?.removeEventListener("change", read);
    };
  }, [value, fallback, elRef]);

  return resolved;
}

/**
 * Chromium is the only engine that accepts an SVG filter in backdrop-filter.
 * Chromium — единственный движок, который принимает SVG-фильтр в backdrop-filter.
 */
function supportsSvgBackdropFilter(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // На iOS все браузеры используют движок WebKit, где url(#filter) в backdrop-filter не работает
  if (/CriOS|FxiOS|EdgiOS|OPiOS|iPhone|iPad|iPod/.test(ua)) return false;
  return /Chrome\/|Chromium\/|Edg\//.test(ua);
}

/**
 * Short string hash (djb2) for the filter id.
 * Короткий хеш строки (djb2) для id фильтра.
 */
function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

interface Size {
  w: number;
  h: number;
}

/**
 * Overlay layers sit under the content and over the panel background.
 * Слои-наложения лежат под содержимым и над фоном панели.
 */
const OVERLAY_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: -1,
  borderRadius: "inherit",
  pointerEvents: "none",
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
};

/**
 * A panel that refracts whatever is behind it, like Apple's Liquid Glass.
 *
 * Refraction is an SVG displacement filter used as a backdrop-filter (Chromium only, other
 * browsers get a plain blur). The edge highlight and the edge shade are ordinary layers of the
 * panel itself, so they also show up in browsers without the filter. All maps are generated from
 * the panel's measured size, so it can have a fixed size, a percentage, or 'auto'.
 *
 * Панель, которая преломляет то, что находится за ней, как Liquid Glass у Apple.
 *
 * Преломление — это SVG-фильтр смещения в backdrop-filter (только Chromium, остальные браузеры
 * получают обычное размытие). Блик и тень по краю — обычные слои самой панели, поэтому они видны
 * и там, где фильтра нет. Все карты строятся по измеренному размеру панели, поэтому размер может
 * быть фиксированным, в процентах или 'auto'.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    {
      profile = GLASS_DEFAULTS.profile,
      bezel = GLASS_DEFAULTS.bezel,
      glassHeight = GLASS_DEFAULTS.glassHeight,
      ior = GLASS_DEFAULTS.ior,
      strength = GLASS_DEFAULTS.strength,
      blur = GLASS_DEFAULTS.blur,
      saturation = GLASS_DEFAULTS.saturation,
      specularAngle = GLASS_DEFAULTS.specularAngle,
      specularOpacity = GLASS_DEFAULTS.specularOpacity,
      specularWidth = GLASS_DEFAULTS.specularWidth,
      edgeShadowOpacity = GLASS_DEFAULTS.edgeShadowOpacity,
      edgeShadowWidth: edgeShadowWidthProp = GLASS_DEFAULTS.edgeShadowWidth,
      outerShadowOpacity = GLASS_DEFAULTS.outerShadowOpacity,
      width = GLASS_DEFAULTS.width,
      height = GLASS_DEFAULTS.height,
      radius = GLASS_DEFAULTS.radius,
      boxShadow,
      fallbackBlur = GLASS_DEFAULTS.fallbackBlur,
      dispersion = GLASS_DEFAULTS.dispersion,
      style,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    // Shade width in px: a number, or a token resolved against this panel.
    // Ширина тени в px: число либо токен, раскрытый относительно этой панели.
    const edgeShadowWidth = useCssNumber(
      edgeShadowWidthProp,
      innerRef,
      GLASS_DEFAULTS.edgeShadowWidth,
    );

    const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const [size, setSize] = useState<Size | null>(null);
    const [svgFilterOk, setSvgFilterOk] = useState(false);

    // Measure the panel and keep the measurement in sync with layout changes.
    // Замеряем панель и обновляем замер при любых изменениях раскладки.
    useIsomorphicLayoutEffect(() => {
      setSvgFilterOk(supportsSvgBackdropFilter());
      const el = innerRef.current;
      if (!el) return;
      const measure = () => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        setSize((prev) =>
          prev && prev.w === w && prev.h === h ? prev : { w, h },
        );
      };
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // Opacities are applied in CSS, so they are not dependencies: changing them does not rebuild the maps.
    // Непрозрачности применяются через CSS и не входят в зависимости: их смена не пересобирает карты.
    const maps = useMemo(() => {
      if (!size || size.w < 2 || size.h < 2) return null;
      return createGlassMaps({
        width: size.w,
        height: size.h,
        radius,
        bezel,
        glassHeight,
        ior,
        strength,
        specularAngle,
        specularWidth,
        edgeShadowWidth,
        profile,
        refraction: svgFilterOk,
        pixelRatio:
          typeof window === "undefined"
            ? 1
            : Math.min(2, window.devicePixelRatio || 1),
      });
    }, [
      svgFilterOk,
      size,
      radius,
      bezel,
      glassHeight,
      ior,
      strength,
      specularAngle,
      specularWidth,
      edgeShadowWidth,
      profile,
    ]);

    // A new id for every new filter makes Chrome re-evaluate the backdrop filter.
    // Новый id у каждого нового фильтра заставляет Chrome заново применить backdrop-filter.
    const filterId = useMemo(() => {
      const key = [
        size?.w,
        size?.h,
        radius,
        bezel,
        glassHeight,
        ior,
        strength,
        dispersion,
        profile,
        blur,
        saturation,
      ].join("|");
      return `lg-${baseId}-${hashString(key)}`;
    }, [
      baseId,
      size,
      radius,
      bezel,
      glassHeight,
      ior,
      strength,
      dispersion,
      profile,
      blur,
      saturation,
    ]);

    // Refraction works only in Chromium; elsewhere a plain blur is used.
    // Преломление работает только в Chromium; в остальных браузерах обычное размытие.
    const refracts =
      svgFilterOk &&
      maps !== null &&
      maps.displacementUrl !== "" &&
      size !== null;
    const backdrop = refracts
      ? `url(#${filterId})`
      : `blur(${fallbackBlur}px) saturate(${saturation})`;

    // The root carries the tint, shadow and backdrop filter; `style` from the caller wins over all of it.
    // Корень несёт заливку, тень и backdrop-filter; `style` от вызывающего перекрывает всё это.
    const rootStyle: CSSProperties = {
      position: "relative",
      isolation: "isolate",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      boxSizing: "border-box",
      width,
      height,
      borderRadius: radius,
      boxShadow: boxShadow ?? outerShadow(outerShadowOpacity),
      backdropFilter: backdrop,
      WebkitBackdropFilter: backdrop,
      ...style,
    };

    return (
      <div ref={setRefs} style={rootStyle} {...rest}>
        {/* SVG filter: blur, then displacement by the map, then saturation. / SVG-фильтр: размытие, смещение по карте, насыщенность. */}
        {refracts && maps && size && (
          <svg
            aria-hidden="true"
            focusable="false"
            width={0}
            height={0}
            style={{ position: "absolute", pointerEvents: "none" }}
          >
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={size.w}
              height={size.h}
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={blur}
                result="blur"
              />
              <feImage
                href={maps.displacementUrl}
                x={0}
                y={0}
                width={size.w}
                height={size.h}
                preserveAspectRatio="none"
                result="map"
              />
              {dispersion > 0 ? (
                <>
                  {/* Красный канал — преломляется слабее */}
                  <feDisplacementMap
                    in="blur"
                    in2="map"
                    scale={maps.scale * (1 - dispersion)}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispR"
                  />
                  <feColorMatrix
                    in="dispR"
                    type="matrix"
                    values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                    result="chR"
                  />
                  {/* Зелёный канал — базовое преломление */}
                  <feDisplacementMap
                    in="blur"
                    in2="map"
                    scale={maps.scale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispG"
                  />
                  <feColorMatrix
                    in="dispG"
                    type="matrix"
                    values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                    result="chG"
                  />
                  {/* Синий канал — преломляется сильнее */}
                  <feDisplacementMap
                    in="blur"
                    in2="map"
                    scale={maps.scale * (1 + dispersion)}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispB"
                  />
                  <feColorMatrix
                    in="dispB"
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                    result="chB"
                  />
                  {/* Собираем R + G + B через screen-смешивание */}
                  <feBlend in="chR" in2="chG" mode="screen" result="rg" />
                  <feBlend in="rg" in2="chB" mode="screen" result="disp" />
                </>
              ) : (
                <feDisplacementMap
                  in="blur"
                  in2="map"
                  scale={maps.scale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="disp"
                />
              )}
              <feColorMatrix
                in="disp"
                type="saturate"
                values={String(saturation)}
              />
            </filter>
          </svg>
        )}

        {/* Edge highlight layer. / Слой блика на краю. */}
        {maps && isVisible(specularOpacity) && (
          <div
            aria-hidden="true"
            style={{
              ...OVERLAY_STYLE,
              backgroundImage: `url(${maps.specularUrl})`,
              opacity: specularOpacity,
            }}
          />
        )}
        {/* Edge outline and inner shadow layer. / Слой контура и внутренней тени. */}
        {maps && isVisible(edgeShadowOpacity) && (
          <div
            aria-hidden="true"
            style={{
              ...OVERLAY_STYLE,
              backgroundImage: `url(${maps.edgeShadowUrl})`,
              opacity: edgeShadowOpacity,
            }}
          />
        )}
        {children}
      </div>
    );
  },
);

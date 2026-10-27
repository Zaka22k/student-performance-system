/**
 * Liquid Glass math: refraction table, displacement map, specular rim mask and edge shade mask.
 * Pure functions, no React. Based on the approach from
 * https://kube.io/blog/liquid-glass-css-svg/ (the specular rim and edge shade are our own construction).
 *
 * Математика Liquid Glass: таблица преломления, карта смещений, маска блика и маска тени по краю.
 * Чистые функции, без React. Основано на подходе из статьи
 * https://kube.io/blog/liquid-glass-css-svg/ (блик и тень по краю построены нами самостоятельно).
 */

/**
 * Bezel cross-section: squircle and circle are convex, concave is a dish, lip is a convex edge with a dip.
 * Сечение кромки: squircle и circle выпуклые, concave вогнутая, lip — выпуклый край со впадиной.
 */
export type GlassProfile = "squircle" | "circle" | "concave" | "lip";

/**
 * Number of samples along the bezel. 128 matches the 8-bit resolution of the displacement map.
 * Число отсчётов вдоль кромки. 128 соответствует 8-битной точности карты смещений.
 */
export const SAMPLES = 128;

/**
 * Width of the thin outline of the edge shade, in CSS px.
 * Ширина тонкого контура тени по краю, в CSS px.
 */
const OUTLINE_WIDTH = 1.4;

/** Smooth 0..1 ramp with zero slope at both ends. / Плавный переход 0..1 с нулевым наклоном на концах. */
const smootherstep = (x: number): number => x * x * x * (x * (x * 6 - 15) + 10);
/** Squircle curve: a rounded square that is flatter than a circle. / Кривая squircle: скруглённый квадрат, более плоский, чем круг. */
const squircle = (x: number): number => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

/**
 * Height profiles f(x), x in [0, 1] from the outer edge (0) to the end of the bezel (1).
 * Профили высоты f(x), x от 0 до 1: от внешнего края (0) до конца кромки (1).
 */
const PROFILES: Record<GlassProfile, (x: number) => number> = {
  circle: (x) => Math.sqrt(1 - (1 - x) * (1 - x)),
  squircle,
  concave: (x) => 1 - squircle(x),
  lip: (x) => {
    const s = smootherstep(x);
    return squircle(x) * (1 - s) + (1 - squircle(x)) * s;
  },
};

/**
 * Numeric derivative of f at x (central difference, clamped to [0, 1]).
 * Численная производная f в точке x (центральная разность, зажатая в [0, 1]).
 */
function derivative(f: (x: number) => number, x: number): number {
  const e = 0.001;
  const lo = Math.max(0, x - e);
  const hi = Math.min(1, x + e);
  return (f(hi) - f(lo)) / (hi - lo);
}

export interface RefractionTable {
  /**
   * Signed displacement in px for each sample. Positive points towards the panel centre.
   * Смещение в px для каждого отсчёта, со знаком. Положительное направлено к центру панели.
   */
  displacement: Float64Array;
  /**
   * Largest absolute displacement in px.
   * Наибольшее по модулю смещение в px.
   */
  maxAbs: number;
}

/**
 * Snell's law along one radius of the bezel. The incoming ray is vertical, the glass height at
 * distance d from the edge is h = H * f(d / B), the surface slope is H * f'(x) / B.
 *
 * Закон Снеллиуса вдоль одного радиуса кромки. Входящий луч вертикален, высота стекла на
 * расстоянии d от края h = H * f(d / B), наклон поверхности H * f'(x) / B.
 */
export function computeRefractionTable(
  profile: GlassProfile,
  bezel: number,
  glassHeight: number,
  ior: number,
): RefractionTable {
  const f = PROFILES[profile];
  const displacement = new Float64Array(SAMPLES);
  const n = Math.max(1, ior);
  let maxAbs = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const x = i / (SAMPLES - 1);
    const h = glassHeight * f(x);
    const slope = (glassHeight * derivative(f, x)) / bezel;
    const t1 = Math.atan(Math.abs(slope)); // angle of incidence / угол падения
    const t2 = Math.asin(Math.min(1, Math.sin(t1) / n)); // angle of refraction / угол преломления
    displacement[i] = Math.sign(slope) * h * Math.tan(t1 - t2);
    maxAbs = Math.max(maxAbs, Math.abs(displacement[i]));
  }
  // Below 1e-3 px the map would only be numeric noise (for example at n = 1).
  // Меньше 1e-3 px карта была бы просто численным шумом (например, при n = 1).
  return { displacement, maxAbs: maxAbs < 1e-3 ? 0 : maxAbs };
}

/**
 * Normalised signed displacement in [-1, 1] at x in [0, 1], linearly interpolated.
 * Нормированное смещение со знаком в [-1, 1] в точке x из [0, 1], с линейной интерполяцией.
 */
function lookup(table: RefractionTable, x: number): number {
  if (table.maxAbs === 0) return 0;
  const p = Math.min(1, Math.max(0, x)) * (SAMPLES - 1);
  const i = Math.floor(p);
  const j = Math.min(SAMPLES - 1, i + 1);
  const k = p - i;
  return (
    (table.displacement[i] * (1 - k) + table.displacement[j] * k) / table.maxAbs
  );
}

/**
 * All lengths are in canvas pixels (CSS px multiplied by the pixel ratio).
 * Все длины в пикселях канваса (CSS px, умноженные на pixelRatio).
 */
interface FillOptions {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  specularAngle: number;
  specularWidth: number;
  edgeShadowWidth: number;
  outlineWidth: number;
}

/**
 * Fills three RGBA buffers:
 *  - mapData: displacement map (R = x, G = y, 128 = neutral),
 *  - specData: white rim highlight, lit from `specularAngle`,
 *  - shadeData: black edge shade, a thin outline plus a soft inner shadow.
 * Both overlays carry full-strength alpha, their opacity is applied by the caller.
 *
 * Заполняет три RGBA-буфера:
 *  - mapData: карта смещений (R = x, G = y, 128 = нейтрально),
 *  - specData: белый блик по контуру, свет падает под углом `specularAngle`,
 *  - shadeData: чёрная тень по краю, тонкий контур плюс мягкая внутренняя тень.
 * Оба наложения хранят альфу на полной силе, непрозрачность применяет вызывающий код.
 *
 * Optimisation: pixels deeper than the active zone (bezel, rim, shade) stay neutral and are skipped.
 * Оптимизация: пиксели глубже активной зоны (кромка, блик, тень) остаются нейтральными и пропускаются.
 */
function fillMaps(
  o: FillOptions,
  table: RefractionTable,
  mapData: Uint8ClampedArray,
  specData: Uint8ClampedArray,
  shadeData: Uint8ClampedArray,
): void {
  const { width: W, height: H, radius: R, bezel: B, specularWidth: rimW } = o;
  const shadeW = Math.max(1, o.edgeShadowWidth);
  const cx = W / 2;
  const cy = H / 2;
  const hx = W / 2 - R;
  const hy = H / 2 - R;
  const a = (o.specularAngle * Math.PI) / 180;
  const lx = Math.cos(a);
  const ly = Math.sin(a);

  // Максимальная глубина от края, где вообще есть преломление, блик или тень.
  // Все пиксели глубже этого порога — полностью плоский и прозрачный центр.
  const activeDepth = Math.max(B, rimW, shadeW, o.outlineWidth);

  // Мгновенно заполняем карту смещений нейтральным цветом rgba(128, 128, 128, 255) через 32-битное представление
  // (0xFF808080 в little-endian памяти соответствует R=128, G=128, B=128, A=255).
  // Буферы specData и shadeData уже заполнены нулями при создании ImageData.
  new Uint32Array(mapData.buffer).fill(0xff808080);

  for (let y = 0; y < H; y++) {
    const py = y + 0.5 - cy;
    const qy = Math.abs(py) - hy;

    for (let x = 0; x < W; x++) {
      const px = x + 0.5 - cx;
      const qx = Math.abs(px) - hx;

      // Быстрое отсечение плоского прямоугольника внутри панели без вызова Math.hypot
      if (qx < -activeDepth && qy < -activeDepth) continue;

      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const len = ox > 0 && oy > 0 ? Math.hypot(ox, oy) : ox + oy;
      // Расстояние со знаком до скруглённого прямоугольника (внутри отрицательное).
      const sd = len + Math.min(Math.max(qx, qy), 0) - R;

      // Пиксели снаружи или глубже активной зоны кромки пропускаем
      if (sd >= 0 || -sd >= activeDepth) continue;

      const i = (y * W + x) * 4;
      const d = -sd;
      const sx = px < 0 ? -1 : 1;
      const sy = py < 0 ? -1 : 1;
      let nx: number; // внешняя нормаль контура
      let ny: number;
      if (qx > 0 && qy > 0 && len > 0) {
        nx = (sx * ox) / len;
        ny = (sy * oy) / len;
      } else if (qx > qy) {
        nx = sx;
        ny = 0;
      } else {
        nx = 0;
        ny = sy;
      }

      if (d < B) {
        const m = lookup(table, d / B);
        mapData[i] = Math.round(128 - nx * m * 127);
        mapData[i + 1] = Math.round(128 - ny * m * 127);
      }

      const edgeAA = Math.min(1, d);

      // Блик: записываем RGB=255 только для активных пикселей края
      const c = nx * lx + ny * ly;
      const lit = Math.max(c, 0) + 0.5 * Math.max(-c, 0);
      const t = Math.max(0, 1 - d / rimW);
      const rim = t * t * (3 - 2 * t);
      const wide = 0.18 * Math.pow(Math.max(0, 1 - d / B), 2);
      const specAlpha = Math.round(
        255 * Math.min(1, lit * Math.min(1, rim + wide) * edgeAA),
      );
      if (specAlpha > 0) {
        specData[i] = 255;
        specData[i + 1] = 255;
        specData[i + 2] = 255;
        specData[i + 3] = specAlpha;
      }

      // Тень по краю (RGB уже равен 0)
      const outline = Math.max(0, 1 - d / o.outlineWidth);
      const soft = Math.pow(Math.max(0, 1 - d / shadeW), 2);
      shadeData[i + 3] = Math.round(
        255 * Math.min(1, outline + 0.4 * soft) * edgeAA,
      );
    }
  }
}

/**
 * Input of createGlassMaps. Lengths are in CSS px.
 * Вход createGlassMaps. Длины в CSS px.
 */
export interface GlassMapOptions {
  /** Panel size in CSS px. / Размер панели в CSS px. */
  width: number;
  height: number;
  radius: number;
  bezel: number;
  glassHeight: number;
  ior: number;
  strength: number;
  specularAngle: number;
  specularWidth: number;
  /** Width of the soft inner edge shadow in CSS px. / Ширина мягкой внутренней тени в CSS px. */
  edgeShadowWidth: number;
  profile: GlassProfile;
  /**
   * Encode the displacement map. Pass false where SVG backdrop filters are unsupported. Default true.
   * Строить ли карту смещений. Передайте false там, где SVG backdrop-фильтры не поддерживаются. По умолчанию true.
   */
  refraction?: boolean;
  /**
   * Pixel ratio the maps are rendered at (1 or 2), so thin lines stay crisp. Default 1.
   * Плотность пикселей, с которой строятся карты (1 или 2), чтобы тонкие линии оставались чёткими. По умолчанию 1.
   */
  pixelRatio?: number;
}

/**
 * Result of createGlassMaps.
 * Результат createGlassMaps.
 */
export interface GlassMaps {
  /** PNG data URL for feDisplacementMap. Empty string when `refraction` is false. / PNG data URL для feDisplacementMap. Пустая строка, если `refraction` равен false. */
  displacementUrl: string;
  /** PNG data URL, white with alpha, for the specular rim overlay. / PNG data URL, белый с альфой, для слоя блика. */
  specularUrl: string;
  /** PNG data URL, black with alpha, for the edge shade overlay. / PNG data URL, чёрный с альфой, для слоя тени по краю. */
  edgeShadowUrl: string;
  /** Value for feDisplacementMap `scale`. / Значение `scale` для feDisplacementMap. */
  scale: number;
  /** Largest displacement in px, before the strength multiplier. / Наибольшее смещение в px до умножения на strength. */
  maxDisplacement: number;
}

/**
 * Builds the maps on canvas. Returns null on the server or when canvas is unavailable.
 * Строит карты на канвасе. Возвращает null на сервере или когда канвас недоступен.
 */
export function createGlassMaps(o: GlassMapOptions): GlassMaps | null {
  if (typeof document === "undefined") return null;
  const k = Math.max(1, o.pixelRatio ?? 1);
  const W = Math.round(o.width * k);
  const H = Math.round(o.height * k);
  if (W < 2 || H < 2) return null;

  // Clamp the radius and the bezel to what fits into the panel.
  // Ограничиваем радиус и кромку тем, что помещается в панель.
  const wCss = o.width;
  const hCss = o.height;
  const R = Math.min(Math.max(0, o.radius), wCss / 2, hCss / 2);
  const B = Math.max(1, Math.min(o.bezel, Math.min(wCss, hCss) / 2));
  const table = computeRefractionTable(o.profile, B, o.glassHeight, o.ior);

  // Three canvases: displacement map, white rim, black edge shade.
  // Три канваса: карта смещений, белый блик, чёрная тень по краю.
  const makeCanvas = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  };
  const mapCanvas = makeCanvas();
  const specCanvas = makeCanvas();
  const shadeCanvas = makeCanvas();
  const mapCtx = mapCanvas.getContext("2d");
  const specCtx = specCanvas.getContext("2d");
  const shadeCtx = shadeCanvas.getContext("2d");
  if (!mapCtx || !specCtx || !shadeCtx) return null;

  const mapImg = mapCtx.createImageData(W, H);
  const specImg = specCtx.createImageData(W, H);
  const shadeImg = shadeCtx.createImageData(W, H);
  fillMaps(
    {
      width: W,
      height: H,
      radius: R * k,
      bezel: B * k,
      specularAngle: o.specularAngle,
      specularWidth: Math.max(0.5, o.specularWidth) * k,
      edgeShadowWidth: o.edgeShadowWidth * k,
      outlineWidth: OUTLINE_WIDTH * k,
    },
    table,
    mapImg.data,
    specImg.data,
    shadeImg.data,
  );
  mapCtx.putImageData(mapImg, 0, 0);
  specCtx.putImageData(specImg, 0, 0);
  shadeCtx.putImageData(shadeImg, 0, 0);

  return {
    displacementUrl:
      o.refraction === false ? "" : mapCanvas.toDataURL("image/png"),
    specularUrl: specCanvas.toDataURL("image/png"),
    edgeShadowUrl: shadeCanvas.toDataURL("image/png"),
    // Per the SVG spec the offset is scale * (C - 0.5), so a 0..255 channel spans +-scale/2.
    scale: ((table.maxAbs * 255) / 127) * o.strength,
    maxDisplacement: table.maxAbs,
  };
}

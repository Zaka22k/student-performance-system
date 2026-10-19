import type { ReactNode } from "react";

export interface SvgProps {
  children: ReactNode;
  size?: number | string;
  className?: string;
}

const Svg = ({ children, size = 18, className }: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export interface IconProps {
  size?: number | string;
  className?: string;
}

/** Журнал успеваемости: тетрадь с отметкой */
export const JournalIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
    <path d="M9 3v18" />
    <path d="M12 10.5l2 2 3.5-4" />
    <path d="M12 17h5" />
  </Svg>
);

/** Справочники: три книги на полке */
export const DictionariesIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect x="3" y="4" width="4" height="16" rx="1" />
    <rect x="9" y="4" width="4" height="16" rx="1" />
    <path d="M15.5 6.2l3.6-1 3.2 13.2-3.6 1z" />
    <path d="M3 8h4" />
  </Svg>
);

/** Сессия: календарь с отметкой */
export const SessionIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M9 15.5l2 2 4-4" />
  </Svg>
);

/** Аналитика: столбчатая диаграмма */
export const AnalyticsIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect x="4" y="12" width="4" height="8" rx="1" />
    <rect x="10" y="5" width="4" height="15" rx="1" />
    <rect x="16" y="9" width="4" height="11" rx="1" />
  </Svg>
);

/** Отчёты: лист с загнутым углом и строками */
export const ReportsIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </Svg>
);

export const PlusIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const TrashIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </Svg>
);

export const EditIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </Svg>
);

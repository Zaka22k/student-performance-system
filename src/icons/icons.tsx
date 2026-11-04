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

/** Главная: домик с дверью */
export const HomeIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M3.5 11.5 12 4l8.5 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    <path d="M10 20v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
  </Svg>
);

/** Журнал успеваемости: тетрадь с отметкой */
export const JournalIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
    <path d="M9 3v18" />
    <path d="M12 11l2 2 4-4" />
    <path d="M12 18h5" />
  </Svg>
);

/** Справочники: три книги на полке */
export const DictionariesIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect x="3" y="4" width="4" height="16" rx="1" />
    <rect x="9" y="4" width="4" height="16" rx="1" />
    <g strokeLinejoin="round">
      <path d="M15 6l4-1 3 14-4 1z" />
    </g>
    <path d="M3 8h4" />
    <path d="M9 8h4" />
    <path d="M15 6l4-1" />
  </Svg>
);

/** Сессия: календарь с отметкой */
export const SessionIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M9 16l2 2 4-4" />
  </Svg>
);

/** Аналитика: столбчатая диаграмма */
export const AnalyticsIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M3 21h18" />
    <rect x="4" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="5" width="4" height="16" rx="1" />
    <rect x="16" y="9" width="4" height="12" rx="1" />
  </Svg>
);

/** Отчёты: лист с загнутым углом и строками */
export const ReportsIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
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

/** Закрыть: крестик */
export const CloseIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </Svg>
);

/** Сохранить: дискета */
export const SaveIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </Svg>
);

/** Сохранить (альтернатива): галочка подтверждения */
export const CheckIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

/** Печать: принтер с листом бумаги */
export const PrintIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </Svg>
);

/** XML (просмотр/структура): документ с тегами кода < > */
export const XmlIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M10 12.5L8 14.5l2 2" />
    <path d="M14 12.5l2 2-2 2" />
  </Svg>
);

/** Администрирование: защитный щит с профилем пользователя */
export const AdminIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M12 2.5 20 5.7v5.1c0 5.2-3.2 8.5-8 10.7-4.8-2.2-8-5.5-8-10.7V5.7z" />
    <circle cx="12" cy="9" r="2" />
    <path d="M8.5 16.8c.5-2.1 1.7-3.2 3.5-3.2s3 1.1 3.5 3.2" />
  </Svg>
);

export const SettingsIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

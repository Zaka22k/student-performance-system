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

export const HomeIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </Svg>
);

export const ChevronLeftIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const ScheduleIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const GradesIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);

export const HelpIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
  </Svg>
);

export const SettingsIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </Svg>
);

export const CloseIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </Svg>
);

/* ==========================================================================
   Базовые действия (Добавить, Галочка, Удалить, Редактировать, Копировать)
   ========================================================================== */

export const PlusIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const MinusIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M5 12h14" />
  </Svg>
);

export const CheckIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M20 6L9 17l-5-5" />
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

export const CopyIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

export const SaveIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </Svg>
);

/* ==========================================================================
   Формы, Поиск и Списки (Input, Combobox, Пароли, Фильтры)
   ========================================================================== */

export const SearchIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const ChevronDownIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronUpIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="m18 15-6-6-6 6" />
  </Svg>
);

export const ChevronRightIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const EyeIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <path d="m2 2 20 20" />
  </Svg>
);

export const FilterIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Svg>
);

export const CalendarIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Svg>
);

/* ==========================================================================
   Статусы и Алерты (Инфо, Предупреждение, Ошибка, Успех)
   ========================================================================== */

export const InfoIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Svg>
);

export const WarningIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
);

export const ErrorCircleIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </Svg>
);

export const CheckCircleIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </Svg>
);

/* ==========================================================================
   Интерфейс, Файлы и Пользователь
   ========================================================================== */

export const UserIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const RefreshIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </Svg>
);

export const DownloadIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </Svg>
);

export const UploadIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </Svg>
);

export const MoreHorizontalIcon = ({ size, className }: IconProps) => (
  <Svg size={size} className={className}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </Svg>
);

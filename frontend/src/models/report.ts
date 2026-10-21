// Отчёт в том виде, в каком его отдаёт backend (/api/reports/...). Все значения уже строки.
export interface ReportColumn {
  key: string;
  title: string;
  align: "left" | "center" | "right";
  print_only?: boolean; // столбец только для печатной формы (например, место для подписи)
}

export interface Report {
  type: "group-sheet" | "student-book" | "group-summary";
  title: string;
  orientation: "portrait" | "landscape";
  params: { label: string; value: string }[];
  columns: ReportColumn[];
  rows: Record<string, string>[];
  totals: { label: string; value: string }[];
  signatures: { label: string; name: string }[];
  generated_at: string;
}

export type ReportPath = "group-sheet" | "student-book" | "group-summary";
export type ReportParams = Record<string, string>;

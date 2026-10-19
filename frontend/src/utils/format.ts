// 2026-01-11 → 11.01.2026 (строки из backend приходят как YYYY-MM-DD)
export const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

// «Иванов Иван Иванович» (отчество необязательно)
export const fullName = (p: {
  last_name: string;
  first_name: string;
  middle_name: string | null;
}): string => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

// «2026/2027, 1 семестр»
export const semesterLabel = (s: {
  academic_year_start: number;
  term_number: number;
}): string => `${s.academic_year_start}/${s.academic_year_start + 1}, ${s.term_number} семестр`;

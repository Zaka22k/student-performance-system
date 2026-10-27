export interface Semester {
  semester_id: string;
  academic_year_start: number;
  term_number: 1 | 2;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export type SemesterInput = Omit<Semester, "semester_id">;

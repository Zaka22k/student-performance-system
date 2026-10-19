export interface Group {
  group_id: string;
  group_code: string;
  group_name: string;
  education_program: string;
  admission_year: number;
  students_count: number;
}

export type GroupInput = Omit<Group, "group_id" | "students_count">;

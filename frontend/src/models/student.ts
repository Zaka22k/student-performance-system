export type StudentStatus = "active" | "academic_leave" | "expelled" | "graduated";

export interface Student {
  student_id: string;
  student_number: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  birth_date: string; // YYYY-MM-DD
  email: string | null;
  status: StudentStatus;
  group_id: string;
  group_code: string;
  group_name: string;
}

// group_id уходит на сервер числом, а приходит строкой (bigint)
export type StudentInput = Omit<
  Student,
  "student_id" | "group_id" | "group_code" | "group_name"
> & { group_id: number };

export interface Teacher {
  teacher_id: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  email: string | null;
  attestations_count: number;
}

export type TeacherInput = Omit<Teacher, "teacher_id" | "attestations_count">;

export interface Subject {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  total_hours: number;
  credits: number;
}

export type SubjectInput = Omit<Subject, "subject_id">;

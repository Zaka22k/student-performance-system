// Рейтинг студентов: все показатели рассчитываются по последним попыткам; место уникально даже при полном равенстве результатов.
export interface RatingItem {
  place: number;
  student_id: string;
  student_number: string;
  student_name: string;
  group_code: string;
  summ_balls: number;
  average_grade: number | null;
}

// Показатели считаются по итоговым результатам (последняя попытка)
export interface PerformanceStats {
  records: number; // итоговых результатов
  graded: number; // из них с оценкой (без зачётов)
  average_grade: number | null;
  success_rate: number | null; // %
  quality_rate: number | null; // % оценок 4 и 5 среди оценённых
}

export interface GroupStat extends PerformanceStats {
  group_id: string;
  group_code: string;
  group_name: string;
  students_count: number; // студентов с результатами в выбранном семестре
}

export interface SubjectStat extends PerformanceStats {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  grade_2: number;
  grade_3: number;
  grade_4: number;
  grade_5: number;
}

export interface GradeBucket {
  grade: number;
  count: number;
}

export interface SubjectsResponse {
  rows: SubjectStat[];
  distribution: GradeBucket[];
}

// src/server/analytics.ts
import type { PerformanceStats } from "@/models";

export const GRADES = [2, 3, 4, 5] as const;

export interface AnalysableRecord {
  student_id: bigint | string | number;
  subject_id: bigint | string | number;
  semester_id: bigint | string | number;
  assessment_type: string;
  attempt_number: number;
  grade: number | null;
  passed: boolean | null;
}

const round = (value: number, digits: number) => {
  const k = 10 ** digits;
  return Math.round(value * k) / k;
};

export function finalResults<T extends AnalysableRecord>(rows: T[]): T[] {
  const best = new Map<string, T>();
  for (const row of rows) {
    const key = [
      row.student_id,
      row.subject_id,
      row.semester_id,
      row.assessment_type,
    ].join("|");
    const current = best.get(key);
    if (!current || row.attempt_number > current.attempt_number) {
      best.set(key, row);
    }
  }
  return [...best.values()];
}

export const isSuccess = (r: {
  assessment_type: string;
  passed: boolean | null;
  grade: number | null;
}) =>
  r.assessment_type === "credit"
    ? r.passed === true
    : r.grade !== null && r.grade >= 3;

export interface SummarizeResult extends PerformanceStats {
  grade_counts: Record<2 | 3 | 4 | 5, number>;
}

export function summarize(records: AnalysableRecord[]): SummarizeResult {
  const graded = records.filter(
    (r): r is AnalysableRecord & { grade: number } =>
      r.grade !== null && r.grade !== undefined,
  );
  const gradeCounts = Object.fromEntries(
    GRADES.map((g) => [g, graded.filter((r) => r.grade === g).length]),
  ) as Record<2 | 3 | 4 | 5, number>;

  const successful = records.filter(isSuccess).length;
  const quality = graded.filter((r) => r.grade >= 4).length;
  const sum = graded.reduce((acc, r) => acc + r.grade, 0);

  return {
    records: records.length,
    graded: graded.length,
    average_grade: graded.length ? round(sum / graded.length, 2) : null,
    success_rate: records.length
      ? round((100 * successful) / records.length, 1)
      : null,
    quality_rate: graded.length
      ? round((100 * quality) / graded.length, 1)
      : null,
    grade_counts: gradeCounts,
  };
}

export function assignPlaces<T>(
  items: T[],
  getValue: (item: T) => number,
): (T & { place: number })[] {
  let place = 0;
  return items.map((item, index) => {
    if (index === 0 || getValue(item) !== getValue(items[index - 1])) {
      place = index + 1;
    }
    return { ...item, place };
  });
}

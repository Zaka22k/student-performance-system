// Расчёты для раздела «Аналитика». Считаются прямо из public.student_performance,
// отдельного хранилища и ETL нет, данные всегда актуальны.
//
// Правила:
//  - учитывается только итоговый результат: последняя попытка по сочетанию
//    «студент + дисциплина + семестр + вид контроля» (провал и успешная пересдача
//    не считаются двумя результатами);
//  - успешным считается экзамен, дифзачёт или курсовая с оценкой 3–5 и зачёт со «Сдано»;
//  - средняя оценка и процент качества считаются только по результатам с оценкой (зачёты не входят).

export const GRADES = [2, 3, 4, 5];

const round = (value, digits) => {
  const k = 10 ** digits;
  return Math.round(value * k) / k;
};

export function finalResults(rows) {
  const best = new Map();
  for (const row of rows) {
    const key = [row.student_id, row.subject_id, row.semester_id, row.assessment_type].join("|");
    const current = best.get(key);
    if (!current || row.attempt_number > current.attempt_number) best.set(key, row);
  }
  return [...best.values()];
}

export const isSuccess = (r) =>
  r.assessment_type === "credit" ? r.passed === true : r.grade !== null && r.grade >= 3;

// Сводка по набору итоговых результатов
export function summarize(records) {
  const graded = records.filter((r) => r.grade !== null && r.grade !== undefined);
  const gradeCounts = Object.fromEntries(GRADES.map((g) => [g, graded.filter((r) => r.grade === g).length]));
  const successful = records.filter(isSuccess).length;
  const quality = graded.filter((r) => r.grade >= 4).length;
  const sum = graded.reduce((acc, r) => acc + r.grade, 0);

  return {
    records: records.length,
    graded: graded.length,
    average_grade: graded.length ? round(sum / graded.length, 2) : null,
    success_rate: records.length ? round((100 * successful) / records.length, 1) : null,
    quality_rate: graded.length ? round((100 * quality) / graded.length, 1) : null,
    grade_counts: gradeCounts,
  };
}

// Места с учётом равных сумм: 1, 2, 2, 4 (список уже отсортирован по убыванию суммы)
export function assignPlaces(items, getValue) {
  let place = 0;
  return items.map((item, index) => {
    if (index === 0 || getValue(item) !== getValue(items[index - 1])) place = index + 1;
    return { ...item, place };
  });
}

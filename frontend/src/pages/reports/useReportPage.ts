import { useRef, useState } from "react";
import type { Report, ReportParams, ReportPath } from "@models";
import { getReport, getReportOptions, getReportUrl, type ReportOptions, type ReportOutput } from "./reports.api";
import { getErrorMessage } from "@api";

// Общая логика трёх страниц отчётов: справочники, построение отчёта и вывод (печать, PDF, XML)
export function useReportPage(path: ReportPath) {
  const [options, setOptions] = useState<ReportOptions | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  // Параметры, по которым построен показанный отчёт: кнопки печати работают с ним,
  // даже если поля формы уже изменили, но отчёт ещё не пересобрали
  const [built, setBuilt] = useState<ReportParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // Возвращает справочники, чтобы страница могла подставить значения по умолчанию
  const load = async () => {
    const loaded = await getReportOptions();
    setOptions(loaded);
    return loaded;
  };

  const build = async (params: ReportParams) => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getReport(path, params);
      if (id !== reqId.current) return;
      setReport(result);
      setBuilt(params);
    } catch (e) {
      if (id !== reqId.current) return;
      setReport(null);
      setBuilt(null);
      setError(getErrorMessage(e));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  // Вывод открывается в новой вкладке: печатная форма сама вызывает окно печати
  const open = (output: ReportOutput) => {
    if (!built) return;
    window.open(getReportUrl(path, built, output), "_blank", "noopener");
  };

  return { options, report, loading, error, load, build, open, canOutput: built !== null && !loading };
}

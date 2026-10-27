"use client";

import { useActionState, useState } from "react";
import { useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import { getReport } from "@/actions/reports";
import { getGroups } from "@/actions/groups";
import { getStudents } from "@/actions/students";
import { getSubjects } from "@/actions/subjects";
import { getSemesters } from "@/actions/semesters";
import type {
  Group,
  Report,
  ReportParams,
  ReportPath,
  Semester,
  Student,
  Subject,
} from "@/models";

export type ReportOutput = "print" | "xml";

export interface ReportOptions {
  groups: Group[];
  students: Student[];
  subjects: Subject[];
  semesters: Semester[];
}

interface BuildState {
  report: Report | null;
  built: ReportParams | null;
  error: string | null;
}

export function getReportUrl(
  path: ReportPath,
  params: ReportParams,
  output: ReportOutput,
): string {
  const search = new URLSearchParams(params);
  if (output === "print") {
    search.set("format", "html");
    search.set("print", "1");
  } else {
    search.set("format", "xml");
  }
  return `/api/reports/${path}?${search.toString()}`;
}

// Общая логика трёх страниц отчётов: справочники, построение отчёта через useActionState и вывод (печать, XML)
export function useReportPage(path: ReportPath) {
  const toast = useToast();
  const [options, setOptions] = useState<ReportOptions | null>(null);

  // Возвращает справочники, чтобы страница могла подставить значения по умолчанию
  const load = async (): Promise<ReportOptions> => {
    const [groups, students, subjects, semesters] = await Promise.all([
      getGroups(),
      getStudents(),
      getSubjects(),
      getSemesters(),
    ]);
    const loaded = { groups, students, subjects, semesters };
    setOptions(loaded);
    return loaded;
  };

  const [state, formAction, isPending] = useActionState<BuildState, FormData>(
    async (_prev, formData) => {
      const params: ReportParams = {};
      formData.forEach((val, key) => {
        if (typeof val === "string" && !key.startsWith("$ACTION")) {
          const trimmed = val.trim();
          if (trimmed !== "") {
            params[key] = trimmed;
          }
        }
      });

      try {
        const result = await getReport(path, params);
        return {
          report: result,
          built: params,
          error: null,
        };
      } catch (e) {
        const message = getErrorMessage(e);
        toast.error("Не удалось сформировать отчёт", {
          description: message,
        });
        return {
          report: null,
          built: null,
          error: message,
        };
      }
    },
    {
      report: null,
      built: null,
      error: null,
    },
  );

  // Вывод открывается в новой вкладке: печатная форма сама вызывает окно печати
  const open = (output: ReportOutput) => {
    if (!state.built) return;
    window.open(getReportUrl(path, state.built, output), "_blank", "noopener");
  };

  return {
    options,
    report: state.report,
    loading: isPending,
    error: state.error,
    load,
    formAction,
    open,
    canOutput: state.built !== null && !isPending,
  };
}

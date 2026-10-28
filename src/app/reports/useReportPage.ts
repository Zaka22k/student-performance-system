"use client";

import { useActionState } from "react";
import { useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import { getReport } from "@/actions/reports";
import type { Report, ReportParams, ReportPath } from "@/models";

export type ReportOutput = "print" | "xml";

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

export function useReportPage(path: ReportPath) {
  const toast = useToast();

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

  const open = (output: ReportOutput) => {
    if (!state.built) return;
    window.open(getReportUrl(path, state.built, output), "_blank", "noopener");
  };

  return {
    report: state.report,
    loading: isPending,
    error: state.error,
    formAction,
    open,
    canOutput: state.built !== null && !isPending,
  };
}

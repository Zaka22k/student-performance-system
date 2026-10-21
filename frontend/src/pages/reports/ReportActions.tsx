import { Button } from "@components";
import type { ReportOutput } from "./reports.api";

interface Props {
  disabled: boolean;
  onOpen: (output: ReportOutput) => void;
}

// Кнопки вывода отчёта над таблицей (в панели инструментов страницы)
export default function ReportActions({ disabled, onOpen }: Props) {
  return (
    <>
      <Button onClick={() => onOpen("print")} disabled={disabled}>
        Печать
      </Button>
      <Button onClick={() => onOpen("pdf")} disabled={disabled}>
        PDF
      </Button>
      <Button onClick={() => onOpen("xml")} disabled={disabled}>
        XML
      </Button>
      <Button onClick={() => onOpen("xml-file")} disabled={disabled}>
        Скачать XML
      </Button>
    </>
  );
}

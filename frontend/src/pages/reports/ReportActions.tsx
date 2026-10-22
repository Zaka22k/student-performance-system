import { ToolbarGroup, ToolbarButton } from "@components";
import { PrintIcon, XmlIcon } from "@icons";
import type { ReportOutput } from "./reports.api";

interface Props {
  disabled: boolean;
  onOpen: (output: ReportOutput) => void;
}

// Кнопки вывода отчёта над таблицей (в панели инструментов страницы)
export default function ReportActions({ disabled, onOpen }: Props) {
  return (
    <ToolbarGroup>
      <ToolbarButton
        icon={<PrintIcon />}
        onClick={() => onOpen("print")}
        disabled={disabled}
        aria-label="Печать"
      />
      <ToolbarButton
        icon={<XmlIcon />}
        onClick={() => onOpen("xml")}
        disabled={disabled}
        aria-label="XML"
      />
    </ToolbarGroup>
  );
}

import { ToolbarButton, ToolbarDivider, ToolbarGroup } from "@components";
import type { ReportOutput } from "./reports.api";
import { PrintIcon, PdfIcon, XmlIcon, XmlDownloadIcon } from "@icons";

interface Props {
  disabled: boolean;
  onOpen: (output: ReportOutput) => void;
}

// Кнопки вывода отчёта над таблицей (в панели инструментов страницы)
export default function ReportActions({ disabled, onOpen }: Props) {
  return (
    <>
      <ToolbarGroup>
        <ToolbarButton
          icon={<PrintIcon />}
          onClick={() => onOpen("print")}
          disabled={disabled}
        >
          Печать
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          icon={<PdfIcon />}
          onClick={() => onOpen("pdf")}
          disabled={disabled}
        >
          PDF
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          icon={<XmlIcon />}
          onClick={() => onOpen("xml")}
          disabled={disabled}
        >
          XML
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          icon={<XmlDownloadIcon />}
          onClick={() => onOpen("xml-file")}
          disabled={disabled}
        >
          Скачать XML
        </ToolbarButton>
      </ToolbarGroup>
    </>
  );
}

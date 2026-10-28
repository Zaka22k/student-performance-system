"use client";

import { MenuButton, MenuEntry } from "@ui-kit/components";
import { PrintIcon, XmlIcon } from "@/icons";
import type { ReportOutput } from "./useReportPage";

interface Props {
  disabled: boolean;
  onOpen: (output: ReportOutput) => void;
}

export default function ReportActions({ disabled, onOpen }: Props) {
  const menuItmes: MenuEntry[] = [
    {
      icon: <PrintIcon />,
      label: "Печать в PDF",
      onSelect: () => onOpen("print"),
    },
    {
      icon: <XmlIcon />,
      label: "Печать в XML",
      onSelect: () => onOpen("xml"),
    },
  ];
  return <MenuButton items={menuItmes} disabled={disabled} />;
}

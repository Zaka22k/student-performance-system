"use client";

import { Page, Button } from "@ui-kit/components";
import type { SheetOptions } from "@/models";
import SheetForm from "./SheetForm";
import { useSheetPage } from "./useSheetPage";

interface SheetPageViewProps {
  options: SheetOptions;
}

export default function SheetPageView({ options }: SheetPageViewProps) {
  const p = useSheetPage();

  return (
    <Page
      title="Формирование ведомости группы"
      toolbar={{
        trailing: (
          <Button type="submit" form={p.formId} appearance="primary">
            Сформировать
          </Button>
        ),
      }}
    >
      <SheetForm
        key={p.formKey}
        formId={p.formId}
        options={options}
        onSubmit={p.save}
      />
    </Page>
  );
}

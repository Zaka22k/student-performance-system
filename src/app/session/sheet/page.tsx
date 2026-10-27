"use client";

import { useState } from "react";
import { Page, Button } from "@ui-kit/components";
import SheetForm from "./SheetForm";
import { useSheetPage } from "./useSheetPage";

export default function SheetPage() {
  const p = useSheetPage();
  const [isPending, setIsPending] = useState(false);

  return (
    <Page
      title="Формирование ведомости группы"
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <Button
            type="submit"
            form={p.formId}
            appearance="primary"
            disabled={p.options === null || isPending}
          >
            Сформировать
          </Button>
        ),
      }}
    >
      {p.options && (
        <SheetForm
          key={p.formKey}
          formId={p.formId}
          options={p.options}
          onPendingChange={setIsPending}
          onSubmit={p.save}
        />
      )}
    </Page>
  );
}

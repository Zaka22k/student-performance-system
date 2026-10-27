"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Page, Button } from "@ui-kit/components";
import { CheckIcon } from "@/icons";
import PerformanceForm from "./PerformanceForm";
import { useEditPerformancePage } from "./useEditPerformancePage";

function EditPerformanceContent({ id }: { id?: string }) {
  const p = useEditPerformancePage(id);
  const [isPending, setIsPending] = useState(false);
  const ready = p.options !== null;

  return (
    <Page
      title={id ? "Редактирование записи" : "Новая запись"}
      onBack={p.goBack}
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <Button
            type="submit"
            form={p.formId}
            disabled={!ready || isPending}
            icon={<CheckIcon />}
            aria-label="Сохранить"
            appearance="primary"
          />
        ),
      }}
    >
      {p.options && (
        <PerformanceForm
          formId={p.formId}
          initial={p.record}
          options={p.options}
          onPendingChange={setIsPending}
          onSubmit={p.save}
          onDelete={p.openAlert}
        />
      )}
    </Page>
  );
}

export default function EditPerformancePage() {
  const params = useParams<{ id?: string }>();
  const id = typeof params?.id === "string" ? params.id : undefined;

  return <EditPerformanceContent key={id ?? "new"} id={id} />;
}

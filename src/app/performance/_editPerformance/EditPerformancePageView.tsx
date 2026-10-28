"use client";

import { Page, Button } from "@ui-kit/components";
import { CheckIcon } from "@/icons";
import type { Performance, PerformanceOptions } from "@/models";
import PerformanceForm from "./PerformanceForm";
import { useEditPerformancePage } from "./useEditPerformancePage";

interface EditPerformancePageViewProps {
  id?: string;
  options: PerformanceOptions;
  record?: Performance;
}

export default function EditPerformancePageView({
  id,
  options,
  record,
}: EditPerformancePageViewProps) {
  const p = useEditPerformancePage(id, record);

  return (
    <Page
      title={id ? "Редактирование записи" : "Новая запись"}
      onBack={p.goBack}
      toolbar={{
        trailing: (
          <Button
            type="submit"
            form={p.formId}
            icon={<CheckIcon />}
            aria-label="Сохранить"
            appearance="primary"
          />
        ),
      }}
    >
      <PerformanceForm
        formId={p.formId}
        initial={record}
        options={options}
        onSubmit={p.save}
        onDelete={p.openAlert}
      />
    </Page>
  );
}

import { useParams } from "react-router-dom";
import { Page, Button } from "@components";
import { CheckIcon } from "@icons";
import PerformanceForm from "./PerformanceForm";
import { useEditPerformancePage } from "./useEditPerformancePage";

function EditPerformanceContent({ id }: { id?: string }) {
  const p = useEditPerformancePage(id);
  const ready = p.options !== null;

  return (
    <Page
      title={id ? "Редактирование записи" : "Новая запись"}
      showBackButton
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <>
            <Button
              onClick={p.submit}
              disabled={!ready || p.saving}
              icon={<CheckIcon />}
              aria-label="Сохранить"
              appearance="primary"
            />
          </>
        ),
      }}
    >
      {p.options && (
        <PerformanceForm
          initial={p.record}
          options={p.options}
          formRef={p.formRef}
          isSaving={p.saving}
          error={p.error}
          onSubmit={p.save}
          onDelete={p.openAlert}
        />
      )}
    </Page>
  );
}

// Маршруты /performance/new и /performance/:id/edit. key пересоздаёт страницу при смене id:
// иначе React переиспользовал бы компонент, и onNavigate не загрузил бы другую запись.
export default function EditPerformancePage() {
  const { id } = useParams();
  return <EditPerformanceContent key={id ?? "new"} id={id} />;
}

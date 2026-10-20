import { Page, Button } from "@components";
import SheetForm from "./SheetForm";
import { useSheetPage } from "./useSheetPage";

export default function SheetPage() {
  const p = useSheetPage();

  return (
    <Page
      title="Формирование ведомости группы"
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <Button onClick={p.submit} disabled={p.options === null || p.saving}>
            Сформировать
          </Button>
        ),
      }}
    >
      {p.options && (
        <SheetForm
          key={p.formKey}
          options={p.options}
          formRef={p.formRef}
          isSaving={p.saving}
          error={p.error}
          onSubmit={p.save}
        />
      )}
    </Page>
  );
}

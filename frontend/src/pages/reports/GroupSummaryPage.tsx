import { useRef, useState, type FormEvent } from "react";
import { Page, Button, ComboBox } from "@components";
import { semesterLabel } from "@utils";
import ReportActions from "./ReportActions";
import ReportView from "./ReportView";
import { useOptionValidity } from "./useOptionValidity";
import { useReportPage } from "./useReportPage";
import styles from "./Reports.module.css";

// Сводный отчёт по группе: группа и семестр
export default function GroupSummaryPage() {
  const p = useReportPage("group-summary");
  const { groups = [], semesters = [] } = p.options ?? {};

  const [groupId, setGroupId] = useState("");
  const [semesterId, setSemesterId] = useState("");

  const groupRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);

  useOptionValidity(groupRef, groups.some((g) => g.group_id === groupId), "Выберите группу из списка");
  useOptionValidity(semesterRef, semesters.some((s) => s.semester_id === semesterId), "Выберите семестр из списка");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void p.build({ group_id: groupId, semester_id: semesterId });
  };

  // По умолчанию подставляем последний семестр (справочник упорядочен по времени)
  const load = async () => {
    const loaded = await p.load();
    setSemesterId(loaded.semesters.at(-1)?.semester_id ?? "");
  };

  return (
    <Page
      title="Сводный отчёт по группе"
      onNavigate={load}
      toolbar={{ trailing: <ReportActions disabled={!p.canOutput} onOpen={p.open} /> }}
    >
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={submit}>
          <ComboBox
            ref={groupRef}
            className={styles.field}
            label="Группа"
            options={groups}
            getOptionValue={(g) => g.group_id}
            getOptionLabel={(g) => g.group_code}
            value={groupId}
            required
            placeholder="Выберите группу"
            onChange={(value) => setGroupId(value)}
          />
          <ComboBox
            ref={semesterRef}
            className={styles.field}
            label="Семестр"
            options={semesters}
            getOptionValue={(s) => s.semester_id}
            getOptionLabel={(s) => semesterLabel(s)}
            value={semesterId}
            required
            placeholder="Выберите семестр"
            onChange={(value) => setSemesterId(value)}
          />
          <Button type="submit" disabled={p.loading}>
            Сформировать
          </Button>
        </form>

        <ReportView report={p.report} loading={p.loading} error={p.error} />
      </div>
    </Page>
  );
}

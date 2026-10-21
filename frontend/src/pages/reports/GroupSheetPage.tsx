import { useRef, useState, type FormEvent } from "react";
import { Page, Button, ComboBox } from "@components";
import type { AssessmentType } from "@models";
import { semesterLabel } from "@utils";
import { ASSESSMENT_TYPES } from "../performance/constants";
import ReportActions from "./ReportActions";
import ReportView from "./ReportView";
import { useOptionValidity } from "./useOptionValidity";
import { useReportPage } from "./useReportPage";
import styles from "./Reports.module.css";

// Ведомость группы по дисциплине: группа, дисциплина, семестр, вид контроля
export default function GroupSheetPage() {
  const p = useReportPage("group-sheet");
  const { groups = [], subjects = [], semesters = [] } = p.options ?? {};

  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [type, setType] = useState<AssessmentType | "">("exam");

  const groupRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);

  useOptionValidity(groupRef, groups.some((g) => g.group_id === groupId), "Выберите группу из списка");
  useOptionValidity(subjectRef, subjects.some((s) => s.subject_id === subjectId), "Выберите дисциплину из списка");
  useOptionValidity(semesterRef, semesters.some((s) => s.semester_id === semesterId), "Выберите семестр из списка");
  useOptionValidity(typeRef, ASSESSMENT_TYPES.some((t) => t.value === type), "Выберите вид контроля из списка");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void p.build({ group_id: groupId, subject_id: subjectId, semester_id: semesterId, assessment_type: type });
  };

  // По умолчанию подставляем последний семестр (справочник упорядочен по времени)
  const load = async () => {
    const loaded = await p.load();
    setSemesterId(loaded.semesters.at(-1)?.semester_id ?? "");
  };

  return (
    <Page
      title="Ведомость группы по дисциплине"
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
            ref={subjectRef}
            className={styles.wideField}
            label="Дисциплина"
            options={subjects}
            getOptionValue={(s) => s.subject_id}
            getOptionLabel={(s) => s.subject_name}
            value={subjectId}
            required
            placeholder="Выберите дисциплину"
            onChange={(value) => setSubjectId(value)}
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
          <ComboBox
            ref={typeRef}
            className={styles.field}
            label="Вид контроля"
            options={ASSESSMENT_TYPES}
            getOptionValue={(t) => t.value}
            getOptionLabel={(t) => t.label}
            value={type}
            required
            placeholder="Выберите вид контроля"
            onChange={(value) => setType(value as AssessmentType)}
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

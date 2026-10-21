import { useRef, useState, type FormEvent } from "react";
import { Page, Button, ComboBox } from "@components";
import { fullName, semesterLabel } from "@utils";
import ReportActions from "./ReportActions";
import ReportView from "./ReportView";
import { useOptionValidity } from "./useOptionValidity";
import { useReportPage } from "./useReportPage";
import styles from "./Reports.module.css";

// Зачётная книжка студента: студент и семестр (пусто — все семестры)
export default function StudentBookPage() {
  const p = useReportPage("student-book");
  const { students = [], semesters = [] } = p.options ?? {};

  const [studentId, setStudentId] = useState("");
  const [semesterId, setSemesterId] = useState(""); // пусто — все семестры

  const studentRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);

  useOptionValidity(
    studentRef,
    students.some((s) => s.student_id === studentId),
    "Выберите студента из списка",
  );
  useOptionValidity(
    semesterRef,
    semesterId === "" || semesters.some((s) => s.semester_id === semesterId),
    "Выберите семестр из списка",
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void p.build({
      student_id: studentId,
      ...(semesterId ? { semester_id: semesterId } : {}),
    });
  };

  return (
    <Page
      title="Зачётная книжка студента"
      onNavigate={async () => {
        await p.load();
      }}
      toolbar={{
        trailing: <ReportActions disabled={!p.canOutput} onOpen={p.open} />,
      }}
    >
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={submit}>
          <ComboBox
            ref={studentRef}
            className={styles.wideField}
            label="Студент"
            options={students}
            getOptionValue={(s) => s.student_id}
            getOptionLabel={(s) => `${fullName(s)} (${s.student_number})`}
            value={studentId}
            required
            placeholder="Выберите студента"
            onChange={(value) => setStudentId(value)}
          />
          <ComboBox
            ref={semesterRef}
            className={styles.field}
            label="Семестр"
            options={semesters}
            getOptionValue={(s) => s.semester_id}
            getOptionLabel={(s) => semesterLabel(s)}
            value={semesterId}
            placeholder="Все семестры"
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

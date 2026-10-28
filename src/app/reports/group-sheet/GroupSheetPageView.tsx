"use client";

import { useRef, useState } from "react";
import { Page, Button, ComboBox } from "@ui-kit/components";
import type { AssessmentType, Group, Semester, Subject } from "@/models";
import { semesterLabel } from "@/utils";
import { ASSESSMENT_TYPES } from "../../performance/constants";
import ReportActions from "../ReportActions";
import ReportView from "../ReportView";
import { useOptionValidity } from "../useOptionValidity";
import { useReportPage } from "../useReportPage";
import styles from "../Reports.module.css";

interface GroupSheetPageViewProps {
  groups: Group[];
  subjects: Subject[];
  semesters: Semester[];
}

export default function GroupSheetPageView({
  groups,
  subjects,
  semesters,
}: GroupSheetPageViewProps) {
  const p = useReportPage("group-sheet");

  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [semesterId, setSemesterId] = useState(() =>
    semesters[0]?.semester_id !== undefined
      ? String(semesters[0].semester_id)
      : "",
  );
  const [type, setType] = useState<AssessmentType | "">("exam");

  const groupRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const semesterRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);

  useOptionValidity(
    groupRef,
    groups.some((g) => String(g.group_id) === groupId),
    "Выберите группу из списка",
  );
  useOptionValidity(
    subjectRef,
    subjects.some((s) => String(s.subject_id) === subjectId),
    "Выберите дисциплину из списка",
  );
  useOptionValidity(
    semesterRef,
    semesters.some((s) => String(s.semester_id) === semesterId),
    "Выберите семестр из списка",
  );
  useOptionValidity(
    typeRef,
    ASSESSMENT_TYPES.some((t) => t.value === type),
    "Выберите вид контроля из списка",
  );

  return (
    <Page
      title="Ведомость группы по дисциплине"
      toolbar={{
        trailing: <ReportActions disabled={!p.canOutput} onOpen={p.open} />,
      }}
    >
      <div className={styles.layout}>
        <form className={styles.form} action={p.formAction}>
          <ComboBox
            ref={groupRef}
            className={styles.field}
            label="Группа"
            name="group_id"
            options={groups}
            getOptionValue={(g) => String(g.group_id)}
            getOptionLabel={(g) => g.group_code}
            value={groupId}
            required
            placeholder="Выберите группу"
            onChange={(value) => setGroupId(value)}
            disabled={p.loading}
          />
          <ComboBox
            ref={subjectRef}
            className={styles.wideField}
            label="Дисциплина"
            name="subject_id"
            options={subjects}
            getOptionValue={(s) => String(s.subject_id)}
            getOptionLabel={(s) => s.subject_name}
            value={subjectId}
            required
            placeholder="Выберите дисциплину"
            onChange={(value) => setSubjectId(value)}
            disabled={p.loading}
          />
          <ComboBox
            ref={semesterRef}
            className={styles.field}
            label="Семестр"
            name="semester_id"
            options={semesters}
            getOptionValue={(s) => String(s.semester_id)}
            getOptionLabel={(s) => semesterLabel(s)}
            value={semesterId}
            required
            placeholder="Выберите семестр"
            onChange={(value) => setSemesterId(value)}
            disabled={p.loading}
          />
          <ComboBox
            ref={typeRef}
            className={styles.field}
            label="Вид контроля"
            name="assessment_type"
            options={ASSESSMENT_TYPES}
            getOptionValue={(t) => t.value}
            getOptionLabel={(t) => t.label}
            value={type}
            required
            placeholder="Выберите вид контроля"
            onChange={(value) => setType(value as AssessmentType)}
            disabled={p.loading}
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

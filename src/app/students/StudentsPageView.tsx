"use client";

import { List, Page, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import type { Student, Group } from "@/models";
import StudentCard from "./StudentCard";
import { useStudentsPage } from "./useStudentsPage";
import styles from "./StudentsPage.module.css";

interface StudentsPageViewProps {
  initialStudents: Student[];
  groups: Group[];
}

export default function StudentsPageView({
  initialStudents,
  groups,
}: StudentsPageViewProps) {
  const p = useStudentsPage(initialStudents, groups);

  return (
    <Page
      title="Студенты"
      toolbar={{
        trailing: (
          <>
            <SearchField
              placeholder="Поиск студентов"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить студента"
              onClick={() => p.openForm()}
            />
          </>
        ),
      }}
    >
      <List
        aria-label="Студенты"
        className={styles.studentsList}
        layout="grid"
        items={p.students}
        getItemId={(student) => student.student_id}
        itemWidth={260}
        itemHeight={128}
        gap={16}
        selectable
        itemAppearance="none"
        resetKey={p.query}
        emptyContent={
          p.loadFailed
            ? "Не удалось загрузить список студентов"
            : "Студенты не найдены"
        }
        onItemActivate={(student) => p.openForm(student)}
        itemMenu={({ item: student }) => [
          {
            id: "edit",
            label: "Редактировать",
            icon: <EditIcon />,
            onSelect: () => p.openForm(student),
          },
          { type: "separator" },
          {
            id: "delete",
            danger: true,
            label: "Удалить",
            icon: <TrashIcon />,
            onSelect: () => p.openAlert(student),
          },
        ]}
        renderItem={(student, state) => (
          <StudentCard
            student={student}
            selected={state.selected}
            active={state.active}
          />
        )}
      />
    </Page>
  );
}

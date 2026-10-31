"use client";

import { List, Page, Button, SearchField } from "@ui-kit/components";
import { PlusIcon, EditIcon, TrashIcon } from "@/icons";
import type { Teacher } from "@/models";
import TeacherCard from "./TeacherCard";
import { useTeachersPage } from "./useTeachersPage";
import styles from "./TeachersPage.module.css";

interface TeachersPageViewProps {
  initialTeachers: Teacher[];
}

export default function TeachersPageView({
  initialTeachers,
}: TeachersPageViewProps) {
  const p = useTeachersPage(initialTeachers);

  return (
    <Page
      title="Преподаватели"
      toolbar={{
        trailing: (
          <>
            <SearchField
              placeholder="Поиск преподавателей"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
            />
            <Button
              icon={<PlusIcon />}
              aria-label="Добавить преподавателя"
              onClick={() => p.openForm()}
            />
          </>
        ),
      }}
    >
      <List
        aria-label="Преподаватели"
        className={styles.teachersList}
        layout="grid"
        items={p.teachers}
        getItemId={(teacher) => teacher.teacher_id}
        itemWidth={260}
        itemHeight={128}
        gap={16}
        selectable
        itemAppearance="none"
        resetKey={p.query}
        emptyContent={
          p.loadFailed
            ? "Не удалось загрузить список преподавателей"
            : "Преподаватели не найдены"
        }
        onItemActivate={(teacher) => p.openForm(teacher)}
        itemMenu={({ item: teacher }) => [
          {
            id: "edit",
            label: "Редактировать",
            icon: <EditIcon />,
            onSelect: () => p.openForm(teacher),
          },
          { type: "separator" },
          {
            id: "delete",
            danger: true,
            label: "Удалить",
            icon: <TrashIcon />,
            onSelect: () => p.openAlert(teacher),
          },
        ]}
        renderItem={(teacher, state) => (
          <TeacherCard
            teacher={teacher}
            selected={state.selected}
            active={state.active}
          />
        )}
      />
    </Page>
  );
}

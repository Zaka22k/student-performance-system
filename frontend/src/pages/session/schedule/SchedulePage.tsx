import { Page, DataGrid, ComboBox, SearchField } from "@components";
import { semesterLabel } from "@utils";
import { scheduleColumns, scheduleRowId } from "./columns";
import { useSchedulePage } from "./useSchedulePage";
import styles from "./SchedulePage.module.css";

export default function SchedulePage() {
  const p = useSchedulePage();

  return (
    <Page
      title="Расписание экзаменов и зачётов"
      onNavigate={p.load}
      toolbar={{
        trailing: (
          <SearchField
            placeholder="Поиск по расписанию"
            value={p.query}
            onChange={(e) => p.setQuery(e.target.value)}
          />
        ),
      }}
    >
      <div className={styles.layout}>
        <div className={styles.params}>
          <ComboBox
            className={styles.param}
            label="Семестр"
            options={p.semesters}
            getOptionValue={(s) => s.semester_id}
            getOptionLabel={(s) => semesterLabel(s)}
            value={p.semesterId}
            placeholder="Выберите семестр"
            onChange={(value) => p.setSemesterId(value)}
          />
          <ComboBox
            className={styles.param}
            label="Группа"
            options={p.groups}
            getOptionValue={(g) => g.group_id}
            getOptionLabel={(g) => g.group_code}
            value={p.groupId}
            placeholder="Все группы"
            onChange={(value) => p.setGroupId(value)}
          />
        </div>
        <div className={styles.grid}>
          <DataGrid
            aria-label="Расписание экзаменов и зачётов"
            rows={p.rows}
            columns={scheduleColumns}
            getRowId={scheduleRowId}
            resetKey={`${p.semesterId}|${p.groupId}|${p.query}`}
            emptyContent={
              p.loadFailed ? "Не удалось загрузить расписание" : "Экзаменов и зачётов не найдено"
            }
          />
        </div>
      </div>
    </Page>
  );
}

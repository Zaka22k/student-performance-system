import { ProgressRing } from "@ui-kit/components";

export default function AppLoading() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        padding: 24,
      }}
    >
      <ProgressRing loading size={32} aria-label="Загрузка страницы" />
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Page, Button } from "@components";
import styles from "./NotFoundPage.module.css";

// Страница для несуществующих адресов: маршрут path="*" в AppRoutes
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Page title="Страница не найдена">
      <div className={styles.root}>
        <div className={styles.code} aria-hidden="true">
          404
        </div>
        <p className={`BodyTextBlockStyle ${styles.text}`}>
          Такой страницы нет. Возможно, адрес набран с ошибкой или страница была удалена.
        </p>
        <div className={styles.actions}>
          <Button onClick={() => navigate(-1)}>Назад</Button>
          <Button onClick={() => navigate("/")}>На главную</Button>
        </div>
      </div>
    </Page>
  );
}

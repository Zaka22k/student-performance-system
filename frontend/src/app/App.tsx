import { BrowserRouter } from "react-router-dom";
import { ModalProvider } from "@components";
import AppRoutes from "./AppRoutes";

export default function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ModalProvider>
  );
}

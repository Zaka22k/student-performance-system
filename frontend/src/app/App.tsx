import { BrowserRouter } from "react-router-dom";
import { ModalProvider, ToastProvider } from "@components";
import AppRoutes from "./AppRoutes";

export default function App() {
  return (
    <ToastProvider position="top-center" duration={3000} limit={5}>
      <ModalProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ModalProvider>
    </ToastProvider>
  );
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import Modal, { type ModalProps, type ModalFormRenderProps } from "./Modal";

export type OpenModalOptions = Omit<
  ModalProps,
  "isOpen" | "onClose" | "children"
> & {
  content: ReactNode | ((props: ModalFormRenderProps) => ReactNode);
  onClose?: () => void;
};

interface ModalContextValue {
  openModal: (options: OpenModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenModalOptions | null>(null);

  const openModal = useCallback((newOptions: OpenModalOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    options?.onClose?.();
  }, [options]);

  const contextValue = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      {options && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={options.title}
          actionText={options.actionText}
          actionAppearance={options.actionAppearance}
          onAction={options.onAction}
          isSubmitting={options.isSubmitting}
          error={options.error}
          onError={options.onError}
          errorMessage={options.errorMessage}
          width={options.width}
          closeOnBackdropClick={options.closeOnBackdropClick}
        >
          {options.content}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal должен использоваться внутри <ModalProvider>");
  }
  return context;
};

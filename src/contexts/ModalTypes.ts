export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  showCancel: boolean;
}

export interface ModalContextType {
  showModal: (config: Partial<ModalState>) => void;
  hideModal: () => void;
  showAlert: (message: string, title?: string, type?: 'warning' | 'danger' | 'info' | 'success') => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    title?: string,
    type?: 'warning' | 'danger' | 'info' | 'success',
    confirmText?: string,
    cancelText?: string
  ) => void;
  showDeleteConfirm: (
    message: string,
    onConfirm: () => void,
    title?: string
  ) => void;
}

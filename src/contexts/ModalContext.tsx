import React, { useState, type ReactNode } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import { ModalContext } from './ModalContextProvider';
import type { ModalState } from './ModalTypes';

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'warning',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: () => { },
  onCancel: () => { },
  isLoading: false,
  showCancel: true,
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);

  const showModal = (config: Partial<ModalState>) => {
    setModalState(prev => ({
      ...prev,
      ...config,
      isOpen: true,
    }));
  };

  const hideModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const showAlert = (
    message: string,
    title: string = 'Alert',
    type: 'warning' | 'danger' | 'info' | 'success' = 'info'
  ) => {
    showModal({
      title,
      message,
      type,
      confirmText: 'OK',
      showCancel: false,
      onConfirm: hideModal,
      onCancel: hideModal,
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title: string = 'Confirm',
    type: 'warning' | 'danger' | 'info' | 'success' = 'warning',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showModal({
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        hideModal();
      },
      onCancel: hideModal,
    });
  };

  const showDeleteConfirm = (
    message: string,
    onConfirm: () => void,
    title: string = 'Delete Confirmation'
  ) => {
    showConfirm(
      message,
      onConfirm,
      title,
      'danger',
      'Delete',
      'Cancel'
    );
  };

  const handleConfirm = () => {
    modalState.onConfirm();
  };


  return (
    <ModalContext.Provider
      value={{
        showModal,
        hideModal,
        showAlert,
        showConfirm,
        showDeleteConfirm,
      }}
    >
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isLoading={modalState.isLoading}
        showCancel={modalState.showCancel}
      />
    </ModalContext.Provider>
  );
};

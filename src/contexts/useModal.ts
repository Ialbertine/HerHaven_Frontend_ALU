import { useContext } from 'react';
import { ModalContext } from './ModalContextProvider';
import type { ModalContextType } from './ModalTypes';

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

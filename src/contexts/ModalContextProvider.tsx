import { createContext } from 'react';
import type { ModalContextType } from './ModalTypes';

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

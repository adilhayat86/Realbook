// UI store using Zustand
// Manages UI state (modals, loading states, etc.)

import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  activeModal: string | null;
  modalData: any;
  setLoading: (loading: boolean) => void;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  activeModal: null,
  modalData: null,
  toast: null,
  setLoading: (isLoading) => set({ isLoading }),
  openModal: (modal, data) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  showToast: (message, type = 'info') =>
    set({ toast: { message, type, visible: true } }),
  hideToast: () => set({ toast: null }),
}));

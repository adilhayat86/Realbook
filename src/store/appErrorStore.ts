import { create } from 'zustand';

interface AppErrorState {
  message: string;
  showError: (message: string) => void;
  clearError: () => void;
}

export const useAppErrorStore = create<AppErrorState>((set) => ({
  message: '',
  showError: (message) => set({ message }),
  clearError: () => set({ message: '' }),
}));

export function reportAppError(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const message = error instanceof Error ? error.message : fallback;
  useAppErrorStore.getState().showError(message);
}

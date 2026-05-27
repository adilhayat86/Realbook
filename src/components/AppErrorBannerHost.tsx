import React from 'react';
import { AppErrorBanner } from './AppErrorBanner';
import { useAppErrorStore } from '@/store/appErrorStore';

export function AppErrorBannerHost() {
  const { message, clearError } = useAppErrorStore();

  return <AppErrorBanner message={message} onDismiss={clearError} />;
}

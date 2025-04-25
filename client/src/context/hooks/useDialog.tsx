import { useState, useCallback } from 'react';
import type { DialogType } from '../Types';

const defaultDialog: DialogType = {
  open: false,
  type: 'notice',
  params: {
    title: '',
    component: <></>,
    confirm: () => new Promise(res => res(true)),
    cancel: () => new Promise(res => res(true)),
  },
};

export function useDialog(initial: DialogType = defaultDialog) {
  const [dialog, setDialog] = useState<DialogType>(initial);

  const handleCloseDialog = useCallback(() => {
    setDialog(d => ({ ...d, open: false }));
  }, []);

  return { dialog, setDialog, handleCloseDialog };
}

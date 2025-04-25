import { useState, useCallback } from 'react';
import type { SnackBarType, OpenSnackBarType } from '../Types';

const defaultSnackBar: SnackBarType = {
  open: false,
  type: 'success',
  message: '',
  vertical: 'top',
  horizontal: 'right',
  autoHideDuration: 1000,
};

export function useSnackBar(initial: SnackBarType = defaultSnackBar) {
  const [snackBar, setSnackBar] = useState<SnackBarType>(initial);

  const openSnackBar: OpenSnackBarType = useCallback(
    (
      message = '',
      type = 'success',
      autoHideDuration: number | null | undefined = 5000,
      position = { vertical: 'top', horizontal: 'right' }
    ) => {
      setSnackBar({
        open: true,
        message,
        type,
        autoHideDuration,
        ...position,
      });
    },
    []
  );

  const handleSnackBarClose = useCallback(() => {
    setSnackBar(v => ({ ...v, open: false }));
  }, []);

  return { snackBar, setSnackBar, openSnackBar, handleSnackBarClose };
}

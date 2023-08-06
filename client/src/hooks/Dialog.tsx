import { ReactElement, useContext } from 'react';
import { rootContext } from '@/context';

export const useInsertDialogHook = () => {
  const { setDialog } = useContext(rootContext);

  const handleInsertDialog = (
    // stepper container, contains all contents
    component: ReactElement
  ) => {
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component,
      },
    });
  };

  return {
    handleInsertDialog,
  };
};

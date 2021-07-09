import { ReactElement, useContext } from 'react';
import { rootContext } from '../context/Root';

export const useInsertHook = () => {
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

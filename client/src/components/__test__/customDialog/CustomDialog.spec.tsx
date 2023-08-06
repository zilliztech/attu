import { screen, fireEvent, render } from '@testing-library/react';
import { DialogType } from '@/context';
import CustomDialog from '../../customDialog/CustomDialog';
import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: any) => key,
  }),
}));

vi.mock('@material-ui/core/Dialog', () => {
  return {
    default: (props: any) => {
      return <div id="dialog-wrapper">{props.children}</div>;
    },
  };
});

vi.mock('@material-ui/core/DialogTitle', () => {
  return {
    default: (props: any) => {
      return <div id="dialog-title">{props.children}</div>;
    },
  };
});

vi.mock('@material-ui/core/DialogContent', () => {
  return {
    default: (props: any) => {
      return <div id="dialog-content">{props.children}</div>;
    },
  };
});

vi.mock('@material-ui/core/DialogActions', () => {
  return {
    default: (props: any) => {
      return <div id="dialog-actions">{props.children}</div>;
    },
  };
});

describe('Test Custom Dialog', () => {
  it('Test notice dialog ', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    const params: DialogType = {
      open: true,
      type: 'notice',
      params: {
        title: 'delete',
        confirm: handleConfirm,
        component: <div>123</div>,
      },
    };

    const res = render(
      <CustomDialog {...params} onClose={handleClose}></CustomDialog>
    );

    expect(res.getByText(params.params.title!).textContent).toEqual(
      params.params.title
    );

    expect(res.getByText('123').textContent).toEqual('123');

    fireEvent.click(screen.getByText('cancel'));
    fireEvent.click(screen.getByText('confirm'));

    expect(handleClose).toBeCalledTimes(1);
    expect(handleConfirm).toBeCalledTimes(1);
  });

  it('Test Custom dialog ', () => {
    const handleClose = vi.fn();

    const params: DialogType = {
      open: true,
      type: 'custom',
      params: {
        component: <div>custom</div>,
      },
    };

    const res = render(
      <CustomDialog {...params} onClose={handleClose}></CustomDialog>
    );

    expect(res.getByText('custom').textContent).toEqual('custom');
  });
});

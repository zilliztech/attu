import { fireEvent } from '@testing-library/react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { DialogType } from '../../../context/Types';
import CustomDialog from '../../customDialog/CustomDialog';
import { vi } from 'vitest';

let container: any = null;

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
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

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
    act(() => {
      render(
        <CustomDialog {...params} onClose={handleClose}></CustomDialog>,
        container
      );
    });

    expect(container.querySelector('#dialog-title').textContent).toEqual(
      params.params.title
    );

    expect(container.querySelector('#dialog-content').textContent).toEqual(
      '123'
    );

    container
      .querySelectorAll('button')
      .forEach((v: any) => fireEvent.click(v));
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
    act(() => {
      render(
        <CustomDialog {...params} onClose={handleClose}></CustomDialog>,
        container
      );
    });

    expect(container.querySelector('#dialog-wrapper').textContent).toEqual(
      'custom'
    );
  });
});

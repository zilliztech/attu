import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { SnackBarType } from '../../../context/Types';
import CustomSnackBar from '../../customSnackBar/CustomSnackBar';
import { vi } from 'vitest';

let container: any = null;

vi.mock('@material-ui/core/Snackbar', () => {
  return (props: any) => {
    return <div id="snackbar">{props.children}</div>;
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

  it('Test Custom dialog ', () => {
    const params: SnackBarType = {
      open: false,
      type: 'success',
      message: 'test',
      vertical: 'top',
      horizontal: 'center',
      autoHideDuration: 2000,
    };
    const handleClose = vi.fn();
    act(() => {
      render(<CustomSnackBar {...params} onClose={handleClose} />, container);
    });

    expect(container.querySelector('#snackbar').textContent).toEqual(
      params.message
    );
  });
});

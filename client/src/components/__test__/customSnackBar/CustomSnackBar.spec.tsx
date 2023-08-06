import { render, screen } from '@testing-library/react';
import { SnackBarType } from '@/context';
import CustomSnackBar from '../../customSnackBar/CustomSnackBar';
import { vi } from 'vitest';

describe('Test Custom Dialog', () => {
  it('Test Custom dialog ', () => {
    const params: SnackBarType = {
      open: true,
      type: 'success',
      message: 'test',
      vertical: 'top',
      horizontal: 'center',
      autoHideDuration: 2000,
    };
    const handleClose = vi.fn();
    render(<CustomSnackBar {...params} onClose={handleClose} />);
    expect(screen.queryByText('test')?.textContent).toEqual(params.message);
  });
});

import { screen, render, fireEvent } from '@testing-library/react';
import DeleteTemplate from '../../customDialog/DeleteDialogTemplate';
import provideTheme from '../utils/provideTheme';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

describe('test delete dialog template component', () => {
  const mockDeleteFn = jest.fn();
  const mockCancelFn = jest.fn();

  beforeEach(() => {
    render(
      provideTheme(
        <I18nextProvider i18n={i18n}>
          <DeleteTemplate
            title="delete title"
            text="delete text"
            label="delete"
            handleDelete={mockDeleteFn}
            handleCancel={mockCancelFn}
          />
        </I18nextProvider>
      )
    );
  });

  it('renders default state', () => {
    expect(screen.getByText('delete title')).toBeInTheDocument();
    expect(screen.getByText('delete text')).toBeInTheDocument();
  });

  it('checks button disabled status and callback when input value change', () => {
    // Material Textfield role should be textbox
    const input = screen.getByRole('textbox');
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.change(input, { target: { value: 'test' } });
    expect(deleteBtn).toBeDisabled();
    fireEvent.change(input, { target: { value: 'delete' } });
    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);
    expect(mockDeleteFn).toBeCalledTimes(1);
  });

  it('checks cancel callback', () => {
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(cancelBtn);
    expect(mockCancelFn).toBeCalledTimes(1);
  });
});

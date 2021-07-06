import { screen, render, fireEvent } from '@testing-library/react';
import DialogTemplate from '../../customDialog/DialogTemplate';
import provideTheme from '../utils/provideTheme';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

describe('test dialog template component', () => {
  const mockCancelFn = jest.fn();
  const mockConfirmFn = jest.fn();

  it('renders default state and callbacks', () => {
    render(
      provideTheme(
        <I18nextProvider i18n={i18n}>
          <DialogTemplate
            title="dialog template"
            handleCancel={mockCancelFn}
            handleConfirm={mockConfirmFn}
          >
            dialog content
          </DialogTemplate>
        </I18nextProvider>
      )
    );

    expect(screen.getByText('dialog template')).toBeInTheDocument();
    expect(screen.getByText('dialog content')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockCancelFn).toBeCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(mockConfirmFn).toBeCalledTimes(1);
  });

  it('checks confirm button disable', () => {
    render(
      provideTheme(
        <I18nextProvider i18n={i18n}>
          <DialogTemplate
            title="dialog template"
            handleCancel={mockCancelFn}
            handleConfirm={mockConfirmFn}
            confirmDisabled={true}
          >
            dialog content
          </DialogTemplate>
        </I18nextProvider>
      )
    );

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });
});

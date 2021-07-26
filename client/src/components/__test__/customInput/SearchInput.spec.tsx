import { fireEvent, render } from '@testing-library/react';
import SearchInput from '../../customInput/SearchInput';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

describe('test search input component', () => {
  it('renders default state', () => {
    const mockSearchFn = jest.fn();
    const container = render(
      <I18nextProvider i18n={i18n}>
        <SearchInput searchText="search text" onSearch={mockSearchFn} />
      </I18nextProvider>
    );

    // material textfield input role is textbox
    expect(container.getByRole('textbox')).toBeInTheDocument();
    expect(container.getByRole('textbox')).toHaveValue('search text');
  });

  it('checks input value change event', () => {
    const mockSearchFn = jest.fn();
    const container = render(
      <I18nextProvider i18n={i18n}>
        <SearchInput onSearch={mockSearchFn} />
      </I18nextProvider>
    );

    const input = container.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'search change test' } });
    expect(input).toHaveValue('search change test');
    // mock Enter key press event
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
    expect(mockSearchFn).toBeCalledTimes(1);
  });
});

import { fireEvent, render } from '@testing-library/react';
import SearchInput from '../../customInput/SearchInput';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

describe('test search input component', () => {
  it('renders default state', () => {
    const mockSearchFn = jest.fn();
    const container = render(
      <I18nextProvider i18n={i18n}>
        <SearchInput onSearch={mockSearchFn} />
      </I18nextProvider>
    );
  });
});

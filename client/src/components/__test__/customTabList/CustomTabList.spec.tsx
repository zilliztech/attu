import { render } from '@testing-library/react';
import CustomTabList from '../../customTabList/CustomTabList';
import provideTheme from '../utils/provideTheme';

describe('test custom tab list component', () => {
  it('renders default state', () => {
    const container = render(provideTheme(<CustomTabList tabs={[]} />));
  });
});

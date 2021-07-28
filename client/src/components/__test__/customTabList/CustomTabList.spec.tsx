import { fireEvent, render, screen } from '@testing-library/react';
import CustomTabList from '../../customTabList/CustomTabList';
import provideTheme from '../utils/provideTheme';

const mockTabs = [
  {
    label: 'tab-1',
    component: <div>tab 1 content</div>,
  },
  {
    label: 'tab-2',
    component: <div>tab 2 content</div>,
  },
];

describe('test custom tab list component', () => {
  beforeEach(() => {
    render(provideTheme(<CustomTabList tabs={mockTabs} />));
  });

  it('renders default state', () => {
    expect(screen.getAllByRole('tab').length).toBe(2);
    // default active tab should be first one
    expect(screen.getByText('tab 1 content')).toBeInTheDocument();
  });

  it('checks click tab event', () => {
    const tab2 = screen.getByText('tab-2');
    fireEvent.click(tab2);
    expect(screen.getByText('tab 2 content')).toBeInTheDocument();
  });
});

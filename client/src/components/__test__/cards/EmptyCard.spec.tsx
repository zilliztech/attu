import { render, screen, RenderResult } from '@testing-library/react';
import EmptyCard from '../../cards/EmptyCard';
import provideTheme from '../utils/provideTheme';

let body: RenderResult;

describe('test empty card component', () => {
  beforeEach(() => {
    body = render(
      provideTheme(
        <EmptyCard icon={<span className="icon">icon</span>} text="empty" />
      )
    );
  });

  it('renders default state', () => {
    expect(screen.getByText('icon')).toHaveClass('icon');
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});

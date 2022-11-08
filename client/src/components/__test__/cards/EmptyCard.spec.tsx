import { render, screen } from '@testing-library/react';
import EmptyCard from '../../cards/EmptyCard';
import provideTheme from '../utils/provideTheme';

describe('test empty card component', () => {
  it('renders default state', () => {
    const emptyText = Math.random().toString();
    render(
      provideTheme(
        <EmptyCard icon={<span className="icon">icon</span>} text={emptyText} />
      )
    );

    expect(screen.queryByText('icon')!.className).toEqual('icon');
    expect(screen.queryByText(emptyText)).not.toBeNull();
  });
});

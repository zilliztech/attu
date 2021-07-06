import { fireEvent, render, screen } from '@testing-library/react';
import CustomIconButton from '../../customButton/CustomIconButton';

describe('test custom icon button component', () => {
  it('renders default state', () => {
    render(
      <CustomIconButton>
        <div className="icon">icon</div>
      </CustomIconButton>
    );

    expect(screen.getByText('icon')).toHaveClass('icon');

    const tooltip = screen.queryByText('tooltip');
    expect(tooltip).toBeNull();
  });

  it('checks tooltip', async () => {
    render(
      <CustomIconButton tooltip="tooltip">
        <div className="icon">icon</div>
      </CustomIconButton>
    );
    // mock hover event
    fireEvent.mouseOver(screen.getByText('icon'));
    expect(await screen.findByText('tooltip')).toBeInTheDocument();
  });
});

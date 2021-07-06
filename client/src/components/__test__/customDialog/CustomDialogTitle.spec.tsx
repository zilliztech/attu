import { fireEvent, render } from '@testing-library/react';
import CustomDialogTitle from '../../customDialog/CustomDialogTitle';

describe('test custom dialog title component', () => {
  it('render default state', () => {
    const container = render(<CustomDialogTitle>title</CustomDialogTitle>);

    expect(container.getByText('title')).toBeInTheDocument();
    expect(container.queryByTestId('clear-icon')).toBeNull();
  });

  it('check clear event', () => {
    const mockClearFn = jest.fn();
    const container = render(
      <CustomDialogTitle onClose={mockClearFn}>title</CustomDialogTitle>
    );
    fireEvent.click(container.getByTestId('clear-icon'));
    expect(mockClearFn).toBeCalledTimes(1);
  });
});

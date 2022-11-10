import CustomButton from '../../customButton/CustomButton';
import { render } from '@testing-library/react';

describe('Test CustomButton', () => {
  test('test button props', () => {
    const result = render(
      <CustomButton variant="contained">test</CustomButton>
    );
    expect(result.getByText('test').textContent).toBe('test');
  });
});

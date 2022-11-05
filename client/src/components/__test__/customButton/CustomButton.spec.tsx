import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import CustomButton from '../../customButton/CustomButton';
import { vi } from 'vitest';

let container: any = null;

vi.mock('@material-ui/core/Button', () => {
  return (props: any) => {
    const { variant, children } = props;
    return (
      <>
        <div className="variant">{variant}</div>
        <button className="button">{children}</button>;
      </>
    );
  };
});

describe('Test CustomButton', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test('test button props', () => {
    act(() => {
      render(<CustomButton variant="contained">test</CustomButton>, container);
    });

    expect(container.querySelector('.button').textContent).toBe('test');
    expect(container.querySelector('.variant').textContent).toBe('contained');
  });
});

import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import GlobalEffect from '../../layout/GlobalEffect';
import { vi } from 'vitest';

let container: any = null;

vi.mock('react-router-dom', () => {
  return {
    useHistory: () => ({ location: { pathname: '' } }),
  };
});

describe('Test GlobalEffect', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test Render', () => {
    act(() => {
      render(
        <GlobalEffect>
          <div id="children"></div>
        </GlobalEffect>,
        container
      );
    });

    expect(container.querySelectorAll('#children').length).toEqual(1);
  });
});

import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Copy from '../../copy/Copy';
let container: any = null;

jest.mock('@material-ui/core/Tooltip', () => {
  return props => {
    return <div id="tooltip">{props.children}</div>;
  };
});

describe('Test Copy Component', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test props ', () => {
    act(() => {
      render(<Copy data={[]}></Copy>, container);
    });

    expect(document.querySelectorAll('button').length).toEqual(1);
  });
});

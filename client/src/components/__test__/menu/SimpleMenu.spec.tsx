import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import SimpleMenu from '../../menu/SimpleMenu';

let container: any = null;

jest.mock('@material-ui/core/styles/makeStyles', () => {
  return () => () => ({});
});

jest.mock('@material-ui/core/MenuItem', () => {
  return () => {
    return <div className="menu-item"></div>;
  };
});

describe('Test Simple Menu', () => {
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
    const items = [
      {
        label: 'a',
        callback: () => {},
      },
      {
        label: 'Logout',
        callback: () => {
          console.log('logout');
        },
      },
    ];
    act(() => {
      render(<SimpleMenu label="test" menuItems={items} />, container);
    });

    expect(container.querySelector('button').textContent).toEqual('test');
  });
});

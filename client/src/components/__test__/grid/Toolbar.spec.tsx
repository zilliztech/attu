import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Toolbar from '../../grid/ToolBar';
import { ToolBarConfig } from '../../grid/Types';

jest.mock('@material-ui/icons/Search', () => {
  return () => {
    return <div id="search">search</div>;
  };
});

jest.mock('../../customButton/CustomButton', () => {
  return () => {
    return <div className="button">button</div>;
  };
});

jest.mock('../../customInput/SearchInput', () => {
  return props => {
    return <div>{props.children}</div>;
  };
});

jest.mock('@material-ui/core/TextField', () => {
  return props => {
    return <input {...props} className="input" />;
  };
});

let container: any = null;

const cb = jest.fn().mockImplementation(resolve => resolve('a'));

let toolbarConfig: ToolBarConfig[] = [];

describe('Test ToolBar', () => {
  beforeEach(() => {
    toolbarConfig = [
      {
        label: 'collection',
        icon: 'delete',
        onClick: cb,
        disabled: selected => selected.length > 1,
      },
    ];
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test only one config', () => {
    act(() => {
      render(
        <Toolbar
          selected={[]}
          setSelected={() => {}}
          toolbarConfigs={toolbarConfig}
        ></Toolbar>,
        container
      );
    });

    const btnDom = container.querySelector('.button');
    expect(container.querySelectorAll('.button').length).toBe(1);
    expect(btnDom.className.includes('disabled')).toBeFalsy();
    expect(container.querySelector('#search')).toBeNull();
  });

  it('Test Search Config', () => {
    toolbarConfig.push({
      label: 'collection',
      icon: 'search',
      onClick: cb,
      onSearch: cb,
    });
    act(() => {
      render(
        <Toolbar
          selected={[]}
          setSelected={() => {}}
          toolbarConfigs={toolbarConfig}
        ></Toolbar>,
        container
      );
    });

    expect(container.querySelectorAll('.input').length).toBe(0);
  });
});

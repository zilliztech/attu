import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import AttuGrid from '../../grid/Grid';
import { ToolBarConfig } from '../../grid/Types';
import { vi } from 'vitest';

let container: any = null;

vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: () => ({
        grid: {},
      }),
    }),
  };
});

vi.mock('../../grid/Table', () => {
  return () => {
    return <div id="table">{ }</div>;
  };
});

vi.mock('../../grid/ToolBar', () => {
  return () => {
    return <div id="tool-bar"></div>;
  };
});

vi.mock('react-router-dom', () => {
  return {
    useHistory: () => {
      return {
        listen: () => () => { },
        location: {
          name: '',
        },
      };
    },
  };
});

describe('Test Grid index', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Has Table Data', () => {
    act(() => {
      render(
        <AttuGrid
          primaryKey="id"
          rows={[{}]}
          colDefinitions={[]}
          rowCount={10}
          toolbarConfigs={[]}
        />,
        container
      );
    });

    expect(container.querySelectorAll('#table').length).toEqual(1);
  });

  it('Test title', () => {
    const title = ['collections', 'vectors'];
    act(() => {
      render(
        <AttuGrid
          primaryKey="id"
          rows={[]}
          colDefinitions={[]}
          rowCount={0}
          toolbarConfigs={[]}
          title={title}
        />,
        container
      );
    });

    const titleNodes = container.querySelectorAll('h6');
    expect(titleNodes.length).toEqual(title.length);
    expect(titleNodes[0].textContent).toEqual(title[0]);
    expect(titleNodes[1].textContent).toEqual(title[1]);
  });

  it('Test Toolbar ', () => {
    const ToolbarConfig: ToolBarConfig[] = [
      {
        label: 'collection',
        icon: 'search',
        onClick: () => { },
        onSearch: () => { },
      },
    ];
    act(() => {
      render(
        <AttuGrid
          primaryKey="id"
          rows={[]}
          colDefinitions={[]}
          rowCount={0}
          toolbarConfigs={ToolbarConfig}
        />,
        container
      );
    });

    expect(container.querySelectorAll('#tool-bar').length).toEqual(1);
  });
});

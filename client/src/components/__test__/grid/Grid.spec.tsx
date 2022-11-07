import { render } from '@testing-library/react';
import AttuGrid from '../../grid/Grid';
import { ToolBarConfig } from '../../grid/Types';
import { vi } from 'vitest';

vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: () => ({
        grid: {},
      }),
    }),
  };
});

vi.mock('react-router-dom', () => {
  return {
    useHistory: () => {
      return {
        listen: () => () => {},
        location: {
          name: '',
        },
      };
    },
  };
});

describe('Test Grid index', () => {
  it('Has Table Data', () => {
    const res = render(
      <AttuGrid
        primaryKey="id"
        rows={[{}]}
        colDefinitions={[]}
        rowCount={10}
        toolbarConfigs={[]}
      />
    );

    expect(res.getAllByRole('table').length).toEqual(1);
  });

  it('Test title', () => {
    const title = ['collections', 'vectors'];
    const res = render(
      <AttuGrid
        primaryKey="id"
        rows={[]}
        colDefinitions={[]}
        rowCount={0}
        toolbarConfigs={[]}
        title={title}
      />
    );

    const breadCrum = res.getAllByRole('breadcrumb');
    expect(breadCrum.length).toEqual(1);
    expect(breadCrum[0].textContent).toEqual(`collections›vectors`);
  });

  it('Test Toolbar ', () => {
    const ToolbarConfig: ToolBarConfig[] = [
      {
        label: 'collection',
        icon: 'search',
        onClick: () => {},
        onSearch: () => {},
      },
    ];
    const res = render(
      <AttuGrid
        primaryKey="id"
        rows={[]}
        colDefinitions={[]}
        rowCount={0}
        toolbarConfigs={ToolbarConfig}
      />
    );

    expect(res.getAllByRole('toolbar').length).toEqual(1);
  });
});

import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Table from '../../grid/Table';
import { ColDefinitionsType } from '../../grid/Types';
import { vi } from 'vitest';

let container: any = null;

const colDefinitions: ColDefinitionsType[] = [
  {
    id: 'id',
    disablePadding: true,
    label: 'ID',
  },
  {
    id: 'name',
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'action',
    disablePadding: false,
    label: 'Action',
    showActionCell: true,
    actionBarConfigs: [
      {
        onClick: () => {},
        icon: 'delete',
        label: 'delete',
      },
    ],
  },
];

vi.mock('@material-ui/core/styles/makeStyles', () => {
  return () => () => ({});
});

vi.mock('../../grid/LoadingTable.tsx', () => {
  return () => {
    return <div className="loading"></div>;
  };
});

describe('Test Table', () => {
  let data: any[] = [];
  let onSelected: any;
  let isSelected: any;
  let onSelectedAll: any;

  beforeEach(() => {
    data = [
      {
        id: 1,
        name: 'czz',
      },
    ];
    onSelected = vi.fn();
    isSelected = vi.fn().mockImplementation(() => true);
    onSelectedAll = vi.fn();

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test Basic Table', () => {
    act(() => {
      render(
        <Table
          editHeads={[]}
          selected={[]}
          onSelected={onSelected}
          isSelected={isSelected}
          onSelectedAll={onSelectedAll}
          rows={data}
          primaryKey="id"
          colDefinitions={colDefinitions}
        ></Table>,
        container
      );
    });

    expect(container.querySelectorAll('input').length).toEqual(2); // check box
    expect(container.querySelector('tr').children.length).toEqual(
      colDefinitions.length + 1
    );
    expect(container.querySelectorAll('th')[1].textContent).toEqual(
      colDefinitions[0].label
    );
    expect(container.querySelectorAll('th')[2].textContent).toEqual(
      colDefinitions[1].label
    );

    expect(container.querySelectorAll('[aria-label="delete"]').length).toEqual(
      1
    );
  });

  it('Test Selected function', () => {
    act(() => {
      render(
        <Table
          editHeads={[]}
          selected={[1]}
          onSelected={onSelected}
          isSelected={isSelected}
          onSelectedAll={onSelectedAll}
          rows={data}
          primaryKey="id"
          colDefinitions={colDefinitions}
        ></Table>,
        container
      );
    });

    expect(container.querySelectorAll('input')[1].checked).toBeTruthy();
    expect(container.querySelectorAll('input')[0].checked).toBeTruthy();

    isSelected = vi.fn().mockImplementation(() => false);
    act(() => {
      render(
        <Table
          editHeads={[]}
          selected={[]}
          onSelected={onSelected}
          isSelected={isSelected}
          onSelectedAll={onSelectedAll}
          rows={data}
          primaryKey="id"
          colDefinitions={colDefinitions}
        ></Table>,
        container
      );
    });

    expect(container.querySelectorAll('input')[1].checked).toBeFalsy();
    expect(container.querySelectorAll('input')[0].checked).toBeFalsy();

    expect(isSelected).toHaveBeenCalledTimes(1);
  });

  it('Test Table Loading status', () => {
    act(() => {
      render(
        <Table
          editHeads={[]}
          selected={[]}
          onSelected={onSelected}
          isSelected={isSelected}
          onSelectedAll={onSelectedAll}
          rows={data}
          primaryKey="id"
          colDefinitions={colDefinitions}
          isLoading={true}
        ></Table>,
        container
      );
    });

    expect(container.querySelectorAll('.loading').length).toBe(1);
  });
});

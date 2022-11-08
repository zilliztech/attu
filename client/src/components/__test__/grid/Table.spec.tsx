import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../../grid/Table';
import { ColDefinitionsType } from '../../grid/Types';
import { vi } from 'vitest';

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

describe('Test Table', () => {
  let data: any[] = [
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' },
    { id: 3, name: 'dede' },
  ];
  let onSelected: any = vi.fn();
  let isSelected: any = vi.fn();
  let onSelectedAll: any = vi.fn();

  it('Test Basic Table', () => {
    const res = render(
      <Table
        editHeads={[]}
        selected={[]}
        onSelected={onSelected}
        isSelected={isSelected}
        onSelectedAll={onSelectedAll}
        rows={data}
        primaryKey="id"
        colDefinitions={colDefinitions}
      ></Table>
    );
    expect(res.getAllByRole('checkbox').length).toEqual(4); // check box
    expect(res.getAllByRole('row').length).toEqual(colDefinitions.length + 1);
    expect(res.getAllByRole('cell').length).toEqual(
      (colDefinitions.length + 1) * (data.length + 1)
    );
    expect(res.getAllByRole('button').length).toEqual(3);
    expect(res.getAllByRole('cell')[2].textContent).toEqual(
      colDefinitions[1].label
    );
  });

  it('Test Selected function', () => {
    const res: any = render(
      <Table
        editHeads={[]}
        selected={[1]}
        onSelected={onSelected}
        isSelected={isSelected}
        onSelectedAll={onSelectedAll}
        rows={data}
        primaryKey="id"
        colDefinitions={colDefinitions}
      ></Table>
    );

    const cbx = res.getAllByRole('checkbox')[1];
    fireEvent.click(cbx);
    expect(cbx.checked).toBeTruthy();
    expect(onSelected).toBeCalledTimes(1);
  });
});

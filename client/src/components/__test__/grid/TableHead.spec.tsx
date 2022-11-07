import TableHead from '../../grid/TableHead';
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

describe('Test Table Head', () => {
  // it('Test no checkbox', () => {
  //   const res = render(
  //     <TableHead
  //       colDefinitions={[]}
  //       numSelected={0}
  //       order={'desc'}
  //       orderBy={'id'}
  //       onSelectAllClick={() => {}}
  //       handleSort={() => {}}
  //       rowCount={0}
  //       openCheckBox={false}
  //     />
  //   );
  //   expect(res.getAllByText('.table-cell').length).toEqual(0);
  // });

  it('Test checkbox open', () => {
    const selectAllSpy = vi.fn();
    const res = render(
      <div>
        <TableHead
          colDefinitions={[]}
          numSelected={10}
          order={'desc'}
          orderBy={'id'}
          onSelectAllClick={selectAllSpy}
          handleSort={() => {}}
          rowCount={10}
          openCheckBox={true}
        />
      </div>
    );
    // screen.debug();
    const checkboxes: any = res.getAllByRole('checkbox');
    expect(checkboxes.length).toEqual(1);
    fireEvent.click(checkboxes[0]);
    expect(selectAllSpy).toBeCalledTimes(1);
    expect(checkboxes[0].checked).toBe(true);
  });

  it('Test header cells', () => {
    const onRequestSortSpy = vi.fn();
    const colDefinitions = [
      {
        id: 'id',
        numeric: false,
        disablePadding: true,
        label: 'id',
      },
      {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'name',
      },
    ];
    const res = render(
      <TableHead
        colDefinitions={colDefinitions}
        numSelected={10}
        order={'desc'}
        orderBy={'id'}
        onSelectAllClick={() => {}}
        handleSort={onRequestSortSpy}
        rowCount={10}
        openCheckBox={false}
      />
    );

    const headerCells = res.getAllByRole('cell');
    expect(headerCells.length).toEqual(colDefinitions.length);

    expect(headerCells[0].textContent).toContain('id');
    expect(headerCells[0].textContent).toContain('sorted descending');

    const sortButton = res.getAllByRole('button');
    fireEvent.click(sortButton[0]);
    expect(onRequestSortSpy).toBeCalledTimes(1);

    fireEvent.click(sortButton[0]);
    expect(onRequestSortSpy).toBeCalledTimes(2);
  });
});

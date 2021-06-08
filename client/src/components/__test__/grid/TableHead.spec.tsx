import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import TableHead from '../../grid/TableHead';
import { fireEvent } from '@testing-library/react';

let container: any = null;

jest.mock('@material-ui/core/TableHead', () => {
  return (props: any) => {
    return <div id="table-head">{props.children}</div>;
  };
});
jest.mock('@material-ui/core/TableRow', () => {
  return (props: any) => {
    return <div id="table-row">{props.children}</div>;
  };
});

jest.mock('@material-ui/core/TableCell', () => {
  return (props: any) => {
    return <div className="table-cell">{props.children}</div>;
  };
});

describe('Test Table Head', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test no checkbox', () => {
    act(() => {
      render(
        <TableHead
          colDefinitions={[]}
          numSelected={0}
          order={'desc'}
          orderBy={'id'}
          onSelectAllClick={() => {}}
          onRequestSort={() => {}}
          rowCount={0}
          openCheckBox={false}
        />,
        container
      );
    });
    expect(container.querySelectorAll('.table-cell').length).toEqual(0);
  });

  it('Test checkbox open', () => {
    const selectAllSpy = jest.fn();
    act(() => {
      render(
        <TableHead
          colDefinitions={[]}
          numSelected={10}
          order={'desc'}
          orderBy={'id'}
          onSelectAllClick={selectAllSpy}
          onRequestSort={() => {}}
          rowCount={10}
          openCheckBox={true}
        />,
        container
      );
    });

    const checkboxDom = container.querySelector('input[type="checkbox"]');
    expect(container.querySelectorAll('.table-cell').length).toEqual(1);
    expect(checkboxDom).toBeDefined();

    fireEvent.click(checkboxDom);
    expect(selectAllSpy).toBeCalledTimes(1);
    expect(checkboxDom.checked).toBeTruthy();
  });

  it('Test header cells', () => {
    const onRequestSortSpy = jest.fn();
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
    act(() => {
      render(
        <TableHead
          colDefinitions={colDefinitions}
          numSelected={10}
          order={'desc'}
          orderBy={'id'}
          onSelectAllClick={() => {}}
          onRequestSort={onRequestSortSpy}
          rowCount={10}
          openCheckBox={false}
        />,
        container
      );
    });

    const headerCells = container.querySelectorAll('.MuiTableSortLabel-root');
    expect(headerCells.length).toEqual(colDefinitions.length);

    fireEvent.click(headerCells[0]);
    expect(onRequestSortSpy).toBeCalledTimes(1);

    fireEvent.click(headerCells[1]);
    expect(onRequestSortSpy).toBeCalledTimes(2);
    expect(headerCells[0].textContent).toContain('id');
    expect(headerCells[0].textContent).toContain('sorted descending');
  });
});

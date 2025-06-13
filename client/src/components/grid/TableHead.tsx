import { FC } from 'react';
import React from 'react';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { TableHeadType } from './Types';

const VisuallyHiddenTypography = styled(Typography)(({ theme }) => ({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: 0,
  minWidth: '120px',
  '&:first-of-type': {
    minWidth: '50px',
  },
}));

const StyledTableHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.5, 1),
  fontWeight: 500,
  maxHeight: 45,
  fontSize: 13,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // borderBottom: '1px solid rgba(0, 0, 0, 0.6);',
}));

const EnhancedTableHead: FC<TableHeadType> = props => {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    colDefinitions = [],
    handleSort,
    openCheckBox,
    disableSelect,
  } = props;

  const createSortHandler = (property: string) => (event: React.MouseEvent) => {
    handleSort &&
      handleSort(
        event,
        property,
        colDefinitions.find(c => c.id === property)
      );
  };

  return (
    <TableHead>
      <StyledTableRow>
        {openCheckBox && (
          <TableCell padding="checkbox" role="cell" sx={{ width: '38px' }}>
            <Checkbox
              color="primary"
              size="small"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              disabled={disableSelect}
              inputProps={{
                'aria-label': 'select all desserts',
                role: 'checkbox',
              }}
            />
          </TableCell>
        )}

        {colDefinitions.map(headCell => {
          // get cell style
          const cellStyle = headCell.getStyle
            ? headCell.getStyle(headCell)
            : {};

          // get header formatter
          const headerFormatter =
            headCell.headerFormatter || (v => <>{v.label}</>);

          return (
            <StyledTableCell
              key={headCell.id + headCell.label}
              align={headCell.align || 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={
                orderBy === (headCell.sortBy || headCell.id) ? order : false
              }
              style={cellStyle}
              role="cell"
            >
              {headCell.label && handleSort && !headCell.notSort ? (
                <TableSortLabel
                  active={orderBy === (headCell.sortBy || headCell.id)}
                  direction={
                    orderBy === (headCell.sortBy || headCell.id) ? order : 'asc'
                  }
                  onClick={createSortHandler(headCell.sortBy || headCell.id)}
                  sx={cellStyle}
                >
                  <StyledTableHeader variant="body1" sx={cellStyle}>
                    {headerFormatter(headCell)}
                  </StyledTableHeader>

                  {orderBy === (headCell.sortBy || headCell.id) ? (
                    <VisuallyHiddenTypography>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </VisuallyHiddenTypography>
                  ) : null}
                </TableSortLabel>
              ) : (
                <StyledTableHeader variant="body1" sx={cellStyle}>
                  {headerFormatter(headCell)}
                </StyledTableHeader>
              )}
            </StyledTableCell>
          );
        })}
      </StyledTableRow>
    </TableHead>
  );
};

export default EnhancedTableHead;

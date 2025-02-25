import { FC } from 'react';
import React from 'react';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import type { Theme } from '@mui/material/styles';
import type { TableHeadType } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  tableCell: {
    // background: theme.palette.common.t,
    padding: 0,
    // borderBottom: 'none',
  },
  tableHeader: {
    padding: theme.spacing(1.5),
    fontWeight: 500,
    maxHeight: 45,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  tableRow: {
    // borderBottom: '1px solid rgba(0, 0, 0, 0.6);',
  },
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
  const classes = useStyles();
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
      <TableRow className={classes.tableRow}>
        {openCheckBox && (
          <TableCell padding="checkbox" role="cell">
            <Checkbox
              color="primary"
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
            <TableCell
              key={headCell.id + headCell.label}
              align={headCell.align || 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={
                orderBy === (headCell.sortBy || headCell.id) ? order : false
              }
              style={cellStyle}
              className={classes.tableCell}
              role="cell"
            >
              {headCell.label && handleSort && !headCell.notSort ? (
                <TableSortLabel
                  active={orderBy === (headCell.sortBy || headCell.id)}
                  direction={
                    orderBy === (headCell.sortBy || headCell.id) ? order : 'asc'
                  }
                  onClick={createSortHandler(headCell.sortBy || headCell.id)}
                >
                  <Typography variant="body1" className={classes.tableHeader}>
                    {headerFormatter(headCell)}
                  </Typography>

                  {orderBy === (headCell.sortBy || headCell.id) ? (
                    <Typography className={classes.visuallyHidden}>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </Typography>
                  ) : null}
                </TableSortLabel>
              ) : (
                <Typography variant="body1" className={classes.tableHeader}>
                  {headerFormatter(headCell)}
                </Typography>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};

export default EnhancedTableHead;

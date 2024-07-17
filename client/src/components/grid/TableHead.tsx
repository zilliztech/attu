import { FC } from 'react';
import React from 'react';
import { TableHeadType } from './Types';
import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  TableSortLabel,
  makeStyles,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
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
    color: 'rgba(0, 0, 0, 0.6)',
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
          const cellStyle = headCell.getStyle
            ? headCell.getStyle(headCell)
            : {};

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
                    {headCell.label}
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
                  {headCell.label}
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

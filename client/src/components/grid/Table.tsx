import { FC } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import { makeStyles } from '@mui/styles';
import { TableType } from './Types';
import { Box, Button, Typography, Theme } from '@mui/material';
import EnhancedTableHead from './TableHead';
import EditableTableHead from './TableEditableHead';
import ActionBar from './ActionBar';
import LoadingTable from './LoadingTable';
import CopyButton from '../advancedSearch/CopyButton';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    flexGrow: 1,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
  },
  box: {},
  table: {
    minWidth: '100%',
  },
  tableCell: {
    padding: theme.spacing(1, 1.5),
  },
  cellContainer: {
    display: 'flex',
    whiteSpace: 'nowrap',
  },
  hoverActionCell: {
    transition: '0.2s all',
    padding: 0,
    width: '50px',
    '& span': {
      opacity: 0,
    },
  },
  checkbox: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  rowHover: {
    '&:hover': {
      '& td': {
        background: 'inherit',
      },

      '& $hoverActionCell': {
        '& span': {
          opacity: 1,
        },
      },
    },
  },
  selected: {
    '& td': {
      background: 'inherit',
    },
  },
  cell: {
    borderBottom: `1px solid ${theme.palette.divider}`,

    '& p': {
      display: 'inline-block',
      verticalAlign: 'middle',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: (props: { tableCellMaxWidth: string }) =>
        props.tableCellMaxWidth,
      fontSize: '14px',
      lineHeight: '20px',
    },
  },
  noData: {
    paddingTop: theme.spacing(6),
    textAlign: 'center',
    letterSpacing: '0.5px',
    color: theme.palette.text.secondary,
  },
  copyBtn: {
    '& svg': {
      fontSize: '14px',
    },
    marginLeft: theme.spacing(0.5),
  },
}));

const EnhancedTable: FC<TableType> = props => {
  let {
    selected,
    onSelected,
    isSelected,
    onSelectedAll,
    rows = [],
    colDefinitions,
    primaryKey,
    // whether show checkbox in the first column
    // set true as default
    openCheckBox = true,
    disableSelect,
    noData,
    // whether change table row background color when mouse hover
    // set true as default
    showHoverStyle = true,
    isLoading,
    headEditable = false,
    // editable heads required param, contains heads components and its value
    editHeads = [],
    // if table cell max width not be passed, table row will use 300px as default
    tableCellMaxWidth = '300px',
    handleSort,
    order,
    orderBy,
    loadingRowCount,
  } = props;
  const classes = useStyles({ tableCellMaxWidth });
  const { t: commonTrans } = useTranslation();
  const copyTrans = commonTrans('copy');

  return (
    <TableContainer className={classes.root}>
      <Box height="100%" className={classes.box}>
        {!isLoading && (
          <Table
            stickyHeader
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            {!headEditable ? (
              <EnhancedTableHead
                colDefinitions={colDefinitions}
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={onSelectedAll}
                handleSort={handleSort}
                rowCount={rows.length}
                openCheckBox={openCheckBox}
                disableSelect={disableSelect}
              />
            ) : (
              <EditableTableHead editHeads={editHeads} />
            )}

            <TableBody>
              {rows && rows.length ? (
                rows.map((row, index) => {
                  const isItemSelected = isSelected(row);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover={showHoverStyle}
                      key={'row' + row[primaryKey] + index}
                      onClick={event => onSelected(event, row)}
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected && !disableSelect}
                      classes={{
                        hover: classes.rowHover,
                        selected:
                          isItemSelected && !disableSelect
                            ? classes.selected
                            : undefined,
                      }}
                    >
                      {openCheckBox && (
                        <TableCell
                          padding="checkbox"
                          className={classes.checkbox}
                        >
                          <Checkbox
                            checked={isItemSelected}
                            color="primary"
                            disabled={disableSelect}
                            inputProps={{
                              'aria-labelledby': labelId,
                              role: 'checkbox',
                            }}
                          />
                        </TableCell>
                      )}

                      {colDefinitions.map((colDef, i) => {
                        const { actionBarConfigs = [], needCopy = false } =
                          colDef;
                        const cellStyle = colDef.getStyle
                          ? colDef.getStyle(row[colDef.id])
                          : {};
                        return colDef.showActionCell ? (
                          <TableCell
                            className={`${classes.cell} ${classes.tableCell} ${
                              colDef.isHoverAction
                                ? classes.hoverActionCell
                                : ''
                            }`}
                            key={colDef.id}
                            style={cellStyle}
                          >
                            <ActionBar
                              configs={actionBarConfigs}
                              isHoverType={colDef.isHoverAction}
                              row={row}
                            ></ActionBar>
                          </TableCell>
                        ) : (
                          <TableCell
                            key={'cell' + row[primaryKey] + i}
                            // padding={i === 0 ? 'none' : 'default'}
                            align={colDef.align || 'left'}
                            className={`${classes.cell} ${classes.tableCell}`}
                            style={cellStyle}
                          >
                            <div className={classes.cellContainer}>
                              {typeof row[colDef.id] !== 'undefined' && (
                                <>
                                  {colDef.onClick ? (
                                    <Button
                                      color="primary"
                                      data-data={row[colDef.id]}
                                      data-index={index}
                                      size="small"
                                      onClick={e => {
                                        colDef.onClick &&
                                          colDef.onClick(e, row);
                                      }}
                                    >
                                      {colDef.formatter ? (
                                        colDef.formatter(row, row[colDef.id], i)
                                      ) : (
                                        <Typography title={row[colDef.id]}>
                                          {row[colDef.id]}
                                        </Typography>
                                      )}
                                    </Button>
                                  ) : colDef.formatter ? (
                                    colDef.formatter(row, row[colDef.id], i)
                                  ) : (
                                    <Typography title={row[colDef.id]}>
                                      {row[colDef.id]}
                                    </Typography>
                                  )}

                                  {needCopy && (
                                    <CopyButton
                                      label={copyTrans.label}
                                      value={row[colDef.id]}
                                      size="small"
                                      className={classes.copyBtn}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <tr>
                  <td
                    className={classes.noData}
                    colSpan={
                      openCheckBox
                        ? colDefinitions.length + 1
                        : colDefinitions.length
                    }
                  >
                    {noData}
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        )}

        {isLoading && <LoadingTable count={loadingRowCount} />}
      </Box>
    </TableContainer>
  );
};

export default EnhancedTable;

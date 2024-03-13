import { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import { TableType } from './Types';
import { Box, Button, Typography } from '@material-ui/core';
import EnhancedTableHead from './TableHead';
import EditableTableHead from './TableEditableHead';
import ActionBar from './ActionBar';
import LoadingTable from './LoadingTable';
import CopyButton from '../advancedSearch/CopyButton';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    flexGrow: 1,
    // /* set flex basis to make child item height 100% work on Safari */
    // flexBasis: 0,
    background: '#fff',
  },
  box: {
    backgroundColor: '#fff',
  },
  table: {
    minWidth: '100%',
    minHeight: 57,
  },
  tableCell: {
    background: theme.palette.common.white,
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
    backgroundColor: '#fff',
    '& span': {
      opacity: 0,
    },
  },
  checkbox: {
    background: theme.palette.common.white,
  },
  rowHover: {
    '&:hover': {
      backgroundColor: '#f3fcfe !important',
      '& td': {
        background: 'inherit',
      },

      '& $hoverActionCell': {
        backgroundColor: theme.palette.primary.main,
        '& span': {
          opacity: 1,
        },
      },
    },
  },
  cell: {
    borderBottom: '1px solid #e9e9ed',

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
    color: 'rgba(0, 0, 0, 0.6)',
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
          {!isLoading && (
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
          )}
        </Table>
        {isLoading && <LoadingTable count={loadingRowCount} />}
      </Box>
    </TableContainer>
  );
};

export default EnhancedTable;

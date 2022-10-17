import { FC, useEffect, useRef, useState } from 'react';
import React from 'react';
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
    /* set flex basis to make child item height 100% work on Safari */
    flexBasis: 0,

    // change scrollbar style
    '&::-webkit-scrollbar': {
      width: '8px',
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: '#f9f9f9',
    },

    '&::-webkit-scrollbar-thumb': {
      borderRadius: '8px',
      backgroundColor: '#eee',
    },
  },
  box: {
    backgroundColor: '#fff',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
    minHeight: 57,
  },
  tableCell: {
    background: theme.palette.common.white,
    paddingLeft: theme.spacing(2),
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
    marginLeft: theme.spacing(0.5),
  },
}));

const EnhancedTable: FC<TableType> = props => {
  const {
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
    setPageSize,
    headEditable = false,
    // editable heads required param, contains heads components and its value
    editHeads = [],
    // if table cell max width not be passed, table row will use 300px as default
    tableCellMaxWidth = '300px',
    handleSort,
    order,
    orderBy,
  } = props;
  const classes = useStyles({ tableCellMaxWidth });
  const [loadingRowCount, setLoadingRowCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { t: commonTrans } = useTranslation();
  const copyTrans = commonTrans('copy');

  useEffect(() => {
    // if the type of containerRef is null, set height 57px.
    let height: number = containerRef.current?.offsetHeight || 57;
    // table header is 57px. If offsetHeight is smaller than 57px (this might happen when users resize the screen), the count will be negative and will cause an error.
    if (height < 57) {
      height = 57;
    }
    // table header 57px, loading row 40px
    let count = Math.floor((height - 57) / 40);
    setLoadingRowCount(count);
  }, [containerRef]);

  useEffect(() => {
    if (setPageSize) {
      const containerHeight: number = (containerRef.current as any)!
        .offsetHeight;

      // table default row height is 54
      // if pass component as row item, its max height should be 54 too
      const rowHeight = 54;
      // table header default height is 57
      const tableHeaderHeight: number = 57;
      if (rowHeight > 0) {
        const pageSize = Math.floor(
          (containerHeight - tableHeaderHeight) / rowHeight
        );
        setPageSize(pageSize);
      }
    }
  }, [setPageSize]);

  return (
    <TableContainer
      ref={el => {
        containerRef.current = el;
      }}
      className={classes.root}
    >
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
                      role="checkbox"
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
                            inputProps={{ 'aria-labelledby': labelId }}
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
                            {row[colDef.id] &&
                            typeof row[colDef.id] === 'string' ? (
                              <Typography title={row[colDef.id]}>
                                {colDef.onClick ? (
                                  <Button
                                    color="primary"
                                    data-data={row[colDef.id]}
                                    data-index={index}
                                    onClick={e => {
                                      colDef.onClick && colDef.onClick(e, row);
                                    }}
                                  >
                                    {row[colDef.id]}
                                  </Button>
                                ) : (
                                  row[colDef.id]
                                )}
                              </Typography>
                            ) : (
                              <>
                                {colDef.onClick ? (
                                  <Button
                                    color="primary"
                                    data-data={row[colDef.id]}
                                    data-index={index}
                                    onClick={e => {
                                      colDef.onClick && colDef.onClick(e, row);
                                    }}
                                  >
                                    {row[colDef.id]}
                                  </Button>
                                ) : (
                                  row[colDef.id]
                                )}
                              </>
                            )}

                            {needCopy && row[colDef.id] && (
                              <CopyButton
                                label={copyTrans.label}
                                value={row[colDef.id]}
                                className={classes.copyBtn}
                              />
                            )}
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

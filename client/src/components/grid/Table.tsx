import { FC } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EnhancedTableHead from './TableHead';
import EditableTableHead from './TableEditableHead';
import ActionBar from './ActionBar';
import LoadingTable from './LoadingTable';
import CopyButton from '../advancedSearch/CopyButton';
import type { Theme } from '@mui/material/styles';
import type { TableType } from './Types';

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
    rowDecorator = () => ({}),
    rowHeight,
  } = props;

  const hasData = rows && rows.length > 0;

  return (
    <TableContainer
      sx={theme => ({
        width: '100%',
        flexGrow: 1,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <Box height="100%">
        <Table
          stickyHeader
          sx={{
            minWidth: '100%',
            height: hasData ? 'auto' : 'fit-content',
          }}
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

          {!isLoading ? (
            <TableBody>
              {hasData ? (
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
                      sx={
                        [
                          showHoverStyle && {
                            '&:hover': {
                              '& td': {
                                background: 'inherit',
                              },
                              '& .hoverActionCell': {
                                '& span': {
                                  opacity: 1,
                                },
                              },
                            },
                          },
                          isItemSelected &&
                            !disableSelect && {
                              '& td': {
                                background: 'inherit',
                              },
                            },
                          rowDecorator(row),
                        ].filter(Boolean) as any
                      }
                    >
                      {openCheckBox && (
                        <TableCell
                          padding="checkbox"
                          sx={theme => ({
                            width: '38px',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          })}
                        >
                          <Checkbox
                            checked={isItemSelected}
                            color="primary"
                            size="small"
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
                        const cellStyleFromDef = colDef.getStyle
                          ? colDef.getStyle(row[colDef.id])
                          : {};
                        return colDef.showActionCell ? (
                          <TableCell
                            sx={
                              [
                                (theme: Theme) => ({
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  '& p': {
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: tableCellMaxWidth,
                                  },
                                }),
                                (theme: Theme) => ({
                                  padding: theme.spacing(1, 1.5),
                                }),
                                colDef.isHoverAction && {
                                  transition: '0.2s all',
                                  padding: 0,
                                  width: '50px',
                                  '& span': {
                                    opacity: 0,
                                  },
                                },
                                cellStyleFromDef,
                              ].filter(Boolean) as any
                            }
                            className={
                              colDef.isHoverAction ? 'hoverActionCell' : ''
                            } // Keep class for targeting in rowHoverStyles
                            key={colDef.id}
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
                            align={colDef.align || 'left'}
                            sx={
                              [
                                (theme: Theme) => ({
                                  overflow: 'hidden',
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  '& p': {
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: tableCellMaxWidth,
                                  },
                                }),
                                (theme: Theme) => ({
                                  padding: theme.spacing(1),
                                }),
                                cellStyleFromDef,
                              ].filter(Boolean) as any
                            }
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                whiteSpace: 'nowrap',
                                alignItems: 'center',
                                minHeight: rowHeight - 16, // 16 is the padding of the table cell
                              }}
                            >
                              {typeof row[colDef.id] !== 'undefined' && (
                                <>
                                  {colDef.formatter ? (
                                    colDef.onClick ? (
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
                                        <Typography
                                          component="div"
                                          variant="body2"
                                          title={String(row[colDef.id])}
                                        >
                                          {colDef.formatter(
                                            row,
                                            row[colDef.id],
                                            i
                                          )}
                                        </Typography>
                                      </Button>
                                    ) : (
                                      <Typography
                                        component="div"
                                        title={String(row[colDef.id])}
                                        variant="body2"
                                      >
                                        {colDef.formatter(
                                          row,
                                          row[colDef.id],
                                          i
                                        )}
                                      </Typography>
                                    )
                                  ) : colDef.onClick ? (
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
                                      <Typography
                                        component="div"
                                        title={String(row[colDef.id])}
                                        variant="body2"
                                      >
                                        {row[colDef.id]}
                                      </Typography>
                                    </Button>
                                  ) : (
                                    <Typography
                                      component="div"
                                      title={String(row[colDef.id])}
                                      variant="body2"
                                    >
                                      {row[colDef.id]}
                                    </Typography>
                                  )}

                                  {needCopy && (
                                    <CopyButton
                                      copyValue={row[colDef.id]}
                                      size="small"
                                      sx={theme => ({
                                        '& svg': {
                                          fontSize: '13px',
                                        },
                                        marginLeft: theme.spacing(0.5),
                                      })}
                                    />
                                  )}
                                </>
                              )}
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    sx={theme => ({
                      paddingTop: theme.spacing(6),
                      textAlign: 'center',
                      letterSpacing: '0.5px',
                      color: theme.palette.text.secondary,
                    })}
                    colSpan={
                      openCheckBox
                        ? colDefinitions.length + 1
                        : colDefinitions.length
                    }
                  >
                    {noData}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell
                  sx={theme => ({
                    paddingTop: theme.spacing(6),
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                    color: theme.palette.text.secondary,
                  })}
                  colSpan={
                    openCheckBox
                      ? colDefinitions.length + 1
                      : colDefinitions.length
                  }
                >
                  <LoadingTable />
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </Box>
    </TableContainer>
  );
};

export default EnhancedTable;

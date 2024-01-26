import { FC, MouseEvent } from 'react';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import CustomToolbar from './ToolBar';
import Table from './Table';
import { AttuGridType } from './Types';
import { useTranslation } from 'react-i18next';
import TablePaginationActions from './TablePaginationActions';

const userStyle = makeStyles(theme => ({
  loading: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(20),
    width: '100%',
  },

  tableTitle: {
    '& .last': {
      color: 'rgba(0, 0, 0, 0.54)',
    },
  },
  noData: {
    pointerEvents: 'none',
    color: '#999',
    textAlign: 'center',
    height: '50vh',
    display: 'grid',
    justifyContent: 'center',
    alignContent: 'center',
    fontSize: '32px',
  },
  pagenation: {
    '& .MuiTablePagination-caption': {
      position: 'absolute',
      left: 0,
      bottom: 0,
      top: 0,
      display: 'flex',
      alignItems: 'center',
      '& .rows': {
        color: 'rgba(0,0,0,0.33)',
        marginLeft: theme.spacing(1),
      },
    },
  },

  noBottomPadding: {
    paddingBottom: '0 !important',
    display: 'flex',
    flexDirection: 'column',
  },

  wrapper: {
    height: '100%',
  },
  container: {
    flexWrap: 'nowrap',
    flexDirection: 'column',
  },
}));

/**
 *
 * @param rowCount required. totoal data count for pagination
 * @param rowsPerPage per page for pagination, default is 10
 * @param primaryKey required. The unique column for your data. use for checkbox and render key.
 * @param onPageChange handle page change
 * @param labelDisplayedRows Custom pagination label function, return string;
 * @param page current page for pagination
 * @param showToolbar control toolbar display. default is false
 * @param rows table data you want to render
 * @param colDefinitions Define how to render table heder.
 * @param isLoading table loading status
 * @param title  Render breadcrumbs
 * @param openCheckBox control checkbox display. default is true
 * @param disableSelect disable table row select. default false
 * @param noData when table is empty, what tip we need to show.
 * @param showHoverStyle control table row hover style display
 * @param headEditable if true, user can edit header.
 * @param editHeads Only headEditable is true will render editHeads
 * @param tableCellMaxWidth Define table cell max width, default is 300
 * @param handlesort how to sort table, if it's undefined, then you can not sort table
 * @param order 'desc' | 'asc'. sort direction
 * @param order order by which table field
 * @returns
 */
const AttuGrid: FC<AttuGridType> = props => {
  const classes = userStyle();

  // i18n
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const {
    rowCount = 20,
    rowsPerPage = 10,
    tableHeaderHeight = 46,
    rowHeight = 49,
    pagerHeight = 52,
    primaryKey = 'id',
    showToolbar = false,
    toolbarConfigs = [],
    onPageChange = (
      e: MouseEvent<HTMLButtonElement> | null,
      nextPageNum: number
    ) => {
      console.log('nextPageNum', nextPageNum);
    },
    labelDisplayedRows,
    page = 0,
    rows = [],
    colDefinitions = [],
    isLoading = false,
    title,
    openCheckBox = true,
    disableSelect = false,
    noData = gridTrans.noData,
    showHoverStyle = true,
    headEditable = false,
    editHeads = [],
    selected = [],
    setSelected = () => {},
    setRowsPerPage = () => {},
    tableCellMaxWidth,
    handleSort,
    order,
    orderBy,
    showPagination = true,
    hideOnDisable,
  } = props;

  const _isSelected = (row: { [x: string]: any }) => {
    // console.log("row selected test", row[primaryKey]);
    return selected.some((s: any) => s[primaryKey] === row[primaryKey]);
  };

  const _onSelected = (event: React.MouseEvent, row: { [x: string]: any }) => {
    if (disableSelect) {
      return;
    }
    let newSelected: any[] = ([] as any[]).concat(selected);
    if (_isSelected(row)) {
      newSelected = newSelected.filter(s => s[primaryKey] !== row[primaryKey]);
    } else {
      newSelected.push(row);
    }

    setSelected(newSelected);
  };

  const _onSelectedAll = (event: React.ChangeEvent) => {
    if ((event.target as HTMLInputElement).checked) {
      const newSelecteds = rows;
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const defaultLabelRows = ({ from = 0, to = 0, count = 0 }) => {
    return (
      <>
        <Typography variant="body2" component="span">
          {from} - {to}
        </Typography>
        <Typography variant="body2" className="rows" component="span">
          {gridTrans.of} {count} {gridTrans.rows}
        </Typography>
      </>
    );
  };
  return (
    <Grid
      container
      classes={{ root: classes.wrapper, container: classes.container }}
    >
      {title && (
        <Grid item xs={12} className={classes.tableTitle}>
          <Breadcrumbs separator="›" aria-label="breadcrumb" role="breadcrumb">
            {title.map(
              (v: any, i: number) =>
                v && (
                  <Typography
                    key={v}
                    className={i === title.length - 1 ? 'last' : ''}
                    variant="h6"
                    color="textPrimary"
                  >
                    {v}
                  </Typography>
                )
            )}
          </Breadcrumbs>
        </Grid>
      )}

      {(showToolbar || toolbarConfigs.length > 0) && (
        <Grid item>
          <CustomToolbar
            toolbarConfigs={toolbarConfigs}
            selected={selected}
            hideOnDisable={hideOnDisable}
          ></CustomToolbar>
        </Grid>
      )}

      <Grid item xs={12} className={classes.noBottomPadding}>
        <Table
          openCheckBox={openCheckBox}
          primaryKey={primaryKey}
          rows={rows}
          selected={selected}
          colDefinitions={colDefinitions}
          onSelectedAll={_onSelectedAll}
          onSelected={_onSelected}
          isSelected={_isSelected}
          disableSelect={disableSelect}
          noData={noData}
          showHoverStyle={showHoverStyle}
          isLoading={isLoading}
          setPageSize={setRowsPerPage}
          headEditable={headEditable}
          editHeads={editHeads}
          tableCellMaxWidth={tableCellMaxWidth}
          handleSort={handleSort}
          order={order}
          orderBy={orderBy}
          tableHeaderHeight={tableHeaderHeight}
          rowHeight={rowHeight}
          showPagination={showPagination}
          pagerHeight={pagerHeight}
        ></Table>
        {rowCount && showPagination ? (
          <TablePagination
            component="div"
            colSpan={3}
            count={rowCount}
            page={page}
            labelDisplayedRows={labelDisplayedRows || defaultLabelRows}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            onPageChange={onPageChange}
            className={classes.pagenation}
            ActionsComponent={TablePaginationActions}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default AttuGrid;

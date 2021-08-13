import { FC, MouseEvent } from 'react';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import CustomToolbar from './ToolBar';
import Table from './Table';
import { MilvusGridType } from './Types';
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
  titleIcon: {
    verticalAlign: '-3px',
    '& svg': {
      fill: '#32363c',
    },
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

const MilvusGrid: FC<MilvusGridType> = props => {
  const classes = userStyle();

  // i18n
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const {
    rowCount = 10,
    rowsPerPage = 5,
    primaryKey = 'id',
    showToolbar = false,
    toolbarConfigs = [],
    onChangePage = (
      e: MouseEvent<HTMLButtonElement> | null,
      nextPageNum: number
    ) => {
      console.log('nextPageNum', nextPageNum);
    },
    labelDisplayedRows,
    // pageUnit = 'item',
    page = 0,
    rows = [],
    colDefinitions = [],
    isLoading = false,
    title,
    // titleIcon = <CollectionIcon />,
    searchForm,
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
  } = props;

  const _isSelected = (row: { [x: string]: any }) => {
    // console.log("row selected test", row[primaryKey]);
    return selected.some((s: any) => s[primaryKey] === row[primaryKey]);
  };

  const _onSelected = (event: React.MouseEvent, row: { [x: string]: any }) => {
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

  // const defaultLabelRows = ({ from = 0, to = 0, count = 0 }) => {
  //   const plural = pageUnit.charAt(pageUnit.length - 1) === 'y' ? 'ies' : 's';
  //   const formatUnit =
  //     pageUnit.charAt(pageUnit.length - 1) === 'y'
  //       ? pageUnit.slice(0, pageUnit.length - 1)
  //       : pageUnit;
  //   const unit = count > 1 ? `${formatUnit}${plural}` : pageUnit;
  //   return `${count} ${unit}`;
  // };

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
      spacing={3}
    >
      {title && (
        <Grid item xs={12} className={classes.tableTitle}>
          <Breadcrumbs separator="›" aria-label="breadcrumb">
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

      {searchForm && (
        <Grid item xs={12}>
          {searchForm}
        </Grid>
      )}

      {(showToolbar || toolbarConfigs.length > 0) && (
        <Grid item>
          <CustomToolbar
            toolbarConfigs={toolbarConfigs}
            selected={selected}
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
        ></Table>
        {rowCount ? (
          <TablePagination
            component="div"
            colSpan={3}
            count={rowCount}
            page={page}
            labelDisplayedRows={labelDisplayedRows || defaultLabelRows}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            onChangePage={onChangePage}
            className={classes.pagenation}
            ActionsComponent={TablePaginationActions}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default MilvusGrid;

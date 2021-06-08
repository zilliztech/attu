import {
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  Typography,
} from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TablePaginationActionsProps } from './Types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
    page: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '24px',
      height: '24px',
      backgroundColor: theme.palette.common.white,
    },
    btn: {
      width: '24px',
      height: '24px',
      border: '1px solid #c4c4c4',
      borderRadius: '2px 0 0 2px',
      backgroundColor: 'rgba(0,0,0,0.1)',
      cursor: 'pointer',
    },
  })
);

const TablePaginationActions = (props: TablePaginationActionsProps) => {
  const classes = useStyles();
  const { count, page, rowsPerPage, onChangePage } = props;
  const { t } = useTranslation();
  const gridTrans = t('grid') as any;

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onChangePage(event, page + 1);
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label={gridTrans.prevLabel}
        className={classes.btn}
      >
        <KeyboardArrowLeft />
      </IconButton>
      <Typography variant="body2" className={classes.page}>
        {page + 1}
      </Typography>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={gridTrans.nextLabel}
        className={classes.btn}
      >
        <KeyboardArrowRight />
      </IconButton>
    </div>
  );
};

export default TablePaginationActions;

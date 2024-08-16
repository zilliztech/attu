import { Theme, Typography } from '@mui/material';
import CustomButton from '../customButton/CustomButton';
import icons from '../icons/Icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TablePaginationActionsProps } from './Types';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '24px',
    height: '24px',
  },
  btn: {
    paddingLeft: 8,
    paddingRight: 8,
    minWidth: '24px',
  },
}));

const TablePaginationActions = (props: TablePaginationActionsProps) => {
  const classes = useStyles();
  const { count, page, rowsPerPage, onPageChange } = props;

  // icons
  const NextIcon = icons.next;
  const PrevIcon = icons.prev;

  // i18n
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  return (
    <div className={classes.root}>
      <CustomButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label={gridTrans.prevLabel}
        className={classes.btn}
      >
        <PrevIcon />
      </CustomButton>
      <Typography variant="body2" className={classes.page}>
        {page + 1}
      </Typography>
      <CustomButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={gridTrans.nextLabel}
        className={classes.btn}
      >
        <NextIcon />
      </CustomButton>
    </div>
  );
};

export default TablePaginationActions;

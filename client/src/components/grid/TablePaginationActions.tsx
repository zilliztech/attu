import Typography from '@mui/material/Typography';
import CustomButton from '../customButton/CustomButton';
import icons from '../icons/Icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import type { TablePaginationActionsProps } from './Types';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
}));

const PageNumber = styled(Typography)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '24px',
  height: '24px',
}));

const StyledButton = styled(CustomButton)(({ theme }) => ({
  paddingLeft: 8,
  paddingRight: 8,
  minWidth: '24px',
}));

const TablePaginationActions = (props: TablePaginationActionsProps) => {
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
    <Root>
      <StyledButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label={gridTrans.prevLabel}
      >
        <PrevIcon />
      </StyledButton>
      <PageNumber variant="body2">{page + 1}</PageNumber>
      <StyledButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={gridTrans.nextLabel}
      >
        <NextIcon />
      </StyledButton>
    </Root>
  );
};

export default TablePaginationActions;

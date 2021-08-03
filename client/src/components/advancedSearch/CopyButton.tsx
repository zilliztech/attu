import React, { useState, FC } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { CopyButtonProps } from './Types';
import icons from '../icons/Icons';
import CustomIconButton from '../customButton/CustomIconButton';
import { useTranslation } from 'react-i18next';

const CopyIcon = icons.copyExpression;

const CopyButton: FC<CopyButtonProps> = props => {
  const { label, icon, className, value = '', ...others } = props;
  const classes = useStyles();
  const { t: commonTrans } = useTranslation();
  const copyTrans = commonTrans('copy', { returnObjects: true });
  const [tooltipTitle, setTooltipTitle] = useState('Copy');

  const handleClick = (event: React.MouseEvent<HTMLElement>, v: string) => {
    event.stopPropagation();

    setTooltipTitle(copyTrans.copied);
    navigator.clipboard.writeText(v);
    setTimeout(() => {
      setTooltipTitle(copyTrans.copy);
    }, 1000);
  };

  return (
    <CustomIconButton
      tooltip={tooltipTitle}
      aria-label={label}
      className={`${classes.button} ${className}`}
      onClick={event => handleClick(event, value || '')}
      {...others}
    >
      {icon || <CopyIcon style={{ color: 'transparent' }} />}
    </CustomIconButton>
  );
};

CopyButton.displayName = 'CopyButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    button: {
      '& svg': {
        width: '16px',
        height: '16px',
      },
    },
    tooltip: {},
  })
);

export default CopyButton;

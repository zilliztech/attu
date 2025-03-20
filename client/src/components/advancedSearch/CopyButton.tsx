import React, { useState } from 'react';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import icons from '../icons/Icons';
import CustomIconButton from '../customButton/CustomIconButton';
import { useTranslation } from 'react-i18next';
import type { FC } from 'react';
import type { CopyButtonProps } from './Types';

const CopyIcon = icons.copyExpression;

const CopyButton: FC<CopyButtonProps> = props => {
  const { label, icon, className, value = '', ...others } = props;
  const classes = useStyles();
  const { t: commonTrans } = useTranslation();
  const [tooltipTitle, setTooltipTitle] = useState('Copy');

  const unsecuredCopyToClipboard = (v: string) => {
    const textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.zIndex = '-1000';
    textArea.value = v;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>, v: string) => {
    event.stopPropagation();

    if (typeof v === 'object') {
      v = JSON.stringify(v);
    }

    setTooltipTitle(commonTrans('copy.copied'));
    navigator.clipboard?.writeText(v) ?? unsecuredCopyToClipboard(v);
    setTimeout(() => {
      setTooltipTitle(commonTrans('copy.copy'));
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
      {icon || <CopyIcon />}
    </CustomIconButton>
  );
};

CopyButton.displayName = 'CopyButton';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  button: {},
  tooltip: {},
}));
export default CopyButton;

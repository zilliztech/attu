import React, { useState, useCallback } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import type { FC } from 'react';
import type { IconButtonProps } from '@mui/material';

interface CopyButtonProps extends Omit<IconButtonProps, 'value'> {
  copyValue?: string | object;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  copyLabel?: string;
}

const CopyButton: FC<CopyButtonProps> = props => {
  const {
    copyValue = '',
    tooltipPlacement = 'top',
    copyLabel,
    ...others
  } = props;
  const { t: commonTrans } = useTranslation();
  const copyTooltip = commonTrans('copy.copy') + (copyLabel ? ` ${copyLabel}` : '');
  const [tooltipTitle, setTooltipTitle] = useState(copyTooltip);

  const unsecuredCopyToClipboard = useCallback((v: string) => {
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
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      let textToCopy =
        typeof copyValue === 'object' ? JSON.stringify(copyValue) : copyValue;
      setTooltipTitle(commonTrans('copy.copied'));

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy);
      } else {
        unsecuredCopyToClipboard(textToCopy);
      }

      setTimeout(() => {
        setTooltipTitle(copyTooltip);
      }, 1000);
    },
    [commonTrans, unsecuredCopyToClipboard, copyValue]
  );

  return (
    <Tooltip title={tooltipTitle} arrow placement={tooltipPlacement}>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          '& svg': {
            width: 12,
            height: 12,
          },
          display: 'inline-flex',
          alignItems: 'center',
          ...others.sx,
        }}
        {...others}
      >
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
  );
};

CopyButton.displayName = 'CopyButton';

export default CopyButton;

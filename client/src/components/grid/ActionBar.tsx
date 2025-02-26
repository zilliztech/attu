import { FC, MouseEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Icons from '../icons/Icons';
import CustomToolTip from '../customToolTip/CustomToolTip';
import type { ActionBarType } from './Types';

const Root = styled('span')<{ isHoverType: boolean }>(
  ({ theme, isHoverType }) => ({
    position: 'relative',
    display: 'inline-block',
    marginRight: theme.spacing(1),
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    ...(isHoverType && {
      marginRight: 0,
      '& button': {
        color: theme.palette.text.primary,
      },
    }),
  })
);

const DisabledIconButton = styled(IconButton)(({ theme }) => ({
  '&.Mui-disabled': {
    opacity: 0.15,
  },
}));

const DisabledButton = styled(Button)(({ theme }) => ({
  '&.Mui-disabled': {
    opacity: 0.15,
  },
}));

const ActionBar: FC<ActionBarType> = props => {
  const { configs, row, isHoverType = false } = props;

  return (
    <>
      {configs.map((v, i) => {
        const label = v.getLabel ? v.getLabel(row) : v.label;

        return (
          <Root className={v.className} isHoverType={isHoverType} key={i}>
            <CustomToolTip title={label || ''} placement="bottom">
              {v.icon ? (
                <DisabledIconButton
                  aria-label={label || ''}
                  onClickCapture={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    v.onClick(e, row);
                  }}
                  disabled={v.disabled ? v.disabled(row) : false}
                  size="large"
                >
                  {v.showIconMethod === 'renderFn'
                    ? v.renderIconFn && v.renderIconFn(row)
                    : Icons[v.icon]()}
                </DisabledIconButton>
              ) : (
                <DisabledButton
                  aria-label={label || ''}
                  onClickCapture={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    v.onClick(e, row);
                  }}
                  size="small"
                  disabled={v.disabled ? v.disabled(row) : false}
                >
                  {v.text}
                </DisabledButton>
              )}
            </CustomToolTip>
          </Root>
        );
      })}
    </>
  );
};

export default ActionBar;

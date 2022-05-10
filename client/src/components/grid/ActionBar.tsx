import { FC } from 'react';
import {
  IconButton,
  makeStyles,
  Theme,
  createStyles,
  Button,
} from '@material-ui/core';
import Icons from '../icons/Icons';
import { ActionBarType } from './Types';
import CustomToolTip from '../customToolTip/CustomToolTip';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      display: 'inline-block',
      marginRight: theme.spacing(1),
    },
    tip: {
      position: 'absolute',
      left: 0,
      bottom: '-10px',
      fontSize: '10px',
      textTransform: 'capitalize',
      textAlign: 'center',
      width: '100%',
    },
    disabled: {
      color: theme.palette.common.black,
      opacity: 0.15,
    },
    hoverType: {
      marginRight: 0,

      '& button': {
        color: '#fff',
      },
    },
  })
);

const ActionBar: FC<ActionBarType> = props => {
  const classes = useStyles();
  const { configs, row, isHoverType = false } = props;

  return (
    <>
      {configs.map((v, i) => {
        const label = v.getLabel ? v.getLabel(row) : v.label;

        return (
          <span
            className={`${classes.root} ${v.className} ${
              isHoverType ? classes.hoverType : ''
            }`}
            key={i}
          >
            <CustomToolTip title={label || ''} placement="bottom">
              {v.icon ? (
                <IconButton
                  aria-label={label || ''}
                  onClickCapture={e => {
                    e.stopPropagation();
                    v.onClick(e, row);
                  }}
                  disabled={v.disabled ? v.disabled(row) : false}
                  classes={{
                    disabled: classes.disabled,
                  }}
                >
                  {v.showIconMethod === 'renderFn'
                    ? v.renderIconFn && v.renderIconFn(row)
                    : Icons[v.icon]()}
                </IconButton>
              ) : (
                <Button
                  aria-label={label || ''}
                  onClickCapture={e => {
                    e.stopPropagation();
                    v.onClick(e, row);
                  }}
                  disabled={v.disabled ? v.disabled(row) : false}
                  classes={{
                    disabled: classes.disabled,
                  }}
                >
                  {v.text}
                </Button>
              )}
            </CustomToolTip>
          </span>
        );
      })}
    </>
  );
};

export default ActionBar;

import React, { FC } from 'react';
import { IconButton, makeStyles, Theme, createStyles } from '@material-ui/core';
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
  })
);

const ActionBar: FC<ActionBarType> = props => {
  const classes = useStyles();
  const { configs, row } = props;

  return (
    <>
      {configs.map(v => (
        <span className={`${classes.root} ${v.className}`} key={v.icon}>
          <CustomToolTip title={v.label || ''} placement="top">
            <IconButton
              aria-label={v.label || ''}
              onClickCapture={e => {
                e.stopPropagation();
                v.onClick(e, row);
              }}
              disabled={v.disabled ? v.disabled(row) : false}
              classes={{ disabled: classes.disabled }}
            >
              {Icons[v.icon]()}
            </IconButton>
          </CustomToolTip>
        </span>
      ))}
    </>
  );
};

export default ActionBar;

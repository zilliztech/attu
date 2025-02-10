import { useState, useEffect, useRef } from 'react';
import { Theme } from '@mui/material';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '16px',
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 8,
  },
}));

const Play: any = () => {
  useNavigationHook(ALL_ROUTER_TYPES.PLAY);
  // const { t } = useTranslation('systemView');

  const classes = getStyles();

  return <div className={classes.root}>Play</div>;
};

export default Play;

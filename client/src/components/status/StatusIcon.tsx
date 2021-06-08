import { CircularProgress, makeStyles, Theme } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import { getStatusType } from '../../utils/Status';
import icons from '../icons/Icons';
import { StatusEnum, StatusType } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-left',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
  },
  svg: {
    color: theme.palette.primary.main,
  },
}));

const StatusIcon: FC<StatusType> = props => {
  const classes = useStyles();
  const { status } = props;

  const getElement = (status: StatusEnum): ReactElement => {
    const type = getStatusType(status);
    switch (type) {
      case 'loading':
        return (
          <CircularProgress
            size={24}
            thickness={8}
            classes={{ svg: classes.svg }}
          />
        );
      case 'success':
        return icons.success({ style: { color: '#34b78f' } });
      default:
        return icons.error({ style: { color: '#fc4c02' } });
    }
  };

  return <div className={classes.wrapper}>{getElement(status)}</div>;
};

export default StatusIcon;

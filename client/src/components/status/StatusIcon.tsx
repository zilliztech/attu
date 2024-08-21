import { CircularProgress, Theme } from '@mui/material';
import { FC, ReactElement } from 'react';
import { makeStyles } from '@mui/styles';

export enum LoadingType {
  CREATING = 'creating',
  FINISH = 'finish',
  ERROR = 'error',
}

export type StatusIconType = {
  type: LoadingType;
  className?: string;
  size?: number;
};

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-left',
    alignItems: 'center',
    paddingLeft: theme.spacing(.5),
  },
  svg: {
    color: theme.palette.primary.light,
  },
}));

const StatusIcon: FC<StatusIconType> = props => {
  const classes = useStyles();
  const { type, className = '', size = 16 } = props;

  const getElement = (type: LoadingType): ReactElement => {
    switch (type) {
      case 'creating':
        return (
          <CircularProgress
            size={size}
            thickness={4}
            classes={{ svg: classes.svg }}
          />
        );
      case 'finish':
        return <></>;
      default:
        return <></>;
    }
  };

  return (
    <div className={`${classes.wrapper} ${className}`}>{getElement(type)}</div>
  );
};

export default StatusIcon;

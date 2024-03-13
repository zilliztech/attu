import { CircularProgress, makeStyles, Theme } from '@material-ui/core';
import { FC, ReactElement } from 'react';
import { ChildrenStatusType, StatusIconType } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-left',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
  },
  svg: {
    color: theme.palette.primary.light,
  },
}));

const StatusIcon: FC<StatusIconType> = props => {
  const classes = useStyles();
  const { type, className = '', size = 16 } = props;

  const getElement = (type: ChildrenStatusType): ReactElement => {
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

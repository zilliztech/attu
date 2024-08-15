import { FC, useMemo } from 'react';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { useTranslation } from 'react-i18next';
import { Theme, Typography, useTheme } from '@mui/material';
import { LOADING_STATE } from '@/consts';
import { makeStyles } from '@mui/styles';

export type StatusType = {
  status: LOADING_STATE;
  percentage?: number;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    color: theme.palette.attuGrey.dark,
    textTransform: 'capitalize',
  },
  circle: {
    backgroundColor: (props: any) => props.color,
    borderRadius: '50%',
    width: '10px',
    height: '10px',
    marginRight: theme.spacing(0.5),
  },

  loading: {
    marginRight: '10px',
  },

  flash: {
    animation: '$bgColorChange 1.5s infinite',
  },

  '@keyframes bgColorChange': {
    '0%': {
      backgroundColor: (props: any) => props.color,
    },
    '50%': {
      backgroundColor: 'transparent',
    },
    '100%': {
      backgroundColor: (props: any) => props.color,
    },
  },
}));

const Status: FC<StatusType> = props => {
  const { status, percentage = 0 } = props;
  const { t: commonTrans } = useTranslation();
  const theme = useTheme();
  const statusTrans = commonTrans('status');
  const { label, color } = useMemo(() => {
    switch (status) {
      case LOADING_STATE.UNLOADED:
        return {
          label: statusTrans.unloaded,
          color: theme.palette.primary.main,
        };

      case LOADING_STATE.LOADED:
        return {
          label: statusTrans.loaded,
          color: '#06f3af',
        };
      case LOADING_STATE.LOADING:
        return {
          label: `${percentage}% ${statusTrans.loading}`,
          color: '#f25c06',
        };

      default:
        return {
          label: statusTrans.error,
          color: '#f25c06',
        };
    }
  }, [status, statusTrans, percentage]);

  const classes = useStyles({ color });

  return (
    <div className={classes.root}>
      {status === LOADING_STATE.LOADED && (
        <div className={classes.circle}></div>
      )}
      {status === LOADING_STATE.LOADING && (
        <StatusIcon type={LoadingType.CREATING} className={classes.loading} />
      )}

      <Typography variant="body2" className={classes.label}>
        {label}
      </Typography>
    </div>
  );
};

export default Status;

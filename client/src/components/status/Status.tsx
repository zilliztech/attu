import { FC, useMemo } from 'react';
import { StatusType, StatusEnum } from './Types';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme, createStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    label: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    circle: {
      backgroundColor: (props: any) => props.color,
      borderRadius: '50%',
      width: '10px',
      height: '10px',
      marginRight: theme.spacing(0.5),
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
  })
);

const Status: FC<StatusType> = props => {
  const { status } = props;
  const { t } = useTranslation();
  const statusTrans: { [key in string]: string } = t('status');
  const { label, color } = useMemo(() => {
    switch (status) {
      case StatusEnum.creating:
        return {
          label: statusTrans.creating,
          color: '#06aff2',
        };

      case StatusEnum.running:
        return {
          label: statusTrans.running,
          color: '#06f3af',
        };
      case StatusEnum.error:
        return {
          label: statusTrans.error,
          color: '#f25c06',
        };

      default:
        return {
          label: statusTrans.error,
          color: '#f25c06',
        };
    }
  }, [status, statusTrans]);

  const classes = useStyles({ color });

  return (
    <div className={classes.root}>
      <div
        className={`${classes.circle} ${
          status === StatusEnum.creating ? classes.flash : ''
        }`}
      ></div>
      <Typography variant="body2" className={classes.label}>
        {label}
      </Typography>
    </div>
  );
};

export default Status;

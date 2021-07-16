import { FC } from 'react';
import {
  makeStyles,
  Theme,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { InsertStatusEnum, InsertStatusProps } from './Types';
import successPath from '../../assets/imgs/insert/success.png';
import failPath from '../../assets/imgs/insert/fail.png';
import { useTranslation } from 'react-i18next';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: '75vw',
    height: (props: { status: InsertStatusEnum }) =>
      props.status === InsertStatusEnum.loading ? '288px' : '200px',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTip: {
    marginBottom: theme.spacing(6),
  },
  loadingSvg: {
    color: theme.palette.primary.main,
  },
  text: {
    marginTop: theme.spacing(3),
  },
}));

const InsertStatus: FC<InsertStatusProps> = ({ status, failMsg }) => {
  const { t: insertTrans } = useTranslation('insert');
  const classes = getStyles({ status });

  const InsertSuccess = () => (
    <>
      <img src={successPath} alt="insert success" />
      <Typography variant="h4" className={classes.text}>
        {insertTrans('statusSuccess')}
      </Typography>
    </>
  );

  const InsertLoading = () => (
    <>
      <CircularProgress
        size={64}
        thickness={5}
        classes={{ svg: classes.loadingSvg }}
      />
      <Typography variant="h4" className={classes.text}>
        {insertTrans('statusLoading')}
      </Typography>
      <Typography
        variant="h5"
        className={`${classes.text} ${classes.loadingTip}`}
      >
        {insertTrans('statusLoadingTip')}
      </Typography>
    </>
  );
  const InsertError = () => (
    <>
      <img src={failPath} alt="insert error" />
      <Typography variant="h4" className={classes.text}>
        {insertTrans('statusError')}
      </Typography>
      {failMsg && <Typography className={classes.text}>{failMsg}</Typography>}
    </>
  );

  const generateStatus = (status: InsertStatusEnum) => {
    switch (status) {
      case InsertStatusEnum.loading:
        return <InsertLoading />;
      case InsertStatusEnum.success:
        return <InsertSuccess />;
      // status error or init as default
      default:
        return <InsertError />;
    }
  };

  return (
    <section className={classes.wrapper}>{generateStatus(status)}</section>
  );
};

export default InsertStatus;

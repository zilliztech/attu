import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';
import icons from '../../components/icons/Icons';
import { SizingInfoParam } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  header: {
    display: 'flex',

    '& .title': {
      color: theme.palette.attuGrey.dark,
    },
  },
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(1),
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  pair: {
    display: 'flex',

    '& .key': {
      marginRight: theme.spacing(2),
      color: theme.palette.attuGrey.dark,
    },
  },
}));

const SizingInfo: FC<SizingInfoParam> = props => {
  const { info } = props;
  const { t: commonTrans } = useTranslation();
  const InfoIcon = icons.info;

  const classes = useStyles();

  return (
    info && (
      <section className={classes.wrapper}>
        <div className={classes.header}>
          <Typography className="title">{commonTrans('size')}</Typography>
          <CustomToolTip title={commonTrans('tip')} placement="top">
            <InfoIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </div>

        <div className={classes.info}>
          <div className={classes.pair}>
            <Typography className="key">{commonTrans('memory')}</Typography>
            <Typography>{info.memory}</Typography>
          </div>
          <div className={classes.pair}>
            <Typography className="key">{commonTrans('disk')}</Typography>
            <Typography>{info.disk}</Typography>
          </div>
        </div>
      </section>
    )
  );
};

export default SizingInfo;

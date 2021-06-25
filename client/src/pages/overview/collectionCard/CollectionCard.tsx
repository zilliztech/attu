import {
  makeStyles,
  Theme,
  Link,
  Typography,
  Divider,
} from '@material-ui/core';
import { FC } from 'react';
import CustomButton from '../../../components/customButton/CustomButton';
import icons from '../../../components/icons/Icons';
import Status from '../../../components/status/Status';
import CustomToolTip from '../../../components/customToolTip/CustomToolTip';
import { CollectionCardProps } from './Types';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: theme.spacing(2),
    textAlign: 'end',
  },
  link: {
    display: 'flex',
    alignItems: 'center',

    margin: theme.spacing(2, 0),

    color: '#010e29',
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 'bold',
  },
  icon: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(0.5),
    fontSize: '16px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  rowCount: {
    marginLeft: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
  release: {
    marginLeft: 0,
    marginRight: theme.spacing(0.5),
  },
}));

const CollectionCard: FC<CollectionCardProps> = ({
  data,
  wrapperClass = '',
}) => {
  const classes = useStyles();
  const { name, status, id, rowCount } = data;
  const RightArrowIcon = icons.rightArrow;
  const InfoIcon = icons.info;
  const ReleaseIcon = icons.release;
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const handleRelease = () => {};

  return (
    <div className={`card-wrapper ${classes.wrapper} ${wrapperClass}`}>
      <div>
        <Status status={status} />
      </div>
      <Link
        classes={{ root: classes.link }}
        underline="none"
        href={`/collection/${id}`}
      >
        {name}
        <RightArrowIcon classes={{ root: classes.icon }} />
      </Link>
      <div className={classes.content}>
        <Typography>{collectionTrans('rowCount')}</Typography>
        <CustomToolTip title={collectionTrans('tooltip')} placement="bottom">
          <InfoIcon classes={{ root: classes.icon }} />
        </CustomToolTip>
        <Typography className={classes.rowCount}>{rowCount}</Typography>
      </div>
      <Divider classes={{ root: classes.divider }} />
      <CustomButton variant="contained" onClick={handleRelease}>
        <ReleaseIcon classes={{ root: `${classes.icon} ${classes.release}` }} />
        {btnTrans('release')}
      </CustomButton>
    </div>
  );
};

export default CollectionCard;

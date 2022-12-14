import { makeStyles, Theme, Typography, Divider } from '@material-ui/core';
import { FC } from 'react';
import CustomButton from '../../../components/customButton/CustomButton';
import icons from '../../../components/icons/Icons';
import Status from '../../../components/status/Status';
import CustomToolTip from '../../../components/customToolTip/CustomToolTip';
import { CollectionCardProps } from './Types';
import { useTranslation } from 'react-i18next';
import CustomIconButton from '../../../components/customButton/CustomIconButton';
import { useNavigate, Link } from 'react-router-dom';
import { LOADING_STATE } from '../../../consts/Milvus';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: theme.spacing(2),
    textAlign: 'end',
    '& .link': {
      display: 'flex',
      alignItems: 'center',
      margin: theme.spacing(2, 0),
      color: theme.palette.attuDark.main,
      fontSize: '20px',
      lineHeight: '24px',
      fontWeight: 'bold',
      textDecoration: 'none',
    },
  },
  loading: {
    background: '#F0F4F9',
    border: `1px dashed ${theme.palette.primary.main}`,
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
    fontSize: '16px',

    '& path': {
      fill: theme.palette.primary.main,
    },
  },
  search: {
    fontSize: '16px',
    marginRight: theme.spacing(0.5),
    '& path': {
      fill: '#fff',
    },
  },
  btn: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    lineHeight: '20px',
    fontSize: 14,
  },
}));

const CollectionCard: FC<CollectionCardProps> = ({
  data,
  handleRelease,
  wrapperClass = '',
}) => {
  const classes = useStyles();
  const {
    _name: name,
    _status: status,
    _rowCount: rowCount,
    _loadedPercentage,
  } = data;
  const navigate = useNavigate();
  // icons
  const RightArrowIcon = icons.rightArrow;
  const InfoIcon = icons.info;
  const ReleaseIcon = icons.release;
  const VectorSearchIcon = icons.navSearch;
  // i18n
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const onReleaseClick = () => {
    handleRelease(data);
  };

  const onVectorSearchClick = () => {
    navigate({ pathname: '/search', search: `?collectionName=${name}` });
  };

  return (
    <div
      className={`card-wrapper ${classes.wrapper} ${wrapperClass} ${
        data._status === LOADING_STATE.LOADING && classes.loading
      }`}
    >
      <div>
        <Status status={status} percentage={_loadedPercentage} />
      </div>
      <Link className="link" to={`/collections/${name}`}>
        {name}
        <RightArrowIcon classes={{ root: classes.icon }} />
      </Link>
      <div className={classes.content}>
        <Typography>{collectionTrans('rowCount')}</Typography>
        <CustomToolTip
          title={collectionTrans('entityCountInfo')}
          placement="bottom"
        >
          <InfoIcon classes={{ root: classes.icon }} />
        </CustomToolTip>
        <Typography className={classes.rowCount}>{rowCount}</Typography>
      </div>
      <Divider classes={{ root: classes.divider }} />
      <CustomButton
        variant="contained"
        className={classes.btn}
        onClick={onVectorSearchClick}
      >
        <VectorSearchIcon classes={{ root: classes.search }} />
        {btnTrans('vectorSearch')}
      </CustomButton>
      <CustomIconButton onClick={onReleaseClick} tooltip={btnTrans('release')}>
        <ReleaseIcon classes={{ root: classes.release }} />
      </CustomIconButton>
    </div>
  );
};

export default CollectionCard;

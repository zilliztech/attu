import {
  makeStyles,
  Theme,
  Typography,
  Divider,
  Card,
  CardContent,
} from '@material-ui/core';
import { FC, useContext, useEffect, useState, useCallback } from 'react';
import CustomButton from '@/components/customButton/CustomButton';
import icons from '@/components/icons/Icons';
import Status from '@/components/status/Status';
import { useTranslation } from 'react-i18next';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import { useNavigate, Link } from 'react-router-dom';
import { LOADING_STATE } from '@/consts';
import { rootContext, dataContext } from '@/context';
import ReleaseCollectionDialog from '../../dialogs/ReleaseCollectionDialog';
import { CollectionCardProps } from './Types';
import { CollectionHttp } from '@/http';
import { CollectionData } from '@/pages/collections/Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    textAlign: 'end',
    '& .link': {
      display: 'flex',
      alignItems: 'center',
      margin: theme.spacing(2, 0),
      color: theme.palette.attuDark.main,
      wordBreak: 'break-all',
      textAlign: 'left',
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
    margin: 0,
    padding: 0,
    '& > li': {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(0.5),
    },
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
  onRelease,
  wrapperClass = '',
}) => {
  const { database } = useContext(dataContext);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<string>('');
  const classes = useStyles();
  const { setDialog } = useContext(rootContext);

  const { _name: name, _status: status, _loadedPercentage, _replicas } = data;
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
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <ReleaseCollectionDialog collection={name} onRelease={onRelease} />
        ),
      },
    });
  };

  const onVectorSearchClick = () => {
    navigate({ pathname: '/search', search: `?collectionName=${name}` });
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log(name)
      const data = (await CollectionHttp.count(name)) as CollectionData;
      setCount(data._rowCount);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData, database]);

  return (
    <Card
      className={`card-wrapper ${classes.wrapper} ${wrapperClass} ${
        data._status === LOADING_STATE.LOADING && classes.loading
      }`}
    >
      <CardContent>
        <div>
          <Status status={status} percentage={_loadedPercentage} />
        </div>
        <Link className="link" to={`/collections/${name}`}>
          {name}
          <RightArrowIcon classes={{ root: classes.icon }} />
        </Link>
        <ul className={classes.content}>
          {_replicas && _replicas.length > 1 ? (
            <li>
              <Typography>{collectionTrans('replicaNum')}</Typography>:
              <Typography className={classes.rowCount}>
                {_replicas.length}
              </Typography>
            </li>
          ) : null}
          <li>
            <Typography>{collectionTrans('count')}</Typography>:
            {loading ? (
              `...`
            ) : (
              <Typography className={classes.rowCount}>{count}</Typography>
            )}
          </li>
        </ul>
        <Divider classes={{ root: classes.divider }} />
        <CustomButton
          variant="contained"
          className={classes.btn}
          onClick={onVectorSearchClick}
        >
          <VectorSearchIcon classes={{ root: classes.search }} />
          {btnTrans('vectorSearch')}
        </CustomButton>
        <CustomIconButton
          onClick={onReleaseClick}
          tooltip={btnTrans('release')}
        >
          <ReleaseIcon classes={{ root: classes.release }} />
        </CustomIconButton>
      </CardContent>
    </Card>
  );
};

export default CollectionCard;

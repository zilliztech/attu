import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../../consts/Http';
import { LOADING_STATE } from '../../consts/Milvus';
import { rootContext } from '../../context/Root';
import { webSokcetContext } from '../../context/WebSocket';
import { useLoadAndReleaseDialogHook } from '../../hooks/Dialog';
import { useNavigationHook } from '../../hooks/Navigation';
import { CollectionHttp } from '../../http/Collection';
import { MilvusHttp } from '../../http/Milvus';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import { formatNumber } from '../../utils/Common';
import { checkLoading, checkIndexBuilding } from '../../utils/Validation';
import { CollectionData } from '../collections/Types';
import CollectionCard from './collectionCard/CollectionCard';
import StatisticsCard from './statisticsCard/StatisticsCard';

const useStyles = makeStyles((theme: Theme) => ({
  collectionTitle: {
    margin: theme.spacing(2, 0),
    lineHeight: '20px',
    fontSize: '14px',
    color: '#82838e',
  },
  cardsWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '10px',
  },
}));

const Overview = () => {
  useNavigationHook(ALL_ROUTER_TYPES.OVERVIEW);
  const { handleAction } = useLoadAndReleaseDialogHook({ type: 'collection' });
  const classes = useStyles();
  const { t: overviewTrans } = useTranslation('overview');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: successTrans } = useTranslation('success');
  const [statistics, setStatistics] = useState<{
    collectionCount: number;
    totalData: number;
  }>({
    collectionCount: 0,
    totalData: 0,
  });
  const [loading, setLoading] = useState(false);

  const { collections, setCollections } = useContext(webSokcetContext);

  const { openSnackBar } = useContext(rootContext);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await CollectionHttp.getStatistics();
    const collections = await CollectionHttp.getCollections();
    const hasLoadingOrBuildingCollection = collections.some(
      v => checkLoading(v) || checkIndexBuilding(v)
    );
    // if some collection is building index or loading, start pulling data
    if (hasLoadingOrBuildingCollection) {
      MilvusHttp.triggerCron({
        name: WS_EVENTS.COLLECTION,
        type: WS_EVENTS_TYPE.START,
      });
    }
    setStatistics(res);
    setCollections(collections);
    setLoading(false);
  }, [setCollections]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadCollections = useMemo(
    () => collections.filter(c => c._status !== LOADING_STATE.UNLOADED),
    [collections]
  );

  const fetchRelease = async (data: CollectionData) => {
    const name = data._name;
    const res = await CollectionHttp.releaseCollection(name);
    openSnackBar(
      successTrans('release', { name: collectionTrans('collection') })
    );
    fetchData();
    return res;
  };

  const handleRelease = (data: CollectionData) => {
    handleAction(data, fetchRelease);
  };

  const statisticsData = useMemo(() => {
    return {
      data: [
        {
          label: overviewTrans('load'),
          value: formatNumber(loadCollections.length),
          valueColor: '#07d197',
        },
        {
          label: overviewTrans('all'),
          value: formatNumber(statistics.collectionCount),
          valueColor: '#06aff2',
        },
        {
          label: overviewTrans('data'),
          value: overviewTrans('rows', {
            number: formatNumber(statistics.totalData),
          }) as string,
          valueColor: '#0689d2',
        },
      ],
    };
  }, [overviewTrans, statistics, loadCollections]);

  const CollectionIcon = icons.navCollection;

  return (
    <section className="page-wrapper">
      <StatisticsCard data={statisticsData.data} />
      <Typography className={classes.collectionTitle}>
        {overviewTrans('load')}
      </Typography>

      {loadCollections.length > 0 ? (
        <div className={classes.cardsWrapper}>
          {loadCollections.map(collection => (
            <CollectionCard
              key={collection._id}
              data={collection}
              handleRelease={handleRelease}
            />
          ))}
        </div>
      ) : (
        <EmptyCard
          loading={loading}
          wrapperClass="page-empty-card"
          icon={!loading ? <CollectionIcon /> : undefined}
          text={
            loading ? overviewTrans('loading') : collectionTrans('noLoadData')
          }
        />
      )}
    </section>
  );
};

export default Overview;

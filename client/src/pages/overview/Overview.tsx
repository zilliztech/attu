import { makeStyles, Theme, Typography, useTheme } from '@material-ui/core';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext, webSocketContext, databaseContext } from '@/context';
import EmptyCard from '@/components/cards/EmptyCard';
import icons from '@/components/icons/Icons';
import { WS_EVENTS, WS_EVENTS_TYPE } from '@/consts/Http';
import { LOADING_STATE } from '@/consts/Milvus';
import { useNavigationHook } from '@/hooks';
import { CollectionHttp } from '@/http/Collection';
import { MilvusHttp } from '@/http/Milvus';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import { checkLoading, checkIndexBuilding, formatNumber } from '@/utils';
import CollectionCard from './collectionCard/CollectionCard';
import StatisticsCard from './statisticsCard/StatisticsCard';

const useStyles = makeStyles((theme: Theme) => ({
  collectionTitle: {
    margin: theme.spacing(2, 0),
    lineHeight: '20px',
    fontSize: '14px',
    color: theme.palette.attuGrey.dark,
  },
  cardsWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: theme.spacing(2),
  },
}));

const Overview = () => {
  useNavigationHook(ALL_ROUTER_TYPES.OVERVIEW);
  const { database } = useContext(databaseContext);
  const classes = useStyles();
  const theme = useTheme();
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
  const { collections, setCollections } = useContext(webSocketContext);
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
  }, [setCollections, database]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadCollections = useMemo(
    () => collections.filter(c => c._status !== LOADING_STATE.UNLOADED),
    [collections]
  );

  const onRelease = () => {
    openSnackBar(
      successTrans('release', { name: collectionTrans('collection') })
    );
    fetchData();
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
          valueColor: theme.palette.primary.main,
        },
        {
          label: overviewTrans('data'),
          value: overviewTrans('rows', {
            number: formatNumber(statistics.totalData),
          }) as string,
          valueColor: theme.palette.primary.dark,
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
              onRelease={onRelease}
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

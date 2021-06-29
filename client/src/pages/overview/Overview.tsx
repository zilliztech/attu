import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import { StatusEnum } from '../../components/status/Types';
import { useNavigationHook } from '../../hooks/Navigation';
import { CollectionHttp } from '../../http/Collection';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import { ShowCollectionsType } from '../../types/Milvus';
import { formatNumber } from '../../utils/Common';
import CollectionCard from './collectionCard/CollectionCard';
import { CollectionData } from './collectionCard/Types';
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
  const classes = useStyles();
  const { t: overviewTrans } = useTranslation('overview');
  const { t: collectionTrans } = useTranslation('collection');
  const [statistics, setStatistics] = useState<{
    collectionCount: number;
    totalData: number;
  }>({
    collectionCount: 0,
    totalData: 0,
  });

  const [loadCollections, setLoadCollections] = useState<CollectionHttp[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await CollectionHttp.getStatistics();
      const loadCollections = await CollectionHttp.getCollections({
        type: ShowCollectionsType.InMemory,
      });
      setStatistics(res);
      setLoadCollections(loadCollections);
    };
    fetchData();
  }, []);

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

  const loadCollectionsData: CollectionData[] = useMemo(() => {
    return loadCollections.map(v => ({
      id: v._id,
      name: v._name,
      status: StatusEnum.loaded,
      rowCount: Number(v._rowCount),
    }));
  }, [loadCollections]);

  const CollectionIcon = icons.navCollection;

  return (
    <section className="page-wrapper">
      <StatisticsCard data={statisticsData.data} />
      <Typography className={classes.collectionTitle}>
        {overviewTrans('load')}
      </Typography>
      {loadCollectionsData.length > 0 ? (
        <div className={classes.cardsWrapper}>
          {loadCollectionsData.map(collection => (
            <CollectionCard key={collection.id} data={collection} />
          ))}
        </div>
      ) : (
        <EmptyCard
          wrapperClass="page-empty-card"
          icon={<CollectionIcon />}
          text={collectionTrans('noLoadData')}
        />
      )}
    </section>
  );
};

export default Overview;

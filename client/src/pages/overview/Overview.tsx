import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import { StatusEnum } from '../../components/status/Types';
import { useNavigationHook } from '../../hooks/Navigation';
import { CollectionHttp } from '../../http/Collection';
import { ALL_ROUTER_TYPES } from '../../router/Types';
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

  useEffect(() => {
    const fetchData = async () => {
      const res = await CollectionHttp.getStatistics();
      setStatistics(res);
    };
    fetchData();
  }, []);

  const statisticsData = useMemo(() => {
    return {
      data: [
        {
          label: overviewTrans('load'),
          value: formatNumber(4337),
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
  }, [overviewTrans, statistics]);

  const mockCollections: CollectionData[] = [
    {
      name: 'collection1',
      id: 'c1',
      status: StatusEnum.loaded,
      rowCount: 2,
    },
    {
      name: 'collection2',
      id: 'c2',
      status: StatusEnum.loaded,
      rowCount: 2,
    },
    {
      name: 'collection3',
      id: 'c3',
      status: StatusEnum.loaded,
      rowCount: 2,
    },
    {
      name: 'collection4',
      id: 'c4',
      status: StatusEnum.loaded,
      rowCount: 2,
    },
    {
      name: 'collection5',
      id: 'c5',
      status: StatusEnum.loaded,
      rowCount: 2,
    },
    {
      name: 'collection6',
      id: 'c6',
      status: StatusEnum.loaded,
      rowCount: 2,
    },
  ];
  const CollectionIcon = icons.navCollection;

  return (
    <section className="page-wrapper">
      <StatisticsCard data={statisticsData.data} />
      <Typography className={classes.collectionTitle}>
        {overviewTrans('load')}
      </Typography>
      {mockCollections.length > 0 ? (
        <div className={classes.cardsWrapper}>
          {mockCollections.map(collection => (
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

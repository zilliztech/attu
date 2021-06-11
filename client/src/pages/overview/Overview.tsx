import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import { StatusEnum } from '../../components/status/Types';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import { formatNumber } from '../../utils/Common';
import CollectionCard from './collectionCard/CollectionCard';
import { CollectionData } from './collectionCard/Types';
import StatisticsCard from './statisticsCard/StatisticsCard';
import { StatisticsCardProps } from './statisticsCard/Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    margin: theme.spacing(2, 5),
  },
  collectionTitle: {
    margin: theme.spacing(2, 0),
    lineHeight: '20px',
    fontSize: '14px',
    color: '#82838e',
  },
  empty: {
    flexGrow: 1,
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    fill: 'transparent',

    '& path': {
      stroke: '#aeaebb',
    },
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
  const { t } = useTranslation('overview');
  const { t: collectionTrans } = useTranslation('collection');

  const mockStatistics: StatisticsCardProps = {
    data: [
      {
        label: t('load'),
        value: formatNumber(4337),
        valueColor: '#07d197',
      },
      {
        label: t('all'),
        value: formatNumber(30000),
        valueColor: '#06aff2',
      },
      {
        label: t('data'),
        value: t('rows', { number: formatNumber(209379100) }),
        valueColor: '#0689d2',
      },
    ],
  };

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
    <section className={`page-wrapper ${classes.wrapper}`}>
      <StatisticsCard data={mockStatistics.data} />
      <Typography className={classes.collectionTitle}>{t('load')}</Typography>
      {mockCollections.length > 0 ? (
        <div className={classes.cardsWrapper}>
          {mockCollections.map(collection => (
            <CollectionCard key={collection.id} data={collection} />
          ))}
        </div>
      ) : (
        <EmptyCard
          wrapperClass={classes.empty}
          icon={<CollectionIcon classes={{ root: classes.emptyIcon }} />}
          text={collectionTrans('noLoadData')}
        />
      )}
    </section>
  );
};

export default Overview;

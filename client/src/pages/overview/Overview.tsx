import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  makeStyles,
  Theme,
  Typography,
  useTheme,
  Card,
  CardContent,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { rootContext, dataContext, systemContext } from '@/context';
import EmptyCard from '@/components/cards/EmptyCard';
import icons from '@/components/icons/Icons';
import { LOADING_STATE, MILVUS_DEPLOY_MODE } from '@/consts';
import { useNavigationHook } from '@/hooks';
import { CollectionService } from '@/http';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import { formatNumber } from '@/utils';
import CollectionCard from './collectionCard/CollectionCard';
import StatisticsCard from './statisticsCard/StatisticsCard';
import { StatisticsObject } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  overviewContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(4),
  },
  collectionTitle: {
    margin: theme.spacing(2, 0),
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardsWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: theme.spacing(2),
  },
  sysCardsWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: theme.spacing(2),
  },
  h2: {
    fontWeight: 'bold',
    fontSize: '22px',
    margin: theme.spacing(1, 0, 2, 0),
  },
  dbWrapper: {
    width: '55%',
    order: 1,
    padding: theme.spacing(1, 0, 0),
  },
  emptyCard: {
    minHeight: '50vh',
    color: 'transparent',
  },
  sysWrapper: {
    width: '45%',
    background: 'rgb(239, 239, 239)',
    padding: theme.spacing(1, 2, 2),
    order: 1,
    borderRadius: 8,
  },
  sysCard: {
    '& p': {
      fontSize: '24px',
      margin: 0,
    },
    '& h3': {
      margin: 0,
      fontSize: '14px',
      color: theme.palette.attuGrey.dark,
    },
    '& a': {
      textDecoration: 'none',
      color: '#000',
    },
  },
}));

const SysCard = (data: {
  title: string;
  count: number | string;
  des?: string;
  link?: string;
}) => {
  const classes = useStyles();

  const content = (
    <>
      <Typography component={'p'}>{data.count}</Typography>
      <Typography component={'h3'}>{data.title}</Typography>
      {data.des ? <Typography component={'p'}>{data.des}</Typography> : null}
    </>
  );

  return (
    <Card className={classes.sysCard}>
      <CardContent>
        {data.link ? <Link to={data.link}>{content}</Link> : content}
      </CardContent>
    </Card>
  );
};

const Overview = () => {
  useNavigationHook(ALL_ROUTER_TYPES.OVERVIEW);
  const { database, databases, collections, loading } = useContext(dataContext);
  const { data } = useContext(systemContext);
  const classes = useStyles();
  const theme = useTheme();
  const { t: overviewTrans } = useTranslation('overview');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: successTrans } = useTranslation('success');
  const [statistics, setStatistics] = useState<StatisticsObject>({
    collectionCount: 0,
    totalData: 0,
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const { openSnackBar } = useContext(rootContext);

  const fetchData = useCallback(async () => {
    if (loading) return;
    setLoadingLocal(true);
    const res = await CollectionService.getStatistics();
    setStatistics(res);
    setLoadingLocal(false);
  }, [database, collections]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadCollections = collections.filter(
    c => c.status !== LOADING_STATE.UNLOADED && typeof c.status !== 'undefined'
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

  // calculation diff to the rootCoord create time
  const duration = useMemo(() => {
    let rootCoordCreatedTime = data.rootCoord?.infos?.created_time;

    let duration = 0;
    let unit = '';
    if (rootCoordCreatedTime) {
      if (rootCoordCreatedTime.lastIndexOf('m=') !== -1) {
        rootCoordCreatedTime = rootCoordCreatedTime.substring(
          0,
          rootCoordCreatedTime.lastIndexOf('m=')
        );
      }

      const rootCoordCreatedTimeObj = dayjs(rootCoordCreatedTime);

      const now = dayjs();
      const minDiff = now.diff(rootCoordCreatedTimeObj, 'minute', true);
      const dayDiff = now.diff(rootCoordCreatedTimeObj, 'day', true);
      const hourDiff = now.diff(rootCoordCreatedTimeObj, 'hour', true);
      const withinOneHour = minDiff < 60;
      const withinOneDay = hourDiff < 24;
      duration = withinOneHour ? minDiff : withinOneDay ? hourDiff : dayDiff;
      unit = withinOneHour
        ? overviewTrans('minutes')
        : withinOneDay
        ? overviewTrans('hours')
        : overviewTrans('day');
    }

    return `${duration.toFixed(2)} ${unit}`;
  }, [data.rootCoord]);

  const _loading = loadingLocal || loading;

  return (
    <section className={`page-wrapper  ${classes.overviewContainer}`}>
      <section className={classes.dbWrapper}>
        <Typography component={'h2'} className={classes.h2}>
          {overviewTrans('database')} {database}
        </Typography>

        <StatisticsCard data={statisticsData.data} />
        <Typography component={'h4'} className={classes.collectionTitle}>
          {overviewTrans('load')}
        </Typography>

        {loadCollections.length > 0 ? (
          <div className={classes.cardsWrapper}>
            {loadCollections.map(collection => (
              <CollectionCard
                key={collection.id}
                data={collection}
                onRelease={onRelease}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            loading={_loading}
            wrapperClass={classes.emptyCard}
            icon={!_loading ? <CollectionIcon /> : undefined}
            text={
              _loading
                ? overviewTrans('loading')
                : collectionTrans('noLoadData')
            }
          />
        )}
      </section>

      {data?.systemInfo ? (
        <section className={classes.sysWrapper}>
          <Typography component={'h2'} className={classes.h2}>
            {overviewTrans('sysInfo')}
          </Typography>
          <div className={classes.sysCardsWrapper}>
            <SysCard
              title={'Milvus Version'}
              count={data?.systemInfo?.build_version}
            />
            <SysCard
              title={overviewTrans('deployMode')}
              count={data?.deployMode}
            />
            <SysCard title={overviewTrans('upTime')} count={duration} />

            <SysCard
              title={overviewTrans('databases')}
              count={databases?.length}
              link="databases"
            />
            <SysCard
              title={overviewTrans('users')}
              count={data?.users?.length}
              link="users"
            />
            <SysCard
              title={overviewTrans('roles')}
              count={data?.roles?.length}
              link="users?activeIndex=1"
            />

            {data?.deployMode === MILVUS_DEPLOY_MODE.DISTRIBUTED ? (
              <>
                <SysCard
                  title={overviewTrans('dataNodes')}
                  count={data?.dataNodes?.length}
                  link="system"
                />

                <SysCard
                  title={overviewTrans('queryNodes')}
                  count={data?.queryNodes?.length}
                  link="system"
                />

                <SysCard
                  title={overviewTrans('indexNodes')}
                  count={data?.indexNodes?.length}
                  link="system"
                />
              </>
            ) : null}
          </div>
        </section>
      ) : null}
    </section>
  );
};

export default Overview;

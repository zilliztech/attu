import { useContext, useMemo } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { dataContext, systemContext } from '@/context';
import { MILVUS_DEPLOY_MODE } from '@/consts';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import DatabaseCard from './DatabaseCard';
import SysCard from './SysCard';
import StatusIcon from '@/components/status/StatusIcon';
import { ChildrenStatusType } from '@/components/status/Types';

const useStyles = makeStyles((theme: Theme) => ({
  overviewContainer: {
    gap: theme.spacing(2),
    '& h4': {
      marginBottom: theme.spacing(2),
    },
  },

  section: {
    width: '75%',
    marginBottom: theme.spacing(2),
  },
  cardWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexGrow: 0,
    gap: theme.spacing(2),
  },
}));

const Overview = () => {
  useNavigationHook(ALL_ROUTER_TYPES.OVERVIEW);
  const {
    databases,
    database,
    collections,
    loadingDatabases,
    setDatabase,
    dropDatabase,
  } = useContext(dataContext);
  const { data } = useContext(systemContext);
  const classes = useStyles();
  const { t: overviewTrans } = useTranslation('overview');
  const { t: databaseTrans } = useTranslation('database');

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

  return (
    <section className={`page-wrapper  ${classes.overviewContainer}`}>
      <section className={classes.section}>
        <Typography variant="h4">{databaseTrans('databases')}</Typography>
        {loadingDatabases ? (
          <StatusIcon type={ChildrenStatusType.CREATING} />
        ) : (
          <div className={classes.cardWrapper}>
            {databases.map(db => {
              // if the database is the current database, using client side collections data to avoid more requests
              if (db.name === database) {
                db.collections = collections.map(c => c.collection_name);
              }
              return (
                <DatabaseCard
                  database={db}
                  setDatabase={setDatabase}
                  dropDatabase={dropDatabase}
                  key={db.name}
                />
              );
            })}
            <DatabaseCard
              database={{ name: 'new', collections: [], createdTime: 0 }}
              setDatabase={setDatabase}
              dropDatabase={dropDatabase}
              key={'new'}
            />
          </div>
        )}
      </section>

      {data?.systemInfo && (
        <>
          <section className={classes.section}>
            <Typography variant="h4">{overviewTrans('sysInfo')}</Typography>
            <div className={classes.cardWrapper}>
              <SysCard
                title={'Milvus Version'}
                count={data?.systemInfo?.build_version}
                link="system"
              />

              <SysCard
                title={overviewTrans('deployMode')}
                count={data?.deployMode}
                link="system"
              />
              <SysCard
                title={overviewTrans('upTime')}
                count={duration}
                link="system"
              />

              <SysCard
                title={overviewTrans('users')}
                count={data?.users?.length}
                link="users"
              />
              <SysCard
                title={overviewTrans('roles')}
                count={data?.roles?.length}
                link="roles"
              />
            </div>
          </section>

          {data?.deployMode === MILVUS_DEPLOY_MODE.DISTRIBUTED && (
            <section className={classes.section}>
              <div className={classes.cardWrapper}>
                <SysCard
                  title={overviewTrans('dataNodes')}
                  count={data?.dataNodes?.length}
                  link="system"
                />
                <SysCard
                  title={overviewTrans('indexNodes')}
                  count={data?.indexNodes?.length}
                  link="system"
                />
                <SysCard
                  title={overviewTrans('queryNodes')}
                  count={data?.queryNodes?.length}
                  link="system"
                />
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
};

export default Overview;

import { useContext, useMemo } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  dataContext,
  systemContext,
  authContext,
  rootContext,
} from '@/context';
import { MILVUS_DEPLOY_MODE } from '@/consts';
import { useNavigationHook } from '@/hooks';
import { ROUTE_PATHS } from '@/config/routes';
import DatabaseCard from './DatabaseCard';
import CreateDatabaseDialog from '../dialogs/CreateDatabaseDialog';
import icons from '@/components/icons/Icons';
import SysCard from './SysCard';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';

const Home = () => {
  useNavigationHook(ROUTE_PATHS.HOME);
  const {
    databases,
    database,
    collections,
    loadingDatabases,
    setDatabase,
    fetchDatabases,
  } = useContext(dataContext);
  const { data } = useContext(systemContext);
  const { t: homeTrans } = useTranslation('home');
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
        ? homeTrans('minutes')
        : withinOneDay
          ? homeTrans('hours')
          : homeTrans('day');
    }

    return `${duration.toFixed(2)} ${unit}`;
  }, [data.rootCoord]);

  const { isServerless } = useContext(authContext);
  const { setDialog } = useContext(rootContext);
  const PlusIcon = icons.add;

  const handleCreateDbClick = () => {
    if (isServerless) {
      window.open('https://cloud.zilliz.com/', '_blank');
      return;
    }
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: <CreateDatabaseDialog />,
      },
    });
  };

  return (
    <Box
      sx={theme => ({
        margin: '12px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)',
        borderRadius: 2,
      })}
    >
      <Box
        sx={{
          mb: 2,
          px: 2,
          maxWidth: '90%',
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography
              variant="h4"
              sx={{
                mr: 1,
                position: 'relative',
                top: 8,
                mb: 2,
                color: theme => theme.palette.text.primary,
              }}
            >
              {databaseTrans('databases')}
            </Typography>
            <Typography
              component="span"
              variant="subtitle1"
              color="textSecondary"
              sx={{ position: 'relative', top: 1, mr: 2 }}
            >
              ({databases.length})
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCreateDbClick}
            sx={{
              ml: 0,
              minWidth: 24,
              width: 24,
              height: 24,
              p: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon sx={{ fontSize: 20 }} />
          </Button>
        </Box>
        {loadingDatabases ? (
          <StatusIcon type={LoadingType.CREATING} />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexGrow: 0,
              gap: 1.5,
            }}
          >
            {databases.map(db => {
              if (db.name === database) {
                db.collections = collections.map(c => c.collection_name);
              }
              return (
                <DatabaseCard
                  database={db}
                  isActive={db.name === database}
                  setDatabase={setDatabase}
                  fetchDatabases={fetchDatabases}
                  key={db.name}
                />
              );
            })}
          </Box>
        )}
      </Box>

      {data?.systemInfo && (
        <>
          <Box
            sx={{
              mb: 2,
              px: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{ mb: 2, color: theme => theme.palette.text.primary }}
            >
              {homeTrans('sysInfo')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flexGrow: 0,
                gap: 2,
              }}
            >
              <SysCard
                title={'Milvus Version'}
                count={data?.systemInfo?.build_version}
                link="system"
              />

              <SysCard
                title={homeTrans('deployMode')}
                count={data?.deployMode}
                link="system"
              />
              <SysCard
                title={homeTrans('upTime')}
                count={duration}
                link="system"
              />

              <SysCard
                title={homeTrans('users')}
                count={data?.users?.length}
                link="users"
              />
              <SysCard
                title={homeTrans('roles')}
                count={data?.roles?.length}
                link="roles"
              />
            </Box>
          </Box>

          {data?.deployMode === MILVUS_DEPLOY_MODE.DISTRIBUTED && (
            <Box
              sx={{
                mb: 2,
                px: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexGrow: 0,
                  gap: 2,
                }}
              >
                <SysCard
                  title={homeTrans('dataNodes')}
                  count={data?.dataNodes?.length}
                  link="system"
                />
                <SysCard
                  title={homeTrans('indexNodes')}
                  count={data?.indexNodes?.length}
                  link="system"
                />
                <SysCard
                  title={homeTrans('queryNodes')}
                  count={data?.queryNodes?.length}
                  link="system"
                />
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Home;

import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  Theme,
  createStyles,
  Typography,
  Tooltip,
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { navContext, dataContext, authContext } from '@/context';
import { MilvusService } from '@/http';
import CustomSelector from '@/components/customSelector/CustomSelector';
import icons from '../icons/Icons';
import { HeaderType } from './Types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.common.black,
      paddingRight: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      backgroundColor: '#fff',
      borderBottom: '1px solid #e0e0e0',
    },
    contentWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      flex: 1,
    },
    navigation: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      color: theme.palette.primary.main,
      cursor: 'pointer',
      marginRight: theme.spacing(1),
    },
    addressWrapper: {
      display: 'flex',
      alignItems: 'center',

      '& .text': {
        marginRight: theme.spacing(2),

        '& .address': {
          fontSize: '14px',
          lineHeight: '20px',
          color: '#545454',
        },

        '& .status': {
          fontSize: '12px',
          lineHeight: '16px',
          color: '#1ba954',
        },
      },
    },
    database: {
      width: theme.spacing(16),
      marginRight: theme.spacing(2),
    },
  })
);

const Header: FC<HeaderType> = props => {
  const classes = useStyles();
  const { navInfo } = useContext(navContext);
  const { database, databases, setDatabase, loading } = useContext(dataContext);
  const { address, username, logout } = useContext(authContext);
  const navigate = useNavigate();

  const { t: commonTrans } = useTranslation();
  const statusTrans = commonTrans('status');
  const { t: dbTrans } = useTranslation('database');
  const BackIcon = icons.back;
  const LogoutIcon = icons.logout;

  const handleBack = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    logout();
  };

  const useDatabase = async (database: string) => {
    await MilvusService.useDatabase({ database });
  };

  const dbOptions = databases.map(d => ({ value: d, label: d }));
  return (
    <header className={classes.header}>
      <div className={classes.contentWrapper}>
        <div className={classes.navigation}>
          {navInfo.backPath !== '' && (
            <BackIcon
              classes={{ root: classes.icon }}
              onClick={() => handleBack(navInfo.backPath)}
            />
          )}
          {navInfo.showDatabaseSelector ? (
            <CustomSelector
              label={dbTrans('database')}
              value={database}
              onChange={async (e: { target: { value: unknown } }) => {
                const database = e.target.value as string;
                await useDatabase(database);
                setDatabase(database);
                navigate(`/databases/${database}`);
              }}
              options={dbOptions}
              variant="filled"
              wrapperClass={classes.database}
              disabled={loading}
            />
          ) : null}

          <Typography variant="h5" color="textPrimary">
            {navInfo.navTitle}
          </Typography>
        </div>

        <div className={classes.addressWrapper}>
          <div className="text">
            <Typography className="address">{address}</Typography>
            <Typography className="status">{statusTrans.running}</Typography>
          </div>
          {username && (
            <Tooltip title={username}>
              <AccountCircleIcon classes={{ root: classes.icon }} />
            </Tooltip>
          )}
          <LogoutIcon classes={{ root: classes.icon }} onClick={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;

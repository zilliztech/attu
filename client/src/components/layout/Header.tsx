import { FC, useContext, useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { navContext, dataContext, authContext, rootContext } from '@/context';
import { MilvusService } from '@/http';
import CustomSelector from '@/components/customSelector/CustomSelector';
import StatusIcon from '@/components/status/StatusIcon';
import UpdateUser from '@/pages/user/dialogs/UpdateUserPassDialog';
import icons from '../icons/Icons';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import { ColorModeContext } from '@/context';
import { LoadingType } from '@/components/status/StatusIcon';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    paddingRight: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    height: 48,
  },
  contentWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    height: 48,
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    marginRight: theme.spacing(1),
    width: '20px',
  },
  addressWrapper: {
    display: 'flex',
    alignItems: 'center',

    '& .text': {
      marginRight: theme.spacing(2),

      '& .address': {
        fontSize: '12px',
        lineHeight: 1.3,
      },

      '& .status': {
        fontSize: '12px',
        lineHeight: 1.3,
        color: '#1ba954',
      },
    },
  },
  title: {
    paddingLeft: theme.spacing(2),
  },
  database: {
    transform: 'translateY(-4px)',
    width: theme.spacing(16),
    '& .MuiInputLabel-root': {
      top: '4px',
    },
  },
  modeBtn: {
    marginRight: theme.spacing(1),
    '& svg': {
      fontSize: 18,
    },
    color: theme.palette.text.primary,
  },
  extra: {
    marginLeft: theme.spacing(0.5),
    display: 'flex',
    '& svg': {
      fontSize: 15,
      color: theme.palette.primary.main,
    },
  },
}));

const Header: FC = () => {
  // styles
  const classes = useStyles();
  // use context
  const { navInfo } = useContext(navContext);
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const { database, databases, setDatabase, loading } = useContext(dataContext);
  const { authReq, logout } = useContext(authContext);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const { address, username } = authReq;
  const navigate = useNavigate();

  // UI states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // i8n
  const { t: commonTrans } = useTranslation();
  const statusTrans = commonTrans('status');
  const { t: dbTrans } = useTranslation('database');
  const { t: successTrans } = useTranslation('success');

  // icons
  const BackIcon = icons.back;
  const LogoutIcon = icons.logout;
  const Avatar = icons.avatar;

  // UI handlers
  const handleBack = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    logout(false);
  };

  const useDatabase = async (database: string) => {
    await MilvusService.useDatabase({ database });
  };

  const handleUserMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    setAnchorEl(null);
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <UpdateUser
            username={username}
            onUpdate={res => {
              if (res.error_code === 'Success') {
                openSnackBar(successTrans('passwordChanged'));
                handleCloseDialog();
                setAnchorEl(null);
                logout();
              } else {
                openSnackBar(res.detail, 'error');
              }
            }}
            handleClose={handleCloseDialog}
          />
        ),
      },
    });
  };

  // local computes
  const dbOptions = databases.map(d => ({ value: d.name, label: d.name }));
  const isLoadingDb = dbOptions.length === 0;

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
          {navInfo.showDatabaseSelector &&
            (!isLoadingDb ? (
              <CustomSelector
                label={dbTrans('database')}
                value={database}
                onChange={async (e: { target: { value: unknown } }) => {
                  const database = e.target.value as string;
                  await useDatabase(database);
                  setDatabase(database);

                  // if url contains databases, go to the database page
                  if (window.location.hash.includes('databases')) {
                    navigate(`/databases/${database}/collections`);
                  }
                }}
                options={dbOptions}
                variant="filled"
                wrapperClass={classes.database}
                disabled={loading}
              />
            ) : (
              <StatusIcon type={LoadingType.CREATING} />
            ))}

          <Typography
            variant="h5"
            color="textPrimary"
            className={classes.title}
          >
            {navInfo.navTitle}
          </Typography>
          <span className={classes.extra}>{navInfo.extra}</span>
        </div>

        <div className={classes.addressWrapper}>
          <IconButton
            className={classes.modeBtn}
            onClick={toggleColorMode}
            color="inherit"
          >
            {mode === 'dark' ? <icons.night /> : <icons.day />}
          </IconButton>
          <div className="text">
            <Typography className="address">{address}</Typography>
            <Typography className="status">{statusTrans.running}</Typography>
          </div>
          {username && (
            <>
              <Tooltip title={username}>
                <div
                  onClick={handleUserMenuClick}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar classes={{ root: classes.icon }} />
                </div>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleChangePassword}>
                  Change Password
                </MenuItem>
              </Menu>
            </>
          )}
          <Tooltip title={'disconnect'}>
            <div>
              <LogoutIcon
                classes={{ root: classes.icon }}
                onClick={handleLogout}
              />
            </div>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default Header;

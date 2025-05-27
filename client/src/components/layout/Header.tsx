import { FC, useContext, useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  navContext,
  dataContext,
  authContext,
  rootContext,
  ColorModeContext,
} from '@/context';
import { MilvusService } from '@/http';
import UpdateUser from '@/pages/user/dialogs/UpdateUserPassDialog';
import icons from '../icons/Icons';
import Breadcrumbs from '@mui/material/Breadcrumbs';

const Header: FC = () => {
  // use context
  const { navInfo } = useContext(navContext);
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const { database, databases, setDatabase } = useContext(dataContext);
  const { authReq, logout } = useContext(authContext);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const { address, username } = authReq;
  const navigate = useNavigate();

  // UI states
  const [dbAnchorEl, setDbAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  // i18n
  const { t: commonTrans } = useTranslation();
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');

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

  const handleUserMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleChangePassword = () => {
    setUserAnchorEl(null);
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <UpdateUser
            username={username}
            onUpdate={() => {
              openSnackBar(successTrans('passwordChanged'));
              handleCloseDialog();
              setUserAnchorEl(null);
              logout();
            }}
            handleClose={handleCloseDialog}
          />
        ),
      },
    });
  };

  const handleDbClick = (event: MouseEvent<HTMLElement>) => {
    setDbAnchorEl(event.currentTarget);
  };

  const handleDbMenuClose = () => {
    setDbAnchorEl(null);
  };

  // local computes
  const dbOptions = databases.map(d => ({ value: d.name, label: d.name }));

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        height: 45,
        justifyContent: 'center',
        backgroundColor: theme =>
          mode === 'dark' ? theme.palette.background.default : '#fff',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 45,
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {navInfo.backPath !== '' && (
            <IconButton
              size="small"
              onClick={() => handleBack(navInfo.backPath)}
              sx={{ color: 'primary.main' }}
            >
              <BackIcon />
            </IconButton>
          )}
          {navInfo.showDatabaseSelector && (
            <Breadcrumbs aria-label="breadcrumb">
              <Typography
                sx={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}
                color="primary"
                onClick={handleDbClick}
              >
                {database}
              </Typography>
              <Menu
                anchorEl={dbAnchorEl}
                open={Boolean(dbAnchorEl)}
                onClose={handleDbMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                {dbOptions.map(option => (
                  <MenuItem
                    key={option.value}
                    selected={option.value === database}
                    onClick={async () => {
                      await useDatabase(option.value);
                      setDatabase(option.value);
                      setDbAnchorEl(null);
                      if (window.location.hash.includes('databases')) {
                        navigate(`/databases/${option.value}/collections`);
                      }
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </Breadcrumbs>
          )}
          <Typography
            color="text.primary"
            sx={{ fontSize: 15, fontWeight: 500, ml: 0 }}
          >
            {navInfo.navTitle}
          </Typography>
          {navInfo.extra && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {navInfo.extra}
            </Box>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={toggleColorMode}
            color="inherit"
            size="small"
            sx={{ '& svg': { fontSize: 14 } }}
          >
            {mode === 'dark' ? <icons.night /> : <icons.day />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box sx={{ mr: 2 }}>
              <Typography
                className="address"
                sx={{ fontSize: 11, lineHeight: 1.3 }}
              >
                {address}
              </Typography>
              <Typography
                className="status"
                sx={{ fontSize: 11, lineHeight: 1.3, color: '#1ba954' }}
              >
                {commonTrans('status.running')}
              </Typography>
            </Box>
            {username && (
              <>
                <Tooltip title={username}>
                  <IconButton
                    size="small"
                    onClick={handleUserMenuClick}
                    sx={{ color: 'primary.main', '& svg': { fontSize: 16 } }}
                  >
                    <Avatar />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={userAnchorEl}
                  open={Boolean(userAnchorEl)}
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
                    {userTrans('changePassword')}
                  </MenuItem>
                </Menu>
              </>
            )}
            <Tooltip title={'disconnect'}>
              <IconButton
                size="small"
                sx={{ color: 'primary.main', '& svg': { fontSize: 16 } }}
                onClick={handleLogout}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

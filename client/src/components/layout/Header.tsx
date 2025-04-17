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
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ColorModeContext } from '@/context';
import { LoadingType } from '@/components/status/StatusIcon';

const HeaderWrapper = styled('header')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  paddingRight: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: 48,
}));

const ContentWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flex: 1,
  height: 48,
});

const Navigation = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const StyledIcon = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  cursor: 'pointer',
  marginRight: theme.spacing(1),
}));

const AddressWrapper = styled('div')(({ theme }) => ({
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
}));

const Title = styled(Typography)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

const DatabaseSelector = styled(CustomSelector)(({ theme }) => ({
  transform: 'translateY(-4px)',
  width: 'auto',
  minWidth: 120,
  '& .MuiInputLabel-root': {
    top: '4px',
  },
}));

const ModeButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
  '& svg': {
    fontSize: 18,
    color: theme.palette.text.primary,
  },
}));

const Extra = styled('span')(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  display: 'flex',
  '& svg': {
    fontSize: 15,
    color: theme.palette.primary.main,
  },
}));

const Header: FC = () => {
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
  const { t: dbTrans } = useTranslation('database');
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
              openSnackBar(successTrans('passwordChanged'));
              handleCloseDialog();
              setAnchorEl(null);
              logout();
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
    <HeaderWrapper>
      <ContentWrapper>
        <Navigation>
          {navInfo.backPath !== '' && (
            <StyledIcon onClick={() => handleBack(navInfo.backPath)}>
              <BackIcon />
            </StyledIcon>
          )}
          {navInfo.showDatabaseSelector &&
            (!isLoadingDb ? (
              <DatabaseSelector
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
                disabled={loading}
              />
            ) : (
              <StatusIcon type={LoadingType.CREATING} />
            ))}

          <Title variant="h5" color="textPrimary">
            {navInfo.navTitle}
          </Title>
          <Extra>{navInfo.extra}</Extra>
        </Navigation>

        <AddressWrapper>
          <ModeButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <icons.night /> : <icons.day />}
          </ModeButton>
          <div className="text">
            <Typography className="address">{address}</Typography>
            <Typography className="status">
              {commonTrans('status.running')}
            </Typography>
          </div>
          {username && (
            <>
              <Tooltip title={username}>
                <StyledIcon
                  onClick={handleUserMenuClick}
                  style={{ cursor: 'pointer' }}
                >
                  <Avatar />
                </StyledIcon>
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
                  {userTrans('changePassword')}
                </MenuItem>
              </Menu>
            </>
          )}
          <Tooltip title={'disconnect'}>
            <StyledIcon>
              <LogoutIcon onClick={handleLogout} />
            </StyledIcon>
          </Tooltip>
        </AddressWrapper>
      </ContentWrapper>
    </HeaderWrapper>
  );
};

export default Header;

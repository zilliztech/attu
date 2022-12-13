import { FC, useContext } from 'react';
import { makeStyles, Theme, createStyles, Typography } from '@material-ui/core';
import { HeaderType } from './Types';
import { navContext } from '../../context/Navigation';
import icons from '../icons/Icons';
import { useNavigate } from 'react-router-dom';
import { authContext } from '../../context/Auth';
import { useTranslation } from 'react-i18next';
import { MilvusHttp } from '../../http/Milvus';
import { MILVUS_ADDRESS } from '../../consts/Localstorage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.common.black,
      marginRight: theme.spacing(5),
    },
    contentWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing(3),
      paddingLeft: theme.spacing(6),
      flex: 1,
    },
    navigation: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      color: theme.palette.primary.main,
      cursor: 'pointer',
    },
    addressWrapper: {
      display: 'flex',
      alignItems: 'center',

      '& .text': {
        marginRight: theme.spacing(3),

        '& .address': {
          fontSize: '14px',
          lineHeight: '20px',
          color: '#545454',
        },

        '& .status': {
          fontSize: '12px',
          lineHeight: '16px',
          color: '#1ba954',
          textTransform: 'capitalize',
        },
      },
    },
  })
);

const Header: FC<HeaderType> = props => {
  const classes = useStyles();
  const { navInfo } = useContext(navContext);
  const { address, setAddress, setIsAuth } = useContext(authContext);
  const navigate = useNavigate();
  const { t: commonTrans } = useTranslation();
  const statusTrans = commonTrans('status');
  const BackIcon = icons.back;
  const LogoutIcon = icons.logout;

  const handleBack = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    setAddress('');
    setIsAuth(false);
    window.localStorage.removeItem(MILVUS_ADDRESS);
    await MilvusHttp.closeConnection();

    // window.localStorage.removeItem(MILVUS_ADDRESS);
  };

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

          <Typography variant="h4" color="textPrimary">
            {navInfo.navTitle}
          </Typography>
        </div>

        <div className={classes.addressWrapper}>
          <div className="text">
            <Typography className="address">{address}</Typography>
            <Typography className="status">{statusTrans.running}</Typography>
          </div>
          <LogoutIcon classes={{ root: classes.icon }} onClick={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;

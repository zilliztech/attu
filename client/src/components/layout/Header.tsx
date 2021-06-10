import { FC, useContext } from 'react';
import { makeStyles, Theme, createStyles, Typography } from '@material-ui/core';
import { HeaderType } from './Types';
import { navContext } from '../../context/Navigation';
import icons from '../icons/Icons';
import { useHistory } from 'react-router-dom';
import { authContext } from '../../context/Auth';
import { useTranslation } from 'react-i18next';

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
      fontWeight: 'bold',
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

        '& p': {
          margin: 0,
        },

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
  const { address, setIsAuth, setAddress } = useContext(authContext);
  const history = useHistory();
  const { t } = useTranslation();
  const statusTrans: { [key in string]: string } = t('status');
  const BackIcon = icons.back;
  const LogoutIcon = icons.logout;

  const handleBack = (path: string) => {
    history.push(path);
  };

  const handleLogout = () => {
    setAddress('');
    setIsAuth(false);
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
            <p className="address">{address}</p>
            <p className="status">{statusTrans.running}</p>
          </div>
          <LogoutIcon classes={{ root: classes.icon }} onClick={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;

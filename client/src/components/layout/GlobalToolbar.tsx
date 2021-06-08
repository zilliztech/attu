import React, { useContext } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  // Divider
} from '@material-ui/core';
import icons from '../icons/Icons';
// import CustomButton from '../customButton/CustomButton';
import SimpleMenu from '../menu/SimpleMenu';
import { useTranslation } from 'react-i18next';
import { GlobalCreateType } from './Types';
import { StatusEnum } from '../status/Types';
// import { rootContext } from '../../context/Root';
// import GlobalSearch from './GlobalSearch';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      background: theme.palette.common.white,
      marginBottom: theme.spacing(3),
      marginTop: theme.spacing(3),
      backgroundColor: 'transparent',
    },
    buttonWrapper: {
      boxSizing: 'border-box',
      padding: theme.spacing(1, 2.5),
      backgroundColor: theme.palette.common.white,
      width: (props: any) => props.width,

      display: 'flex',
      flexDirection: 'column',
    },
    button: {
      paddingLeft: theme.spacing(1),
      color: theme.palette.common.black,
      marginTop: theme.spacing(1),
    },
    btn: {
      width: '100%',
      padding: theme.spacing(1, 0),
      fontSize: '16px',
      lineHeight: '24px',
    },
    breadcrumb: {
      padding: theme.spacing(1, 2),
      backgroundColor: theme.palette.common.white,
      marginLeft: '2px',
      flex: 1,
    },
    divider: {
      margin: theme.spacing(1, 0),
    },
    container: {},
  })
);

const GlobalToolbar = (props: { width: String }) => {
  const { t } = useTranslation();
  const classes = useStyles(props);
  const { t: btnTrans } = useTranslation('btn');
  const navTrans: any = t('nav');

  // const SearchIcon = icons.search;
  const AddIcon = icons.add;

  // const handleGlobalSearch = () => {
  //   openDialog({
  //     open: true,
  //     type: 'custom',
  //     params: {
  //       component: <GlobalSearch options={top100Films} />,
  //       containerClass: classes.container,
  //     },
  //   });
  // };

  return (
    <div className={classes.root}>
      <div className={classes.buttonWrapper}>
        <SimpleMenu
          label={btnTrans('create')}
          menuItems={[]}
          buttonProps={{
            startIcon: <AddIcon />,
            variant: 'contained',
            className: classes.btn,
          }}
        ></SimpleMenu>

        {/* <CustomButton
          startIcon={<SearchIcon />}
          variant="outlined"
          className={classes.button}
          onClick={handleGlobalSearch}
        >
          {btnTrans('search')}
        </CustomButton> */}
      </div>
    </div>
  );
};

export default GlobalToolbar;

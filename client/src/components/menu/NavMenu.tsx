import React, { FC, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { NavMenuItem, NavMenuType } from './Types';
import logoPath from '../../assets/imgs/logo.png';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: (props: any) => props.width || '100%',
      background: theme.palette.common.white,

      paddingBottom: theme.spacing(5),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    item: {
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(3),

      width: 'initial',
      color: '#82838e',

      '& svg': {
        width: '20px',
        height: '20px',

        '& path': {
          stroke: '#82838e',
        },

        '& .st0': {
          fill: '#82838e',
        },
      },
    },
    itemIcon: {
      minWidth: '20px',
      marginRight: theme.spacing(1),
    },
    active: {
      color: theme.palette.primary.main,
      borderRight: `2px solid ${theme.palette.primary.main}`,

      '& svg': {
        '& path': {
          stroke: theme.palette.primary.main,

          transition: 'all 0.2s',
        },

        '& .st0': {
          fill: theme.palette.primary.main,

          transition: 'all 0.2s',
        },
      },
    },

    logoWrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      marginTop: '30px',

      marginBottom: '65px',
    },
    logo: {
      width: '150px',
    },

    feedback: {
      color: theme.palette.primary.main,

      '&:hover': {
        backgroundColor: '#fff',
      },
    },
  })
);

const NavMenu: FC<NavMenuType> = props => {
  const { width, data, defaultActive = '', defaultOpen = {} } = props;
  const classes = useStyles({ width });
  const [open, setOpen] = React.useState<{ [x: string]: boolean }>(defaultOpen);
  const [active, setActive] = React.useState<string>(defaultActive);
  const location = useLocation();

  const handleClick = (label: string) => {
    setOpen(v => ({
      ...v,
      [label]: !v[label],
    }));
  };

  const { t } = useTranslation();
  const navTrans: { [key in string]: string | object } = t('nav');

  useEffect(() => {
    const activeLabel = location.pathname.includes('queries')
      ? (navTrans.query as string)
      : (navTrans.database as string);
    setActive(activeLabel);
  }, [location.pathname, navTrans.query, navTrans.database]);

  const NestList = (props: { data: NavMenuItem[]; className?: string }) => {
    const { className, data } = props;
    return (
      <>
        {data.map((v: any) => {
          const IconComponent = v.icon;
          if (v.children) {
            return (
              <div key={v.label}>
                <ListItem button onClick={() => handleClick(v.label)}>
                  {v.icon && (
                    <ListItemIcon>
                      <IconComponent />
                    </ListItemIcon>
                  )}

                  <ListItemText primary={v.label} />
                  {open[v.label] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open[v.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <NestList data={v.children} className={classes.nested} />
                  </List>
                </Collapse>
              </div>
            );
          }
          return (
            <ListItem
              button
              key={v.label}
              className={`${className || ''} ${classes.item} ${
                active === v.label ? classes.active : ''
              }`}
              onClick={() => {
                setActive(v.label);
                v.onClick && v.onClick();
              }}
            >
              {v.icon && (
                <ListItemIcon className={classes.itemIcon}>
                  <IconComponent />
                </ListItemIcon>
              )}

              <ListItemText primary={v.label} />
            </ListItem>
          );
        })}
      </>
    );
  };

  return (
    <List component="nav" className={classes.root}>
      <div>
        <div className={classes.logoWrapper}>
          <img className={classes.logo} src={logoPath} alt="cloud logo" />
        </div>

        <NestList data={data} />
      </div>
    </List>
  );
};

export default NavMenu;

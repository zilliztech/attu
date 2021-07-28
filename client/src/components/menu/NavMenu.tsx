import { useState, FC, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import { NavMenuItem, NavMenuType } from './Types';
import icons from '../icons/Icons';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';

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
      color: theme.palette.milvusGrey.dark,
    },
    itemIcon: {
      minWidth: '20px',
      marginRight: theme.spacing(1),

      '& .icon': {
        fill: 'transparent',

        '& path': {
          stroke: theme.palette.milvusGrey.dark,
        },
      },
    },
    active: {
      color: theme.palette.primary.main,
      borderRight: `2px solid ${theme.palette.primary.main}`,

      '& .icon': {
        '& path': {
          stroke: theme.palette.primary.main,
        },
      },
    },

    logoWrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      marginTop: theme.spacing(3),

      marginBottom: theme.spacing(8),

      '& .title': {
        margin: 0,
        fontSize: '16px',
        lineHeight: '19px',
        letterSpacing: '0.15px',
        color: '#323232',
      },
    },
    logo: {
      marginRight: theme.spacing(1),
    },
  })
);

const NavMenu: FC<NavMenuType> = props => {
  const { width, data, defaultActive = '', defaultOpen = {} } = props;
  const classes = useStyles({ width });
  const [open, setOpen] = useState<{ [x: string]: boolean }>(defaultOpen);
  const [active, setActive] = useState<string>(defaultActive);

  const { t } = useTranslation();
  const milvusTrans: { [key in string]: string } = t('milvus');

  const ExpandLess = icons.expandLess;
  const ExpandMore = icons.expandMore;

  const handleClick = (label: string) => {
    setOpen(v => ({
      ...v,
      [label]: !v[label],
    }));
  };

  useEffect(() => {
    if (defaultActive) {
      setActive(defaultActive);
    }
  }, [defaultActive]);

  const NestList = (props: { data: NavMenuItem[]; className?: string }) => {
    const { className, data } = props;
    return (
      <>
        {data.map((v: NavMenuItem) => {
          const IconComponent = v.icon;
          const isActive = active === v.label;
          const iconClass =
            v.iconActiveClass && v.iconNormalClass
              ? isActive
                ? v.iconActiveClass
                : v.iconNormalClass
              : 'icon';
          if (v.children) {
            return (
              <div key={v.label}>
                <ListItem button onClick={() => handleClick(v.label)}>
                  <ListItemIcon>
                    <IconComponent classes={{ root: iconClass }} />
                  </ListItemIcon>

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
                isActive ? classes.active : ''
              }`}
              onClick={() => {
                setActive(v.label);
                v.onClick && v.onClick();
              }}
            >
              <ListItemIcon className={classes.itemIcon}>
                <IconComponent classes={{ root: iconClass }} />
              </ListItemIcon>

              <ListItemText primary={v.label} />
            </ListItem>
          );
        })}
      </>
    );
  };

  const Logo = icons.milvus;

  return (
    <List component="nav" className={classes.root}>
      <div>
        <div className={classes.logoWrapper}>
          <Logo classes={{ root: classes.logo }} />
          <Typography variant="h3" className="title">
            {milvusTrans.admin}
          </Typography>
        </div>

        <NestList data={data} />
      </div>
    </List>
  );
};

export default NavMenu;

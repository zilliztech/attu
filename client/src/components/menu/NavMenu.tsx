import { useState, FC, useEffect } from 'react';
import clsx from 'clsx';
import { Theme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { NavMenuItem, NavMenuType } from './Types';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

const timeout = 150;
const duration = `${timeout}ms`;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: '#fff',
    paddingTop: 0,
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
    paddingBottom: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: theme.transitions.create('width', {
      duration,
    }),
  },
  rootCollapse: {
    width: '48px',
  },
  rootExpand: {
    width: (props: any) => props.width || '100%',
  },
  nested: {},
  item: {
    boxSizing: 'content-box',
    width: 'initial',
    color: theme.palette.attuGrey.dark,
    borderRadius: 8,
    fontWeight: 500,
    margin: theme.spacing(0.5),

    '&:hover': {
      backgroundColor: theme.palette.primary.main,

      '& .icon': {
        color: '#fff',
      },
      color: '#fff',
    },
    cursor: 'pointer',
  },
  itemIcon: {
    minWidth: '24px',
    marginRight: theme.spacing(1),
    marginLeft: '-8px',
  },
  itemText: {
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  active: {
    borderRadius: 8,
    backgroundColor: theme.palette.primary.main,

    '& .icon': {
      color: '#fff',
    },
    color: '#fff',
  },
  actionIcon: {
    position: 'fixed',
    top: 24,
    transition: theme.transitions.create('all', {
      duration,
    }),
    minWidth: '16px',
    padding: 0,

    '& svg': {
      fontSize: '16px',
    },

    '& svg path': {
      fill: theme.palette.attuGrey.dark,
    },

    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      '& svg path': {
        fill: 'white',
      },
    },
  },
  expandIcon: {
    left: '160px',
    transform: 'rotateZ(180deg)',
  },
  collapseIcon: {
    left: 48,
  },
  version: {
    position: 'absolute',
    fontSize: '10px',
    bottom: 8,
    left: 8,
  },
}));

const NavMenu: FC<NavMenuType> = props => {
  const { width, data, defaultActive = '', versionInfo } = props;
  const [expanded, setExpanded] = useState<boolean>(false);

  const classes = useStyles({ width, expanded });
  const [active, setActive] = useState<string>(defaultActive);

  useEffect(() => {
    if (defaultActive) {
      setActive(defaultActive);
    }
  }, [defaultActive]);

  const NestList = (props: { data: NavMenuItem[]; className?: string }) => {
    const { className = '', data } = props;
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

          return (
            <ListItem
              key={v.label}
              title={v.label}
              className={clsx(classes.item, {
                [className]: className,
                [classes.active]: isActive,
              })}
              onClick={() => {
                setActive(v.label);
                v.onClick && v.onClick();
              }}
            >
              <ListItemIcon className={classes.itemIcon}>
                <IconComponent classes={{ root: iconClass }} />
              </ListItemIcon>
            </ListItem>
          );
        })}
      </>
    );
  };

  return (
    <List
      component="nav"
      className={clsx(classes.root, {
        [classes.rootExpand]: expanded,
        [classes.rootCollapse]: !expanded,
      })}
    >
      <div>
        <NestList data={data} />
        <Typography
          classes={{
            root: classes.version,
          }}
        >
          v {versionInfo.attu}
        </Typography>
      </div>
    </List>
  );
};

export default NavMenu;

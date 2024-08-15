import { useState, FC, useEffect } from 'react';
import clsx from 'clsx';
import { Theme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import { NavMenuItem, NavMenuType } from './Types';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import icons from '@/components/icons/Icons';

const timeout = 150;
const duration = `${timeout}ms`;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: '#fff',
    padding: `${theme.spacing(0)}px ${theme.spacing(4)}px`,
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create('width', { duration }),
    width: 48,
  },
  item: {
    width: 'initial',
    borderRadius: 8,
    margin: theme.spacing(0.5),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      '& .icon': { color: '#fff' },
    },
    '&.attu .icon': {
      color: theme.palette.primary.main,
      '&:hover': { color: '#fff' },
      '&.active:hover': { color: '#fff' },
    },
    '& .itemIcon': {
      marginLeft: -8,
      minWidth: 24,
    },
    '&.active': {
      borderRadius: 8,
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      '& .icon path': { fill: '#fff' },
    },
  },

  version: {
    position: 'absolute',
    fontSize: 10,
    bottom: 8,
    left: 8,
  },
}));

const NavMenu: FC<NavMenuType> = props => {
  const { width, data, defaultActive = '', versionInfo } = props;
  const classes = useStyles({ width });
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
                ['active']: isActive,
                ['attu']: v.icon === icons.attu,
              })}
              onClick={() => {
                setActive(v.label);
                v.onClick && v.onClick();
              }}
            >
              <Tooltip title={v.label} placement="right">
                <ListItemIcon className="itemIcon">
                  <IconComponent classes={{ root: iconClass }} />
                </ListItemIcon>
              </Tooltip>
            </ListItem>
          );
        })}
      </>
    );
  };

  return (
    <List component="nav" className={clsx(classes.root)}>
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

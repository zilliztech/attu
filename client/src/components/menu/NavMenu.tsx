import { useState, FC, useEffect, useContext } from 'react';
import clsx from 'clsx';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import icons from '@/components/icons/Icons';
import type { NavMenuItem, NavMenuType } from './Types';
import { dataContext } from '@/context';

const NavMenu: FC<NavMenuType> = props => {
  const { data, defaultActive = '', versionInfo } = props;
  // Styles moved inline using sx prop
  const [active, setActive] = useState<string>(defaultActive);

  const { databases } = useContext(dataContext);

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

          const disabled = v.label === 'Database' && databases.length === 0;
          const disabledTooltip = `No database available. Please create a database first.`;

          return (
            <ListItem
              key={v.label}
              title={v.label}
              disabled={disabled}
              sx={{
                width: 'initial',
                borderRadius: 1,
                m: 0.5,
                mb: 1.5,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme => theme.palette.primary.main,
                  color: '#fff',
                  '& .icon': { color: '#fff' },
                },
                '&.attu .icon': {
                  color: theme => theme.palette.primary.main,
                  '&:hover': { color: '#fff' },
                  '&.active:hover': { color: '#fff' },
                },
                '& .itemIcon': {
                  marginLeft: -1,
                  minWidth: 24,
                },
                '&.active': {
                  borderRadius: 1,
                  backgroundColor: theme => theme.palette.primary.main,
                  color: '#fff',
                  '& .icon path': { fill: '#fff' },
                },
              }}
              className={clsx({
                [className]: className,
                ['active']: isActive,
                ['attu']: v.icon === icons.attu,
              })}
              onClick={() => {
                if (disabled) return;
                setActive(v.label);
                v.onClick && v.onClick();
              }}
            >
              <Tooltip
                title={disabled ? disabledTooltip : v.label}
                placement="right"
              >
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
    <List
      component="nav"
      sx={{
        boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
        borderRight: theme => `1px solid ${theme.palette.divider}`,
        width: 48,
        pt: 0,
        color: theme => theme.palette.text.primary,
        backgroundColor: theme => theme.palette.background.default,
        position: 'relative',
      }}
    >
      <Box>
        <NestList data={data} />
        <Typography
          sx={{
            position: 'absolute',
            fontSize: 10,
            bottom: 8,
            left: 8,
          }}
        >
          v {versionInfo.attu}
        </Typography>
      </Box>
    </List>
  );
};

export default NavMenu;

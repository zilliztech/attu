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
                minWidth: 'auto',
                padding: 0,
                borderRadius: 1,
                m: 0.5,
                mb: 1,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                '& .itemIcon': {
                  minWidth: 'auto',
                  margin: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '& .icon': {
                    transform: 'scale(0.8)',
                    color: theme => theme.palette.text.primary,
                  },
                },
                '&:hover': {
                  '& .itemIcon': {
                    backgroundColor: theme => theme.palette.primary.main,
                    '& .icon': {
                      color: '#fff',
                    },
                  },
                },
                '&.attu .itemIcon': {
                  '& .icon': {
                    color: theme => theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: theme => theme.palette.primary.main,
                    '& .icon': {
                      color: '#fff',
                    },
                  },
                },
                '&.active': {
                  '& .itemIcon': {
                    backgroundColor: theme => theme.palette.primary.main,
                    '& .icon': {
                      color: '#fff',
                    },
                  },
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
        borderRight: theme => `1px solid ${theme.palette.divider}`,
        width: 46,
        pt: 0,
        color: theme => theme.palette.text.primary,
        backgroundColor: theme => theme.palette.background.paper,
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

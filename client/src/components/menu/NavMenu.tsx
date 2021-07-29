import { useState, FC, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { NavMenuItem, NavMenuType } from './Types';
import icons from '../icons/Icons';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: theme.palette.common.white,
      paddingBottom: theme.spacing(5),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: theme.transitions.create('width', {
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflow: 'hidden',
    },
    rootCollapse: {
      width: '60px',
    },
    rootExpand: {
      width: (props: any) => props.width || '100%',
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    item: {
      marginBottom: theme.spacing(2),
      boxSizing: 'content-box',
      height: theme.spacing(3),
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
      borderLeft: `4px solid ${theme.palette.primary.main}`,

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
        whiteSpace: 'nowrap',
      },
    },
    logo: {
      marginRight: theme.spacing(1),
      transition: theme.transitions.create('all', {
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    logoCollapse: {
      backgroundColor: theme.palette.primary.main,
      '& path': {
        fill: 'white',
      },
      transform: 'scale(1.5)',
    },
    actionIcon: {
      position: 'fixed',
      borderRadius: '50%',
      backgroundColor: 'white',
      top: '50%',
      transition: theme.transitions.create('all', {
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    expandIcon: {
      left: '187px',
      transform: 'rotateZ(180deg)',
    },
    collapseIcon: {
      left: '47px',
    },
  })
);

const NavMenu: FC<NavMenuType> = props => {
  const { width, data, defaultActive = '', defaultOpen = {} } = props;
  const classes = useStyles({ width });
  const [expanded, setExpanded] = useState<boolean>(true);
  const [active, setActive] = useState<string>(defaultActive);

  const { t } = useTranslation();
  const milvusTrans: { [key in string]: string } = t('milvus');

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
          return (
            <ListItem
              button
              key={v.label}
              title={v.label}
              className={`
                ${className || ''} 
                ${classes.item} 
                ${isActive ? classes.active : ''}
                `}
              onClick={() => {
                setActive(v.label);
                v.onClick && v.onClick();
              }}
            >
              <ListItemIcon className={classes.itemIcon}>
                <IconComponent classes={{ root: iconClass }} />
              </ListItemIcon>

              <ListItemText hidden={!expanded} primary={v.label} />
            </ListItem>
          );
        })}
      </>
    );
  };

  const Logo = icons.milvus;

  return (
    <List component="nav" className={`${expanded ? classes.rootExpand : classes.rootCollapse} ${classes.root} `}>
      <div>
        <div className={classes.logoWrapper}>
          <Logo classes={{ root: classes.logo }} className={`${expanded ? '' : classes.logoCollapse}`} />
          <ChevronRightIcon
            onClick={() => { setExpanded(!expanded) }}
            className={`${expanded ? classes.expandIcon : classes.collapseIcon} ${classes.actionIcon}`}
          />
          <Typography hidden={!expanded} variant="h3" className="title">
            {milvusTrans.admin}
          </Typography>
        </div>

        <NestList data={data} />
      </div>
    </List>
  );
};

export default NavMenu;

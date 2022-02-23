import { useState, FC, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { NavMenuItem, NavMenuType } from './Types';
import icons from '../icons/Icons';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CommunityBtn from './CommunityBtn';

const timeout = 150;
const duration = `${timeout}ms`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: theme.palette.common.white,
      paddingTop: 0,
      paddingBottom: theme.spacing(5),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: theme.transitions.create('width', {
        duration,
      }),
    },
    rootCollapse: {
      width: '86px',
    },
    rootExpand: {
      width: (props: any) => props.width || '100%',
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    item: {
      marginBottom: theme.spacing(2),
      paddingLeft: theme.spacing(4),
      boxSizing: 'content-box',
      height: theme.spacing(3),
      width: 'initial',
      color: theme.palette.attuGrey.dark,
    },
    itemIcon: {
      minWidth: '20px',
      marginRight: theme.spacing(1),

      '& .icon': {
        fill: 'transparent',

        '& path': {
          stroke: theme.palette.attuGrey.dark,
        },
      },
    },
    itemText: {
      whiteSpace: 'nowrap',
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
      display: 'flex',
      alignItems: 'center',
      height: '86px',
      marginBottom: theme.spacing(8),
      backgroundColor: theme.palette.primary.main,
      paddingLeft: theme.spacing(4),

      '& .title': {
        margin: 0,
        fontSize: '16px',
        letterSpacing: '0.15px',
        color: 'white',
        whiteSpace: 'nowrap',
        lineHeight: '86px',
      },
    },
    logo: {
      transition: theme.transitions.create('all', {
        duration,
      }),
    },
    logoExpand: {
      marginRight: theme.spacing(1),
      '& path': {
        fill: 'white',
      },
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
      top: '74px',
      transition: theme.transitions.create('all', {
        duration,
      }),
      minWidth: '24px',
      padding: 0,

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
      left: '187px',
      transform: 'rotateZ(180deg)',
    },
    collapseIcon: {
      left: '73px',
    },
    version: {
      position: 'absolute',
      left: '22px',
      bottom: (props: any) => (props.expanded ? '20px' : '70px'),
    },
  })
);

const NavMenu: FC<NavMenuType> = props => {
  const { width, data, defaultActive = '', versionInfo } = props;
  const [expanded, setExpanded] = useState<boolean>(false);

  const classes = useStyles({ width, expanded });
  const [active, setActive] = useState<string>(defaultActive);

  const { t: commonTrans } = useTranslation();
  const attuTrans = commonTrans('attu');

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
              button
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

              <Fade in={expanded} timeout={timeout}>
                <ListItemText className={classes.itemText} primary={v.label} />
              </Fade>
            </ListItem>
          );
        })}
      </>
    );
  };

  const Logo = icons.zilliz;

  return (
    <List
      component="nav"
      className={clsx(classes.root, {
        [classes.rootExpand]: expanded,
        [classes.rootCollapse]: !expanded,
      })}
    >
      <div>
        <div className={classes.logoWrapper}>
          <Logo
            classes={{ root: classes.logo }}
            className={clsx({
              [classes.logoExpand]: expanded,
              [classes.logoCollapse]: !expanded,
            })}
          />
          <Fade in={expanded} timeout={timeout}>
            <Typography variant="h3" className="title">
              {attuTrans.admin}
            </Typography>
          </Fade>
        </div>
        <Button
          onClick={() => {
            setExpanded(!expanded);
          }}
          className={clsx(classes.actionIcon, {
            [classes.expandIcon]: expanded,
            [classes.collapseIcon]: !expanded,
          })}
        >
          <ChevronRightIcon />
        </Button>
        <NestList data={data} />
        <Typography
          classes={{
            root: classes.version,
          }}
        >
          v {versionInfo.attu}
        </Typography>
        <CommunityBtn />
      </div>
    </List>
  );
};

export default NavMenu;

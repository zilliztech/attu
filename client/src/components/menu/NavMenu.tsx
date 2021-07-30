import { useState, FC, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
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
        duration: '100ms',
      }),
      overflow: 'hidden',
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
    itemText: {
      opacity: 0,
      transition: theme.transitions.create('opacity', {
        duration: '100ms',
      }),
      whiteSpace: 'nowrap',
    },
    itemTextExpand: {
      opacity: 1,
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
        opacity: 0,
        transition: theme.transitions.create('opacity', {
          duration: '100ms',
        }),
      },
    },
    logoWrapperExpand: {
      '& .title': {
        opacity: 1,
      },
    },
    logo: {
      transition: theme.transitions.create('all', {
        duration: '100ms',
      }),
    },
    logoExpand: {
      marginRight: theme.spacing(1),
      // backgroundColor: theme.palette.primary.main,
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
      // padding: theme.spacing(1),
      // transform: 'scale(1.5)',
    },
    actionIcon: {
      position: 'fixed',
      borderRadius: '50%',
      backgroundColor: 'white',
      top: '75px',
      transition: theme.transitions.create('all', {
        duration: '100ms',
      }),
      minWidth: '24px',
      padding: 0,

      '& svg path': {
        fill: theme.palette.milvusGrey.dark,
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

  })
);

const NavMenu: FC<NavMenuType> = props => {
  const { width, data, defaultActive = '' } = props;
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
              className={
                clsx(classes.item, {
                  [className]: className,
                  [classes.active]: isActive,
                })
              }
              onClick={() => {
                setActive(v.label);
                v.onClick && v.onClick();
              }}
            >
              <ListItemIcon className={classes.itemIcon}>
                <IconComponent classes={{ root: iconClass }} />
              </ListItemIcon>

              <ListItemText
                className={
                  clsx(classes.itemText, {
                    [classes.itemTextExpand]: expanded,
                  })
                }
                primary={v.label} />
            </ListItem>
          );
        })}
      </>
    );
  };

  const Logo = icons.milvus;

  return (
    <List component="nav" className={
      clsx(classes.root, {
        [classes.rootExpand]: expanded,
        [classes.rootCollapse]: !expanded,
      })
    }>
      <div>
        <div className={
          clsx(classes.logoWrapper, {
            [classes.logoWrapperExpand]: expanded,
          })
        }>
          <Logo
            classes={{ root: classes.logo }}
            className={
              clsx({
                [classes.logoExpand]: expanded,
                [classes.logoCollapse]: !expanded,
              })
            }
          />
          <Typography variant="h3" className="title">
            {milvusTrans.admin}
          </Typography>
        </div>
        <Button
          onClick={() => { setExpanded(!expanded) }}
          className={
            clsx(classes.actionIcon, {
              [classes.expandIcon]: expanded,
              [classes.collapseIcon]: !expanded,
            })
          }
        >
          <ChevronRightIcon />
        </Button>
        <NestList data={data} />
      </div>
    </List>
  );
};

export default NavMenu;

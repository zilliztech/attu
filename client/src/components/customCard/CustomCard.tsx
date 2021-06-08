import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
} from '@material-ui/core';
import { FC } from 'react';
import * as React from 'react';
import icons from '../icons/Icons';
import { ICustomCardProps, IMenu } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    boxShadow: 'none',
    filter: 'drop-shadow(0px 8px 24px rgba(0, 0, 0, 0.1))',
    width: '100%',

    position: 'relative',
  },
  menuItem: {
    minWidth: '160px',
    textTransform: 'capitalize',

    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  menuPaper: {
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
  },
  menuContent: {
    padding: 0,

    '&:last-child': {
      paddingBottom: 0,
    },
  },
  actions: {
    '&:hover': {
      background:
        'linear-gradient(0deg, rgba(18, 195, 244, 0.05), rgba(18, 195, 244, 0.05)), #fff',

      transition: 'all 0.3s',
    },
  },

  actionsDisable: {
    '&:hover': {
      backgroundColor: '#fff',
    },
  },
  actionBtn: {
    color: theme.palette.primary.main,
  },

  mask: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(196, 196, 196, 0.5)',
    zIndex: theme.zIndex.modal,
  },
}));

const CustomCard: FC<ICustomCardProps> = props => {
  const {
    showCardHeaderTitle = true,
    cardHeaderTitle = '',
    menu = [],
    content,
    actions,
    wrapperClassName = '',
    showMask,
    actionsDisabled = false,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const classes = getStyles();

  const handleClick = (event: any, m: IMenu) => {
    if (m.onClick) {
      m.onClick(event);
    }

    handleMenuClose();
  };

  return (
    <Card className={`${classes.root} ${wrapperClassName}`}>
      {showMask && <div className={classes.mask}></div>}
      <CardHeader
        action={
          menu.length > 0 && (
            <>
              <IconButton aria-label="settings" onClick={handleMoreClick}>
                {icons.more({ classes: { root: classes.actionBtn } })}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                disableScrollLock={true}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                classes={{ paper: classes.menuPaper }}
              >
                {menu.map((m, index) =>
                  typeof m.label === 'string' ? (
                    m.tip ? (
                      <Tooltip
                        key={m.label}
                        title={m.tip}
                        placement="right-end"
                      >
                        <span style={{ display: 'block' }}>
                          <MenuItem
                            classes={{ root: classes.menuItem }}
                            onClick={event => handleClick(event, m)}
                            disabled={m.disabled}
                          >
                            {m.label}
                          </MenuItem>
                        </span>
                      </Tooltip>
                    ) : (
                      <MenuItem
                        classes={{ root: classes.menuItem }}
                        key={m.label}
                        onClick={event => handleClick(event, m)}
                        disabled={m.disabled}
                      >
                        {m.label}
                      </MenuItem>
                    )
                  ) : (
                    <span key={index}>{m.label}</span>
                  )
                )}
              </Menu>
            </>
          )
        }
        title={showCardHeaderTitle ? cardHeaderTitle : null}
      />
      <CardContent classes={{ root: classes.menuContent }}>
        {content}
      </CardContent>
      {actions && (
        <CardActions
          classes={{
            root: actionsDisabled ? classes.actionsDisable : classes.actions,
          }}
          disableSpacing
        >
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default CustomCard;

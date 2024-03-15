import { FC, useMemo } from 'react';
import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { generateId } from '../../utils/Common';
import { SimpleMenuType } from './Types';
import CustomButton from '../customButton/CustomButton';
import { makeStyles, Theme } from '@material-ui/core';

const getStyles = makeStyles((theme: Theme) => ({
  menuPaper: {
    boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  },
  menuItem: {
    minWidth: (props: { minWidth: string }) => props.minWidth,
    padding: theme.spacing(1),

    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
}));

const SimpleMenu: FC<SimpleMenuType> = props => {
  const {
    label,
    menuItems,
    buttonProps,
    menuItemWidth = '160px',
    className = '',
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const classes = getStyles({ minWidth: menuItemWidth });
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  // for accessibility
  const id = useMemo(() => generateId(), []);

  return (
    <div className={className}>
      <CustomButton
        aria-controls={id}
        aria-haspopup="true"
        onClick={handleClick}
        {...buttonProps}
      >
        {label}
      </CustomButton>
      <Menu
        id={id}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{ paper: classes.menuPaper }}
        getContentAnchorEl={null}
        // anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        // transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <div>
          {menuItems.map((v, i) =>
            typeof v.label === 'string' ? (
              <MenuItem
                classes={{ root: classes.menuItem }}
                onClick={() => {
                  v.callback && v.callback();
                  handleClose();
                }}
                key={v.label + i}
              >
                {v.wrapperClass ? (
                  <span className={v.wrapperClass}>{v.label}</span>
                ) : (
                  v.label
                )}
              </MenuItem>
            ) : (
              <span key={i}>{v.label}</span>
            )
          )}
        </div>
      </Menu>
    </div>
  );
};

export default SimpleMenu;

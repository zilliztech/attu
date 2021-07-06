import { FC, useMemo } from 'react';
import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { generateId } from '../../utils/Common';
import { SimpleMenuType } from './Types';
import CustomButton from '../customButton/CustomButton';
import { makeStyles, Theme } from '@material-ui/core';

const getStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    minWidth: '160px',
  },
}));

const SimpleMenu: FC<SimpleMenuType> = props => {
  const { label, menuItems, buttonProps, className = '' } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const classes = getStyles();
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
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
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
                {v.label}
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

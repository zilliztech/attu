import { FC, useMemo } from 'react';
import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CustomButton from '../customButton/CustomButton';
import { generateId } from '../../utils/Common';
import type { SimpleMenuType } from './Types';

const SimpleMenu: FC<SimpleMenuType> = props => {
  const {
    label,
    menuItems,
    buttonProps,
    menuItemWidth = '160px',
    className = '',
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
        PaperProps={{
          sx: {
            boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
          },
        }}
        // anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        // transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <div>
          {menuItems.map((v, i) =>
            typeof v.label === 'string' ? (
              <MenuItem
                sx={theme => ({
                  minWidth: menuItemWidth,
                  padding: theme.spacing(1),
                  '&:hover': {
                    backgroundColor: '#f4f4f4',
                  },
                })}
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

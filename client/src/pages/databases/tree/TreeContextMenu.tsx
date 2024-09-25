import { MenuItem, Divider } from '@mui/material';
import { ContextMenu } from './types';
import { useStyles } from './style';

export const TreeContextMenu = (props: {
  onClick: Function;
  contextMenu: ContextMenu;
}) => {
  const classes = useStyles();
  const { contextMenu, onClick } = props;

  const handleMenuClick = (action: string) => {
    if (contextMenu?.nodeId) {
      console.log(`Action ${action} on node ${contextMenu.nodeId}`);
    }
    onClick();
  };

  if (!contextMenu) {
    return null;
  }

  switch (contextMenu.nodeType) {
    case 'db':
      return (
        <>
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Delete Database
          </MenuItem>
        </>
      );

    case 'collection':
      return (
        <>
          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              handleMenuClick('Rename');
            }}
          >
            Rename Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Delete Collection
          </MenuItem>
          <Divider />
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Delete Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Rename')}
          >
            Rename Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Delete Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Delete Collection
          </MenuItem>
        </>
      );
  }
};

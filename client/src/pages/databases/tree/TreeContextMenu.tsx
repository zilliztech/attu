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
            Add Collection
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Drop Database
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
            Load Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Release Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Rename')}
          >
            Rename Collection
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Rename')}
          >
            Drop Collection
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Rename')}
          >
            Duplicate Collection
          </MenuItem>

          <Divider />

          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Import File
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Insert Sample Data
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => handleMenuClick('Delete')}
          >
            Empty Collection
          </MenuItem>
        </>
      );
  }
};

import { useCallback, useContext, useMemo, useState } from 'react';
import { rootContext, authContext, dataContext } from '@/context';
import CreateCollectionDialog from '@/pages/dialogs/CreateCollectionDialog';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '@/pages/dialogs/ReleaseCollectionDialog';
import DropCollectionDialog from '@/pages/dialogs/DropCollectionDialog';
import RenameCollectionDialog from '@/pages/dialogs/RenameCollectionDialog';
import { MenuItem, Divider } from '@mui/material';
import { ContextMenu } from './types';
import { useStyles } from './style';
import { CollectionObject, DatabaseObject } from '@server/types';

export const TreeContextMenu = (props: {
  onClick: Function;
  contextMenu: ContextMenu;
}) => {
  // hooks
  const { setDialog } = useContext(rootContext);
  const classes = useStyles();
  // props
  const { contextMenu, onClick } = props;

  // handle menu click
  const handleMenuClick = (action: string) => {
    if (contextMenu?.nodeId) {
      console.log(`Action ${action} on node ${contextMenu.nodeId}`);
    }
    onClick();
  };

  // render menu
  if (!contextMenu) {
    return null;
  }

  switch (contextMenu.nodeType) {
    case 'db':
      return (
        <>
          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: <CreateCollectionDialog />,
                },
              });
            }}
          >
            Create Collection
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            disabled={true}
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
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <LoadCollectionDialog
                      collection={contextMenu.object as CollectionObject}
                      onLoad={async () => {
                        console.log('loaded');
                      }}
                    />
                  ),
                },
              });
            }}
          >
            Load Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <ReleaseCollectionDialog
                      collection={contextMenu.object as CollectionObject}
                      onRelease={async () => {
                        console.log('released');
                      }}
                    />
                  ),
                },
              });
            }}
          >
            Release Collection
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <RenameCollectionDialog
                      collection={contextMenu.object as CollectionObject}
                      cb={async () => {
                        console.log('renamed');
                      }}
                    />
                  ),
                },
              });
            }}
          >
            Rename Collection
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <DropCollectionDialog
                      collections={[contextMenu.object] as CollectionObject[]}
                      onDelete={async () => {}}
                    />
                  ),
                },
              });
            }}
          >
            Drop Collection
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

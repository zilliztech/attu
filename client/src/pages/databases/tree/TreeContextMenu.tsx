import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import CreateCollectionDialog from '@/pages/dialogs/CreateCollectionDialog';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '@/pages/dialogs/ReleaseCollectionDialog';
import DropCollectionDialog from '@/pages/dialogs/DropCollectionDialog';
import RenameCollectionDialog from '@/pages/dialogs/RenameCollectionDialog';
import InsertDialog from '@/pages/dialogs/insert/Dialog';
import ImportSampleDialog from '@/pages/dialogs/ImportSampleDialog';
import EmptyDataDialog from '@/pages/dialogs/EmptyDataDialog';
import { MenuItem, Divider } from '@mui/material';
import { ContextMenu } from './types';
import { useStyles } from './style';
import { CollectionObject } from '@server/types';

export const TreeContextMenu = (props: {
  onClick: Function;
  contextMenu: ContextMenu;
}) => {
  // hooks
  const { setDialog } = useContext(rootContext);
  const { fetchCollection } = useContext(dataContext);
  const classes = useStyles();
  // props
  const { contextMenu, onClick } = props;
  // i18n
  const { t: actionTrans } = useTranslation('action');

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
            {actionTrans('createCollection')}
          </MenuItem>
          {/* 
          <MenuItem
            className={classes.menuItem}
            disabled={true}
            onClick={() => handleMenuClick('Delete')}
          >
            {actionTrans('dropDatabase')}
          </MenuItem> */}
        </>
      );

    case 'collection':
      return (
        <>
          <MenuItem
            className={classes.menuItem}
            disabled={(contextMenu.object as CollectionObject).loaded}
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <LoadCollectionDialog
                      collection={contextMenu.object as CollectionObject}
                      onLoad={async () => {}}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('loadCollection')}
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            disabled={!(contextMenu.object as CollectionObject).loaded}
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <ReleaseCollectionDialog
                      collection={contextMenu.object as CollectionObject}
                      onRelease={async () => {}}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('releaseCollection')}
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
                      cb={async () => {}}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('renameCollection')}
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
            {actionTrans('dropCollection')}
          </MenuItem>

          <Divider />

          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              const collection = contextMenu.object as CollectionObject;
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <InsertDialog
                      defaultSelectedCollection={collection.collection_name}
                      // user can't select partition on collection page, so default value is ''
                      defaultSelectedPartition={''}
                      collections={[collection!]}
                      onInsert={async () => {
                        fetchCollection(collection.collection_name);
                      }}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('importFile')}
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              const collection = contextMenu.object as CollectionObject;
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <ImportSampleDialog
                      collection={collection}
                      cb={async () => {
                        fetchCollection(collection.collection_name);
                      }}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('insertSampleData')}
          </MenuItem>

          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              const collection = contextMenu.object as CollectionObject;
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <EmptyDataDialog
                      collection={collection}
                      cb={async () => {
                        fetchCollection(collection.collection_name);
                      }}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('emptyCollection')}
          </MenuItem>
        </>
      );
  }
};

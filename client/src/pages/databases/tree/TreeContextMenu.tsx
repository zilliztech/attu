import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { rootContext, dataContext } from '@/context';
import CreateCollectionDialog from '@/pages/dialogs/CreateCollectionDialog';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '@/pages/dialogs/ReleaseCollectionDialog';
import DropCollectionDialog from '@/pages/dialogs/DropCollectionDialog';
import RenameCollectionDialog from '@/pages/dialogs/RenameCollectionDialog';
import InsertDialog from '@/pages/dialogs/insert/Dialog';
import ImportSampleDialog from '@/pages/dialogs/ImportSampleDialog';
import EmptyDataDialog from '@/pages/dialogs/EmptyDataDialog';
import { StyledMenuItem, StyledDivider } from './StyledComponents';
import type { ContextMenu } from './types';
import type { CollectionObject } from '@server/types';

export const TreeContextMenu = (props: {
  onClick: Function;
  contextMenu: ContextMenu;
}) => {
  // hooks
  const { setDialog } = useContext(rootContext);
  const { fetchCollection, database } = useContext(dataContext);
  const navigate = useNavigate();

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
          <StyledMenuItem
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <CreateCollectionDialog
                      onCreate={collection_name => {
                        navigate(
                          `/databases/${database}/${collection_name}/schema`
                        );
                      }}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('createCollection')}
          </StyledMenuItem>
        </>
      );

    case 'collection':
      return (
        <>
          <StyledMenuItem
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
          </StyledMenuItem>
          <StyledMenuItem
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
          </StyledMenuItem>
          <StyledMenuItem
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <RenameCollectionDialog
                      collection={contextMenu.object as CollectionObject}
                      cb={async newName => {
                        await fetchCollection(newName);

                        // update collection name in the route url;
                        navigate(`/databases/${database}/${newName}/schema`);
                      }}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('renameCollection')}
          </StyledMenuItem>
          <StyledMenuItem
            onClick={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component: (
                    <DropCollectionDialog
                      collections={[contextMenu.object] as CollectionObject[]}
                      onDelete={async () => {
                        navigate(`/databases/${database}`);
                      }}
                    />
                  ),
                },
              });
            }}
          >
            {actionTrans('dropCollection')}
          </StyledMenuItem>
          <StyledDivider />
          <StyledMenuItem
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
          </StyledMenuItem>
          <StyledMenuItem
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
          </StyledMenuItem>
          <StyledMenuItem
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
          </StyledMenuItem>
        </>
      );
  }
};

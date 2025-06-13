import { useContext } from 'react';
import { Chip, IconButton, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import icons from '@/components/icons/Icons';
import CreateAliasDialog from '@/pages/dialogs/CreateAliasDialog';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import type { CollectionObject } from '@server/types';
import { CollectionService } from '@/http';

export interface AliasesProps {
  aliases: string[];
  collection: CollectionObject;
  onCreate?: Function;
  onDelete?: Function;
}

export default function Aliases(props: AliasesProps) {
  const { fetchCollection } = useContext(dataContext);

  const {
    aliases,
    collection,
    onCreate = () => {},
    onDelete = () => {},
  } = props;
  const { setDialog, openSnackBar, handleCloseDialog } =
    useContext(rootContext);
  // i18n
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: successTrans } = useTranslation('success');

  const AddIcon = icons.add;
  const DeleteIcon = icons.delete;

  const handleCreate = (e: React.MouseEvent) => {
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <CreateAliasDialog
            collection={collection}
            cb={async collectionName => {
              await onCreate(collectionName);
            }}
          />
        ),
      },
    });
    e.stopPropagation();
  };

  if (aliases.length === 0) {
    return (
      <IconButton
        onClick={handleCreate}
        size="small"
        sx={{ mt: 0.5, width: 16, height: 16 }}
        aria-label="add"
      >
        <AddIcon width="8" height="8" fontSize="small" />
      </IconButton>
    );
  }

  const handleDelete = async (params: {
    collection: CollectionObject;
    alias: string;
  }) => {
    await CollectionService.dropAlias(
      params.collection.collection_name,
      params.alias
    );
    await fetchCollection(params.collection.collection_name);
    openSnackBar(successTrans('delete', { name: collectionTrans('alias') }));
    handleCloseDialog();
    await onDelete(collection.collection_name);
  };

  const _onDelete = (alias: {
    collection: CollectionObject;
    alias: string;
  }) => {
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <DeleteTemplate
            label={btnTrans('drop')}
            title={dialogTrans('deleteTitle', {
              type: collectionTrans('alias'),
            })}
            text={collectionTrans('deleteAliasWarning')}
            handleDelete={() => handleDelete(alias)}
          />
        ),
      },
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {aliases.map(a => (
        <Chip
          key={a}
          size="small"
          label={a}
          variant="outlined"
          deleteIcon={<DeleteIcon />}
          onClick={e => {
            e.stopPropagation();
          }}
          onDelete={() => {
            _onDelete({ collection, alias: a });
          }}
        />
      ))}
      <IconButton
        onClick={handleCreate}
        size="small"
        sx={{ mt: 0.5, width: 16, height: 16 }}
        aria-label="add"
      >
        <AddIcon width="8" height="8" fontSize="small" />
      </IconButton>
    </Box>
  );
}

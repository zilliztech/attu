import { FC, useContext, useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  Box,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { CollectionService } from '@/http';
import { CollectionObject, MmapChanges } from '@server/types';
import { findKeyValue } from '@/utils';

interface EditMmapProps {
  collection: CollectionObject;
  cb?: () => void;
}

interface FieldMmapState {
  id: string;
  name: string;
  dataType: string;
  indexName: string;
  rawMmapEnabled: boolean;
  indexMmapEnabled: boolean;
  hasIndex: boolean;
}

const EditMmapDialog: FC<EditMmapProps> = props => {
  const { collection, cb } = props;

  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { fetchCollection } = useContext(dataContext);

  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: indexTrans } = useTranslation('index');

  // Current state of all fields (initial state)
  const [fieldsState, setFieldsState] = useState<FieldMmapState[]>(() => {
    return collection.schema!.fields.map(field => ({
      id: field.fieldID as string,
      name: field.name,
      indexName: field.index?.index_name,
      dataType: field.data_type,
      rawMmapEnabled:
        findKeyValue(field.type_params, 'mmap.enabled') === 'true',
      indexMmapEnabled: field.index
        ? findKeyValue(field.index!.params, 'mmap.enabled') === 'true'
        : false,
      hasIndex: !!field.index,
    }));
  });

  const isCollectionMmapEnabled = collection?.properties!.some((p: any) => {
    return p.key === 'mmap.enabled' && p.value === 'true';
  });

  // Track changes that will be applied on confirm
  const [pendingChanges, setPendingChanges] = useState<MmapChanges[]>([]);
  const [pendingCollectionMmap, setPendingCollectionMmap] = useState<boolean>(
    isCollectionMmapEnabled
  );

  const handleRawMmapChange = (fieldId: string, enabled: boolean) => {
    const field = fieldsState.find(f => f.id === fieldId)!;

    setFieldsState(prev =>
      prev.map(f => (f.id === fieldId ? { ...f, rawMmapEnabled: enabled } : f))
    );

    setPendingChanges(prev => {
      // Remove any existing changes for this field
      const filtered = prev.filter(change => change.fieldName !== field.name);
      // Add the new change
      return [
        ...filtered,
        {
          fieldName: field.name,
          indexName: field.indexName,
          rawMmapEnabled: enabled,
          // Preserve existing index change if it exists
          indexMmapEnabled: prev.find(c => c.fieldName === field.name)
            ?.indexMmapEnabled,
        },
      ];
    });
  };

  const handleIndexMmapChange = (fieldId: string, enabled: boolean) => {
    const field = fieldsState.find(f => f.id === fieldId)!;

    setFieldsState(prev =>
      prev.map(f =>
        f.id === fieldId ? { ...f, indexMmapEnabled: enabled } : f
      )
    );

    setPendingChanges(prev => {
      // Remove any existing changes for this field
      const filtered = prev.filter(change => change.fieldName !== field.name);
      // Add the new change
      return [
        ...filtered,
        {
          fieldName: field.name,
          indexName: field.indexName,
          // Preserve existing raw change if it exists
          rawMmapEnabled: prev.find(c => c.fieldName === field.name)
            ?.rawMmapEnabled,
          indexMmapEnabled: enabled,
        },
      ];
    });
  };

  const handleConfirm = async () => {
    // Make the API call to update mmap settings
    try {
      if (pendingCollectionMmap !== isCollectionMmapEnabled) {
        await CollectionService.setProperty(collection.collection_name, {
          'mmap.enabled': pendingCollectionMmap,
        });
      }
      if (pendingChanges.length > 0) {
        await CollectionService.updateMmap(
          collection.collection_name,
          pendingChanges
        );

        openSnackBar(
          successTrans('updateMmap', { name: collection.collection_name }),
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating mmap settings:', error);
    } finally {
      cb && (await cb());
      await fetchCollection(collection.collection_name);
      handleCloseDialog();
    }
  };

  const notReleased = collection.loaded;
  const noChange =
    pendingChanges.length === 0 &&
    isCollectionMmapEnabled === pendingCollectionMmap;

  return (
    <DialogTemplate
      sx={{
        minWidth: '600px',
        maxWidth: '800px',
      }}
      title={dialogTrans('manageMmapTitle', {
        type: collection.collection_name,
      })}
      handleClose={handleCloseDialog}
      children={
        <Box>
          <Typography
            variant="body2"
            sx={{ margin: '8px 0 16px 0', fontSize: '14px' }}
            dangerouslySetInnerHTML={{ __html: dialogTrans('editMmapInfo') }}
          />
          <Box
            sx={{
              margin: '8px 0 0 0',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {collectionTrans('collectionMMapSettingsLabel')}
            <Switch
              checked={pendingCollectionMmap}
              onChange={e => {
                setPendingCollectionMmap(e.target.checked);
              }}
              color="primary"
              sx={{ ml: 1 }}
            />
          </Box>
          <br />
          <Table
            sx={{
              marginTop: 0,
              '& th': { fontWeight: 'bold' },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>{collectionTrans('fieldName')}</TableCell>
                <TableCell>{collectionTrans('rawData')}</TableCell>
                <TableCell>{indexTrans('index')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldsState.map(field => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{field.name}</span>
                      <span
                        style={{
                          color: 'rgba(0,0,0,0.6)',
                          fontSize: '0.8rem',
                        }}
                      >
                        {field.dataType}
                      </span>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        pendingCollectionMmap
                          ? collectionTrans('mmapFieldSettingDisabledTooltip')
                          : ''
                      }
                      placement="top"
                    >
                      <span>
                        <Switch
                          checked={
                            pendingCollectionMmap || field.rawMmapEnabled
                          }
                          onChange={e =>
                            handleRawMmapChange(field.id, e.target.checked)
                          }
                          disabled={pendingCollectionMmap}
                          color="primary"
                        />
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {field.hasIndex ? (
                      <Switch
                        checked={field.indexMmapEnabled}
                        onChange={e =>
                          handleIndexMmapChange(field.id, e.target.checked)
                        }
                        color="primary"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {indexTrans('noIndex')}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      }
      confirmDisabled={noChange || notReleased}
      confirmLabel={btnTrans('confirm')}
      confirmDisabledTooltip={
        notReleased ? collectionTrans('mmapCollectionNotReleasedTooltip') : ''
      }
      handleConfirm={handleConfirm}
    />
  );
};

export default EditMmapDialog;

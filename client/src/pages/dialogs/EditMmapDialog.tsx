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

const EditMmapDialog: FC<EditMmapProps> = ({ collection, cb }) => {
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { fetchCollection } = useContext(dataContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: indexTrans } = useTranslation('index');

  const isCollectionMmapEnabled = collection?.properties!.some(
    p => p.key === 'mmap.enabled' && p.value === 'true'
  );
  const [pendingCollectionMmap, setPendingCollectionMmap] = useState(
    isCollectionMmapEnabled
  );
  const [pendingChanges, setPendingChanges] = useState<MmapChanges[]>([]);
  const [fieldsState, setFieldsState] = useState<FieldMmapState[]>(() =>
    collection.schema!.fields.map(field => ({
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
    }))
  );

  const handleRawMmapChange = (fieldId: string, enabled: boolean) => {
    const field = fieldsState.find(f => f.id === fieldId)!;
    setFieldsState(prev =>
      prev.map(f => (f.id === fieldId ? { ...f, rawMmapEnabled: enabled } : f))
    );
    setPendingChanges(prev => {
      const filtered = prev.filter(change => change.fieldName !== field.name);
      return [
        ...filtered,
        {
          fieldName: field.name,
          indexName: field.indexName,
          rawMmapEnabled: enabled,
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
      const filtered = prev.filter(change => change.fieldName !== field.name);
      return [
        ...filtered,
        {
          fieldName: field.name,
          indexName: field.indexName,
          rawMmapEnabled: prev.find(c => c.fieldName === field.name)
            ?.rawMmapEnabled,
          indexMmapEnabled: enabled,
        },
      ];
    });
  };

  const handleConfirm = async () => {
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
      sx={{ minWidth: '600px', maxWidth: '800px' }}
      title={dialogTrans('manageMmapTitle', {
        type: collection.collection_name,
      })}
      handleClose={handleCloseDialog}
      confirmDisabled={noChange || notReleased}
      confirmLabel={btnTrans('confirm')}
      confirmDisabledTooltip={
        notReleased ? collectionTrans('mmapCollectionNotReleasedTooltip') : ''
      }
      handleConfirm={handleConfirm}
      children={
        <Box>
          <Typography
            variant="body2"
            sx={{ m: '8px 0 16px', fontSize: '14px' }}
            dangerouslySetInnerHTML={{ __html: dialogTrans('editMmapInfo') }}
          />
          <Box
            sx={{
              m: '8px 0 0',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {collectionTrans('collectionMMapSettingsLabel')}
            <Switch
              checked={pendingCollectionMmap}
              onChange={e => setPendingCollectionMmap(e.target.checked)}
              color="primary"
              sx={{ ml: 1 }}
            />
          </Box>
          <br />
          <Table
            sx={{
              mt: 0,
              '& th': { fontWeight: 'bold' },
              '& .MuiTableRow-root': { height: '40px' },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1 }}>
                  {collectionTrans('fieldName')}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  {collectionTrans('rawData')}
                </TableCell>
                <TableCell sx={{ py: 1 }}>{indexTrans('index')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldsState.map(field => (
                <TableRow
                  key={field.id}
                  sx={{ '&:last-child td': { borderBottom: 0 } }}
                >
                  <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{field.name}</span>
                      <span
                        style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.8rem' }}
                      >
                        {field.dataType}
                      </span>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
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
                  <TableCell sx={{ py: 1 }}>
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
    />
  );
};

export default EditMmapDialog;

import { FC, useContext, useState } from 'react';
import {
  Typography,
  Theme,
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
import { makeStyles } from '@mui/styles';
import { CollectionObject, MmapChanges } from '@server/types';
import { findKeyValue } from '@/utils';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
    fontSize: '14px',
  },
  collection: {
    margin: '8px 0 0 0',
    fontSize: '13px',
    fontWeight: 800,
  },
  dialog: {
    minWidth: '600px',
    maxWidth: '800px',
  },
  table: {
    marginTop: theme.spacing(0),
    '& th': {
      fontWeight: 'bold',
    },
  },
  fieldName: {
    display: 'flex',
    flexDirection: 'column',
  },
  fieldType: {
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },
}));

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

  const classes = useStyles();

  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { setCollectionProperty } = useContext(dataContext);

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
        await setCollectionProperty(
          collection.collection_name,
          'mmap.enabled',
          pendingCollectionMmap
        );
      }
      if (pendingChanges.length > 0) {
        const res = await CollectionService.updateMmap(
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
      handleCloseDialog();
    }
  };

  const notReleased = collection.loaded;
  const noChange =
    pendingChanges.length === 0 &&
    isCollectionMmapEnabled === pendingCollectionMmap;

  return (
    <DialogTemplate
      dialogClass={classes.dialog}
      title={dialogTrans('manageMmapTitle', {
        type: collection.collection_name,
      })}
      handleClose={handleCloseDialog}
      children={
        <Box>
          <p
            className={classes.desc}
            dangerouslySetInnerHTML={{ __html: dialogTrans('editMmapInfo') }}
          ></p>
          <div className={classes.collection}>
            {collectionTrans('collectionMMapSettingsLabel')}
            <Switch
              checked={pendingCollectionMmap}
              onChange={e => {
                setPendingCollectionMmap(e.target.checked);
              }}
              color="primary"
            />
          </div>
          <br />
          <Table className={classes.table}>
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
                    <Box className={classes.fieldName}>
                      <span>{field.name}</span>
                      <span className={classes.fieldType}>
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

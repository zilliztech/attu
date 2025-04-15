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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { DataService } from '@/http';
import { makeStyles } from '@mui/styles';
import { CollectionObject } from '@server/types';
import { findKeyValue } from '@/utils';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
    fontSize: '14px',
  },
  dialog: {
    minWidth: '600px',
    maxWidth: '800px',
  },
  table: {
    marginTop: theme.spacing(2),
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
  rawMmapEnabled: boolean;
  indexMmapEnabled: boolean;
  hasIndex: boolean;
}

interface MmapChanges {
  fieldName: string;
  rawMmapEnabled?: boolean;
  indexMmapEnabled?: boolean;
}

const EditMmapDialog: FC<EditMmapProps> = props => {
  const { collection, cb } = props;

  const classes = useStyles();

  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');

  // Current state of all fields (initial state)
  const [fieldsState, setFieldsState] = useState<FieldMmapState[]>(() => {
    return collection.schema!.fields.map(field => ({
      id: field.fieldID as string,
      name: field.name,
      dataType: field.data_type,
      rawMmapEnabled:
        findKeyValue(field.type_params, 'mmap.enabled') === 'true',
      indexMmapEnabled: field.index
        ? findKeyValue(field.index!.params, 'mmap.enabled') === 'true'
        : false,
      hasIndex: !!field.index,
    }));
  });

  // Track changes that will be applied on confirm
  const [pendingChanges, setPendingChanges] = useState<MmapChanges[]>([]);

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
          // Preserve existing raw change if it exists
          rawMmapEnabled: prev.find(c => c.fieldName === field.name)
            ?.rawMmapEnabled,
          indexMmapEnabled: enabled,
        },
      ];
    });
  };

  const handleConfirm = async () => {
    try {
      if (pendingChanges.length > 0) {
        console.log('Updating mmap settings:', pendingChanges);
        // await DataService.updateCollectionMmapSettings(
        //   collection.collection_name,
        //   pendingChanges
        // );
      }

      // handleCloseDialog();
      cb && cb();
    } catch (error) {
      console.error('Error updating mmap settings:', error);
    }
  };

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

          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Raw Data</TableCell>
                <TableCell>Index</TableCell>
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
                    <Switch
                      checked={field.rawMmapEnabled}
                      onChange={e =>
                        handleRawMmapChange(field.id, e.target.checked)
                      }
                      color="primary"
                    />
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
                        No index
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      }
      confirmLabel={btnTrans('confirm')}
      handleConfirm={handleConfirm}
    />
  );
};

export default EditMmapDialog;

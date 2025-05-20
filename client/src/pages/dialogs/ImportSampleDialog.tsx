import { Typography, Chip, Autocomplete, TextField } from '@mui/material';
import { FC, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { rootContext } from '@/context';
import { InsertStatusEnum } from './insert/consts';
import { DataService } from '@/http';
import { LoadSampleParam } from './Types';
import icons from '@/components/icons/Icons';
import type { CollectionObject } from '@server/types';

const DownloadIcon = icons.download;

const sizeOptions = [
  {
    label: '10',
    value: '10',
  },
  {
    label: '100',
    value: '100',
  },
  {
    label: '1000',
    value: '1000',
  },
  {
    label: '5000',
    value: '5000',
  },
  {
    label: '10k',
    value: '10000',
  },
];

const ImportSampleDialog: FC<{
  collection: CollectionObject;
  cb?: Function;
}> = props => {
  const { collection } = props;
  const [size, setSize] = useState<string>(sizeOptions[0].value);
  const [csvFileName, setCsvFileName] = useState<string>(
    `${collection.collection_name}.sample.${size}.csv`
  );
  const [jsonFileName, setJsonFileName] = useState<string>(
    `${collection.collection_name}.sample.${size}.json`
  );
  const [insertStatus, setInsertStatus] = useState<InsertStatusEnum>(
    InsertStatusEnum.init
  );

  const { t: insertTrans } = useTranslation('insert');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);

  const handleImportSample = async (
    collectionName: string,
    size: string,
    download: boolean = false,
    format: 'csv' | 'json' = 'csv'
  ): Promise<{ result: string | boolean; msg: string }> => {
    const param: LoadSampleParam = {
      collection_name: collectionName,
      size: size,
      download,
      format: format,
    };
    try {
      const res = await DataService.importSample(collectionName, param);
      if (download) {
        const fileName = format === 'csv' ? csvFileName : jsonFileName;
        const type =
          format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
        const blob = new Blob([res.sampleFile], { type });
        saveAs(blob, fileName);
        return { result: res.sampleFile, msg: '' };
      }
      await DataService.flush(collectionName);
      if (props.cb) {
        await props.cb(collectionName);
      }
      return { result: true, msg: '' };
    } catch (err: any) {
      const {
        response: {
          data: { message },
        },
      } = err;
      return { result: false, msg: message || '' };
    }
  };

  const onDownloadCSVClicked = async () => {
    return await handleImportSample(
      collection.collection_name,
      size,
      true,
      'csv'
    );
  };

  const onDownloadJSONClicked = async () => {
    return await handleImportSample(
      collection.collection_name,
      size,
      true,
      'json'
    );
  };

  const importData = async () => {
    if (insertStatus === InsertStatusEnum.success) {
      handleCloseDialog();
      return;
    }
    // start loading
    setInsertStatus(InsertStatusEnum.loading);
    const { result, msg } = await handleImportSample(
      collection.collection_name,
      size
    );

    if (!result) {
      openSnackBar(msg, 'error');
      setInsertStatus(InsertStatusEnum.init);
      return;
    }
    setInsertStatus(InsertStatusEnum.success);
    // hide dialog
    handleCloseDialog();
  };

  return (
    <DialogTemplate
      title={insertTrans('importSampleData', {
        collection: collection.collection_name,
      })}
      handleClose={handleCloseDialog}
      confirmLabel={
        insertStatus === InsertStatusEnum.init
          ? btnTrans('import')
          : insertStatus === InsertStatusEnum.loading
            ? btnTrans('importing')
            : insertStatus === InsertStatusEnum.success
              ? btnTrans('done')
              : insertStatus
      }
      handleConfirm={importData}
      confirmDisabled={insertStatus === InsertStatusEnum.loading}
      showActions={true}
      showCancel={false}
    >
      <section style={{}}>
        <div
          className="selectorWrapper"
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 16,
          }}
        >
          <div
            className="description"
            style={{
              color: '#6b7280', // theme.palette.text.secondary
              marginBottom: 16,
              fontSize: 13,
              lineHeight: 1.5,
              width: '35vw',
            }}
          >
            <Typography variant="inherit" component="p">
              {insertTrans('importSampleDataDesc')}
            </Typography>
          </div>

          <div
            className="actions"
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Autocomplete
              freeSolo
              options={sizeOptions.map(option => option.value)}
              value={size}
              onChange={(event: any, newValue: string | null) => {
                if (newValue && /^\d+$/.test(newValue)) {
                  const val = Math.min(Number(newValue), 10000).toString();
                  setSize(val);
                  setCsvFileName(
                    `${collection.collection_name}.sample.${val}.csv`
                  );
                  setJsonFileName(
                    `${collection.collection_name}.sample.${val}.json`
                  );
                }
              }}
              onInputChange={(event, newInputValue) => {
                if (/^\d*$/.test(newInputValue)) {
                  let val = newInputValue;
                  if (val) {
                    val = Math.min(Number(val), 10000).toString();
                  }
                  setSize(val);
                  setCsvFileName(
                    `${collection.collection_name}.sample.${val}.csv`
                  );
                  setJsonFileName(
                    `${collection.collection_name}.sample.${val}.json`
                  );
                }
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={insertTrans('sampleDataSize')}
                  variant="filled"
                  inputProps={{
                    ...params.inputProps,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    max: 10000,
                  }}
                  onInput={e => {
                    const input = e.target as HTMLInputElement;
                    let val = input.value.replace(/[^0-9]/g, '');
                    if (val) {
                      val = Math.min(Number(val), 10000).toString();
                    }
                    input.value = val;
                  }}
                />
              )}
              sx={{ marginBottom: 2 }}
            />
          </div>

          <div
            className="download-actions"
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Chip
              // className={classes.downloadBtn}
              sx={{
                maxWidth: '240px',
                margin: theme => theme.spacing(1.5, 1.5, 0, 0),
                fontSize: '14px',
              }}
              icon={<DownloadIcon sx={{ fontSize: '16px' }} />}
              label={csvFileName}
              title={csvFileName}
              variant="outlined"
              size="small"
              onClick={onDownloadCSVClicked}
            />
            <Chip
              // className={classes.downloadBtn}
              sx={{
                maxWidth: '240px',
                margin: theme => theme.spacing(1.5, 1.5, 0, 0),
                fontSize: '14px',
              }}
              icon={<DownloadIcon sx={{ fontSize: '16px' }} />}
              label={jsonFileName}
              title={jsonFileName}
              variant="outlined"
              size="small"
              onClick={onDownloadJSONClicked}
            />
          </div>
        </div>
      </section>
    </DialogTemplate>
  );
};

export default ImportSampleDialog;

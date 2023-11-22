import { makeStyles, Theme, Typography, Chip } from '@material-ui/core';
import { FC, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { rootContext } from '@/context';
import { InsertStatusEnum } from './insert/Types';
import { CollectionHttp, MilvusHttp } from '@/http';
import { LoadSampleParam } from './Types';
import icons from '@/components/icons/Icons';
const DownloadIcon = icons.download;

const getStyles = makeStyles((theme: Theme) => {
  return {
    icon: {
      fontSize: '16px',
    },
    downloadBtn: {
      maxWidth: '240px',
      margin: theme.spacing(1.5, 1.5, 0, 0),
    },
    selectors: {
      '& .selectorWrapper': {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: theme.spacing(2),

        '& .selectLabel': {
          fontSize: '14px',
          lineHeight: '20px',

          color: theme.palette.attuDark.main,
        },

        '& .description': {
          color: theme.palette.attuGrey.dark,
          marginBottom: theme.spacing(2),
          fontSize: 13,
          lineHeight: 1.5,
          width: '35vw',
        },
      },
      '& .actions': {
        display: 'flex',
        flexDirection: 'column',
      },
      '& .download-actions': {
        display: 'flex',
        flexDirection: 'row',
      },
      '& .selector': {
        maxWidth: '35vw',
      },
    },
  };
});

const sizeOptions = [
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

const ImportSampleDialog: FC<{ collection: string }> = props => {
  const classes = getStyles();
  const { collection } = props;
  const [size, setSize] = useState<string>(sizeOptions[0].value);
  const [csvFileName, setCsvFileName] = useState<string>(
    `${collection}.sample.${size}.csv`
  );
  const [jsonFileName, setJsonFileName] = useState<string>(
    `${collection}.sample.${size}.json`
  );
  const [insertStatus, setInsertStatus] = useState<InsertStatusEnum>(
    InsertStatusEnum.init
  );

  const { t: insertTrans } = useTranslation('insert');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  // selected collection name

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
      const res = (await CollectionHttp.importSample(
        collectionName,
        param
      )) as CollectionHttp;
      if (download) {
        const fileName = format === 'csv' ? csvFileName : jsonFileName;
        const type =
          format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
        const blob = new Blob([res._sampleFile], { type });
        saveAs(blob, fileName);
        return { result: res._sampleFile, msg: '' };
      }
      await MilvusHttp.flush(collectionName);
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
    return await handleImportSample(collection, size, true, 'csv');
  };

  const onDownloadJSONClicked = async () => {
    return await handleImportSample(collection, size, true, 'json');
  };

  const importData = async () => {
    if (insertStatus === InsertStatusEnum.success) {
      handleCloseDialog();
      return;
    }
    // start loading
    setInsertStatus(InsertStatusEnum.loading);
    const { result, msg } = await handleImportSample(collection, size);

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
        collection,
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
      // don't show close icon when insert not finish
      // showCloseIcon={insertStatus !== InsertStatusEnum.loading}
    >
      <form className={classes.selectors}>
        <div className="selectorWrapper">
          <div className="description">
            <Typography variant="inherit" component="p">
              {insertTrans('importSampleDataDesc')}
            </Typography>
          </div>

          <div className="actions">
            <CustomSelector
              label={insertTrans('sampleDataSize')}
              options={sizeOptions}
              wrapperClass="selector"
              labelClass="selectLabel"
              value={size}
              variant="filled"
              onChange={(e: { target: { value: unknown } }) => {
                const size = e.target.value;
                setSize(size as string);
                setCsvFileName(`${collection}.sample.${size}.csv`);
                setJsonFileName(`${collection}.sample.${size}.json`);
              }}
            />
          </div>

          <div className="download-actions">
            <Chip
              className={classes.downloadBtn}
              icon={<DownloadIcon />}
              label={csvFileName}
              title={csvFileName}
              variant="outlined"
              size="small"
              onClick={onDownloadCSVClicked}
            />
            <Chip
              className={classes.downloadBtn}
              icon={<DownloadIcon />}
              label={jsonFileName}
              title={jsonFileName}
              variant="outlined"
              size="small"
              onClick={onDownloadJSONClicked}
            />
          </div>
        </div>
      </form>
    </DialogTemplate>
  );
};

export default ImportSampleDialog;

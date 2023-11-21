import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomSelector from '@/components/customSelector/CustomSelector';
import CustomIconButton from '@/components/customButton/CustomIconButton';
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
      margin: theme.spacing(1.5, 1),
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
          marginBottom: theme.spacing(1),
          fontSize: 12,
        },
      },

      '& .actions': {
        display: 'flex',
        flexDirection: 'row',
      },

      '& .selector': {
        minWidth: theme.spacing(48),
      },
    },
  };
});

const ImportSampleDialog: FC<{ collection: string }> = props => {
  const classes = getStyles();
  const [size, setSize] = useState<string>('100');
  const [insertStatus, setInsertStatus] = useState<InsertStatusEnum>(
    InsertStatusEnum.init
  );

  const { t: insertTrans } = useTranslation('insert');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  // selected collection name

  const sizeOptions = [
    {
      label: '100',
      value: '100',
    },
    {
      label: '1k',
      value: '1000',
    },
    {
      label: '5k',
      value: '5000',
    },
    {
      label: '10k',
      value: '10000',
    },
  ];

  const handleImportSample = async (
    collectionName: string,
    size: string,
    download: boolean = false
  ): Promise<{ result: string | boolean; msg: string }> => {
    const param: LoadSampleParam = {
      collection_name: collectionName,
      size: size,
      download,
    };
    try {
      const res = (await CollectionHttp.importSample(
        collectionName,
        param
      )) as CollectionHttp;
      if (download) {
        const blob = new Blob([res._csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${collectionName}.sample.${size}.csv`);
        return { result: res._csv, msg: '' };
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
    return await handleImportSample(props.collection, size, true);
  };

  const importData = async () => {
    if (insertStatus === InsertStatusEnum.success) {
      handleCloseDialog();
      return;
    }
    // start loading
    setInsertStatus(InsertStatusEnum.loading);
    const { result, msg } = await handleImportSample(props.collection, size);

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
        collection: props.collection,
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
              }}
            />
            <CustomIconButton
              className={classes.downloadBtn}
              tooltip={insertTrans('downloadSampleDataCSV')}
              onClick={onDownloadCSVClicked}
            >
              <DownloadIcon />
            </CustomIconButton>
          </div>
        </div>
      </form>
    </DialogTemplate>
  );
};

export default ImportSampleDialog;

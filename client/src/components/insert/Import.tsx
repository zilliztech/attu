import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme, Divider, Typography } from '@material-ui/core';
import CustomSelector from '../customSelector/CustomSelector';
import { InsertImportProps } from './Types';
import Uploader from '../uploader/Uploader';
import { INSERT_CSV_SAMPLE, INSERT_MAX_SIZE } from '../../consts/Insert';
import { parseByte } from '../../utils/Format';

const getStyles = makeStyles((theme: Theme) => ({
  tip: {
    color: theme.palette.attuGrey.dark,
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  selectors: {
    '& .selectorWrapper': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',

      marginBottom: theme.spacing(3),

      '& .selectLabel': {
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.attuDark.main,
      },

      '& .divider': {
        width: '20px',
        margin: theme.spacing(0, 4),
        backgroundColor: theme.palette.attuGrey.dark,
      },
    },

    '& .selector': {
      flexBasis: '40%',
      minWidth: '256px',
    },
  },

  uploadWrapper: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1),
    backgroundColor: '#f9f9f9',

    '& .text': {
      color: theme.palette.attuGrey.dark,
    },

    '& .file': {
      marginBottom: theme.spacing(1),
    },

    '& .uploaderWrapper': {
      display: 'flex',
      alignItems: 'center',

      border: '1px solid #e9e9ed',
      borderRadius: '4px',
      padding: theme.spacing(1),

      backgroundColor: '#fff',

      '& .uploader': {
        marginRight: theme.spacing(1),
      },
    },

    '& .sampleWrapper': {
      '& .sample': {
        backgroundColor: '#fff',
        padding: theme.spacing(2),
        margin: theme.spacing(1, 0),
      },
    },

    '& .title': {
      marginTop: theme.spacing(1),
    },

    '& .noteList': {
      marginTop: theme.spacing(1),
      paddingLeft: theme.spacing(3),
    },

    '& .noteItem': {
      maxWidth: '560px',
    },
  },
}));

const InsertImport: FC<InsertImportProps> = ({
  collectionOptions,
  partitionOptions,

  selectedCollection,
  selectedPartition,

  handleCollectionChange,
  handlePartitionChange,

  handleUploadedData,
  handleUploadFileChange,
  fileName,
  setFileName,
}) => {
  const { t: insertTrans } = useTranslation('insert');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: partitionTrans } = useTranslation('partition');
  const classes = getStyles();

  return (
    <section>
      <Typography className={classes.tip}>
        {insertTrans('targetTip')}
      </Typography>

      <form className={classes.selectors}>
        <div className="selectorWrapper">
          <CustomSelector
            options={collectionOptions}
            disabled={collectionOptions.length === 0}
            wrapperClass="selector"
            labelClass="selectLabel"
            value={selectedCollection}
            variant="filled"
            label={collectionTrans('collection')}
            onChange={(e: { target: { value: unknown } }) => {
              const collection = e.target.value;
              handleCollectionChange &&
                handleCollectionChange(collection as string);
            }}
          />
          <Divider classes={{ root: 'divider' }} />
          <CustomSelector
            options={partitionOptions}
            disabled={partitionOptions.length === 0}
            wrapperClass="selector"
            labelClass="selectLabel"
            value={selectedPartition}
            variant="filled"
            label={partitionTrans('partition')}
            onChange={(e: { target: { value: unknown } }) => {
              const partition = e.target.value;
              handlePartitionChange(partition as string);
            }}
          />
        </div>
      </form>

      <div className={classes.uploadWrapper}>
        <Typography className="text file" variant="body1">
          {insertTrans('file')}
        </Typography>
        <div className="uploaderWrapper">
          <Uploader
            btnClass="uploader"
            label={insertTrans('uploaderLabel')}
            accept=".csv"
            // selected collection will affect schema, which is required for uploaded data validation check
            // so upload file should be disabled until user select one collection
            disabled={!selectedCollection}
            disableTooltip={insertTrans('uploadFileDisableTooltip')}
            setFileName={setFileName}
            handleUploadedData={handleUploadedData}
            maxSize={parseByte(`${INSERT_MAX_SIZE}m`)}
            overSizeWarning={insertTrans('overSizeWarning', {
              size: INSERT_MAX_SIZE,
            })}
            handleUploadFileChange={handleUploadFileChange}
          />
          <Typography className="text">
            {fileName || insertTrans('fileNamePlaceHolder')}
          </Typography>
        </div>

        <div className="sampleWrapper">
          <Typography variant="body2" className="text title">
            {insertTrans('sample')}
          </Typography>
          <pre className="sample">{INSERT_CSV_SAMPLE}</pre>
        </div>

        <Typography variant="body2" className="text title">
          {insertTrans('noteTitle')}
        </Typography>
        <ul className="noteList">
          {insertTrans('notes').map(note => (
            <li key={note} className="text noteItem">
              <Typography>{note}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default InsertImport;

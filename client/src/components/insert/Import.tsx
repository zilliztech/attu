import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, Divider } from '@material-ui/core';
import CustomSelector from '../customSelector/CustomSelector';
import { FC } from 'react';
import { InsertImportProps } from './Types';
import Uploader from '../uploader/Uploader';
import { INSERT_CSV_SAMPLE } from '../../consts/Insert';

const getStyles = makeStyles((theme: Theme) => ({
  tip: {
    color: theme.palette.milvusGrey.dark,
    marginBottom: theme.spacing(1),
  },
  selectorWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& .selector': {
      flexBasis: '40%',
      minWidth: '256px',
    },

    '& .selectLabel': {
      fontSize: '14px',
      lineHeight: '20px',
      color: '#010e29',
    },

    '& .divider': {
      width: '20px',
      margin: theme.spacing(0, 4),
      backgroundColor: theme.palette.milvusGrey.dark,
    },
  },
  uploadWrapper: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1),
    backgroundColor: '#f9f9f9',

    '& .text': {
      color: theme.palette.milvusGrey.dark,
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
}) => {
  const { t: insertTrans } = useTranslation('insert');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: partitionTrans } = useTranslation('partition');
  const classes = getStyles();

  const handleCollectionChange = () => {};
  const handlePartitionChange = () => {};

  const fileName = '';

  return (
    <section>
      <Typography className={classes.tip}>
        {insertTrans('targetTip')}
      </Typography>

      <form className={classes.selectorWrapper}>
        <CustomSelector
          options={collectionOptions}
          classes={{ root: 'selector' }}
          labelClass="selectLabel"
          value={selectedCollection}
          variant="filled"
          label={collectionTrans('collection')}
          onChange={handleCollectionChange}
        />
        <Divider classes={{ root: 'divider' }} />
        <CustomSelector
          options={partitionOptions}
          classes={{ root: 'selector' }}
          labelClass="selectLabel"
          value={selectedPartition}
          variant="filled"
          label={partitionTrans('partition')}
          onChange={handlePartitionChange}
        />
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
          {insertTrans('notes', { returnObjects: true }).map(note => (
            <li className="text noteItem">
              <Typography>{note}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default InsertImport;

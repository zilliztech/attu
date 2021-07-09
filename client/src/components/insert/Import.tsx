import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, Divider } from '@material-ui/core';
import CustomSelector from '../customSelector/CustomSelector';
import { Option } from '../customSelector/Types';

const getStyles = makeStyles((theme: Theme) => ({
  tip: {
    color: theme.palette.milvusGrey.dark,
  },
  selectorWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& .selector': {
      flexBasis: '40%',
      minWidth: '256px',
    },

    '& .divider': {
      width: '20px',
      margin: theme.spacing(0, 4),
      color: theme.palette.milvusGrey.dark,
    },
  },
  uploadWrapper: {
    backgroundColor: '#f9f9f9',
    padding: theme.spacing(1),
  },
}));

const InsertImport = () => {
  const { t: insertTrans } = useTranslation('insert');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: partitionTrans } = useTranslation('partition');
  const classes = getStyles();

  const collectionOptions: Option[] = [
    {
      label: 'a',
      value: 'a',
    },
    {
      label: 'b',
      value: 'b',
    },
  ];
  const partitionOptions: Option[] = [
    {
      label: 'a',
      value: 'a',
    },
    {
      label: 'b',
      value: 'b',
    },
  ];

  const handleCollectionChange = () => {};
  const handlePartitionChange = () => {};

  return (
    <section>
      <Typography className={classes.tip}>
        {insertTrans('targetTip')}
      </Typography>

      <form className={classes.selectorWrapper}>
        <CustomSelector
          options={collectionOptions}
          classes={{ root: 'selector' }}
          value={''}
          variant="filled"
          label={collectionTrans('collection')}
          onChange={handleCollectionChange}
        />
        <Divider classes={{ root: 'divider' }} />
        <CustomSelector
          options={partitionOptions}
          classes={{ root: 'selector' }}
          value={''}
          variant="filled"
          label={partitionTrans('partition')}
          onChange={handlePartitionChange}
        />
      </form>

      <div className={classes.uploadWrapper}></div>
    </section>
  );
};

export default InsertImport;

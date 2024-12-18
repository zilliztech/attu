import { Typography } from '@mui/material';
import MediaPreview from '../MediaPreview/MediaPreview';
import { CollectionFullObject } from '@server/types';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import { formatFieldType } from '@/utils';
import DataView from '@/components/DataView/DataView';

interface DataListViewProps {
  collection: CollectionFullObject;
  data: any;
}
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: 16,
    cursor: 'initial',
  },
  dataTitleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 800,
  },
  type: {
    color: theme.palette.text.secondary,
    fontSize: 11,
    marginLeft: 4,
  },
  dataContainer: {
    display: 'flex',
    padding: 8,
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
    maxHeight: 400,
    overflow: 'auto',
  },
}));

const DataListView = (props: DataListViewProps) => {
  const { collection, data } = props;

  const classes = useStyles();

  const row = data[0];

  if (!row) {
    return <Typography>No data</Typography>;
  }

  return (
    <div className={classes.root}>
      {collection.schema.fields
        .filter(f => !f.is_function_output)
        .map((field, index) => (
          <div key={index}>
            <div className={classes.dataTitleContainer}>
              <span className={classes.title}>{field.name}</span>
              <span className={classes.type}>{formatFieldType(field)}</span>
            </div>
            <div className={classes.dataContainer}>
              <DataView type={field.data_type} value={row[field.name]} />
            </div>
          </div>
        ))}
    </div>
  );
};

export default DataListView;

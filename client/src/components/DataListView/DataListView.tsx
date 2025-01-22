import { Typography, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import { formatFieldType } from '@/utils';
import DataView from '@/components/DataView/DataView';
import { DYNAMIC_FIELD } from '@/consts';
import CopyButton from '@/components/advancedSearch/CopyButton';
import type { CollectionFullObject } from '@server/types';

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
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
  },
  type: {
    color: theme.palette.text.secondary,
    marginLeft: 4,
    marginTop: 2,
  },
  dataContainer: {
    display: 'flex',
    padding: 8,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    marginBottom: 16,
    maxHeight: 400,
    overflow: 'auto',
  },
  copy: {
    marginLeft: 0,
    '& svg': {
      width: 15,
    },
  },
  dataTypeChip: {
    fontSize: 11,
    color: theme.palette.text.primary,
    cursor: 'normal',
    marginRight: 4,
    marginLeft: 4,
    backgroundColor: theme.palette.background.grey,
  },
}));

const DataListView = (props: DataListViewProps) => {
  // props
  const { collection, data } = props;
  // styles
  const classes = useStyles();

  // page data
  let row = data[0];

  // merge dymaic fields into row
  row = {
    ...row,
    ...row[DYNAMIC_FIELD],
  };

  if (row[DYNAMIC_FIELD]) {
    delete row[DYNAMIC_FIELD];
  }

  if (!row) {
    return <Typography>No data</Typography>;
  }

  return (
    <div className={classes.root}>
      {Object.keys(row).map((name: string, index: number) => {
        const field = collection.schema.fields.find(f => f.name === name);
        return (
          <div key={index}>
            <div className={classes.dataTitleContainer}>
              <span className={classes.title}>
                {name}
                <CopyButton
                  className={classes.copy}
                  value={row[name]}
                  label={name}
                />
              </span>
              <span className={classes.type}>
                {field && (
                  <Chip
                    className={classes.dataTypeChip}
                    size="small"
                    label={formatFieldType(field) || 'meta'}
                  />
                )}
              </span>
            </div>
            <div className={classes.dataContainer}>
              <DataView
                type={(field && field.data_type) || 'any'}
                value={row[name]}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DataListView;

import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { formatFieldType } from '@/utils';
import DataView from '@/components/DataView/DataView';
import { DYNAMIC_FIELD } from '@/consts';
import CopyButton from '@/components/advancedSearch/CopyButton';
import type { CollectionFullObject } from '@server/types';

interface DataListViewProps {
  collection: CollectionFullObject;
  data: any;
}

const DataListView = (props: DataListViewProps) => {
  const { collection, data } = props;

  // Merge dynamic fields into row
  let row = data[0];
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
    <Box sx={{ padding: 2, cursor: 'initial' }}>
      {Object.keys(row).map((name: string, index: number) => {
        const field = collection.schema.fields.find(f => f.name === name);
        return (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {name}
                <CopyButton
                  copyValue={row[name]}
                  sx={{ ml: 0, '& svg': { width: 15 } }}
                />
              </Box>
              <Box sx={{ color: 'text.secondary', ml: 1, mt: 0.5 }}>
                {field && (
                  <Chip
                    size="small"
                    label={formatFieldType(field) || 'meta'}
                    sx={{
                      fontSize: 11,
                      color: 'text.primary',
                      cursor: 'normal',
                      mr: 0.5,
                      ml: 0.5,
                      backgroundColor: theme => theme.palette.background.grey,
                    }}
                  />
                )}
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                p: 1,
                border: theme => `1px solid ${theme.palette.divider}`,
                backgroundColor: theme => theme.palette.background.paper,
                borderRadius: 1,
                mb: 2,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <DataView
                type={(field && field.data_type) || 'any'}
                value={row[name]}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default DataListView;

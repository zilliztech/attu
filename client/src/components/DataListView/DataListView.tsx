import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { formatFieldType } from '@/utils';
import DataView from '@/components/DataView/DataView';
import { DYNAMIC_FIELD } from '@/consts';
import CopyButton from '@/components/advancedSearch/CopyButton';
import type { CollectionFullObject } from '@server/types';

interface DataListViewProps {
  collection: CollectionFullObject;
  data: any;
}

// Styled components
const Root = styled('div')(({ theme }) => ({
  padding: 16,
  cursor: 'initial',
}));

const DataTitleContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

const Title = styled('span')({
  fontSize: 14,
  fontWeight: 600,
});

const Type = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginLeft: 4,
  marginTop: 2,
}));

const DataContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 4,
  marginBottom: 16,
  maxHeight: 400,
  overflow: 'auto',
}));

const StyledCopyButton = styled(CopyButton)({
  marginLeft: 0,
  '& svg': {
    width: 15,
  },
});

const DataTypeChip = styled(Chip)(({ theme }) => ({
  fontSize: 11,
  color: theme.palette.text.primary,
  cursor: 'normal',
  marginRight: 4,
  marginLeft: 4,
  backgroundColor: theme.palette.background.grey,
}));

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
    <Root>
      {Object.keys(row).map((name: string, index: number) => {
        const field = collection.schema.fields.find(f => f.name === name);
        return (
          <div key={index}>
            <DataTitleContainer>
              <Title>
                {name}
                <StyledCopyButton value={row[name]} label={name} />
              </Title>
              <Type>
                {field && (
                  <DataTypeChip
                    size="small"
                    label={formatFieldType(field) || 'meta'}
                  />
                )}
              </Type>
            </DataTitleContainer>
            <DataContainer>
              <DataView
                type={(field && field.data_type) || 'any'}
                value={row[name]}
              />
            </DataContainer>
          </div>
        );
      })}
    </Root>
  );
};

export default DataListView;

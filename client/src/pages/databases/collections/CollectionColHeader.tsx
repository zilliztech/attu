import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { formatFieldType } from '@/utils';
import Icons from '@/components/icons/Icons';
import { Box } from '@mui/material';
import type { CollectionFullObject } from '@server/types';
import type { ColDefinitionsType } from '@/components/grid/Types';

const CollectionColHeader = (props: {
  def: ColDefinitionsType;
  collection: CollectionFullObject;
}) => {
  const { def, collection } = props;
  const title = def.label;
  const field = collection.schema.fields.find(f => f.name === title);

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {title}
      <CustomToolTip title={field ? formatFieldType(field) : (title as string)}>
        <Icons.info sx={{ fontSize: 14, ml: 0.5, verticalAlign: '-3px' }} />
      </CustomToolTip>
    </Box>
  );
};

export default CollectionColHeader;

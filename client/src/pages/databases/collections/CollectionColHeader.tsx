import { CollectionFullObject } from '@server/types';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { formatFieldType } from '@/utils';
import Icons from '@/components/icons/Icons';
import { makeStyles, Theme } from '@material-ui/core';
import { ColDefinitionsType } from '@/components/grid/Types';

export const style = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
    verticalAlign: '-3px',
  },
}));

const CollectionColHeader = (props: {
  def: ColDefinitionsType;
  collection: CollectionFullObject;
}) => {
  const { def, collection } = props;
  const title = def.label;
  const field = collection.schema.fields.find(f => f.name === title);
  const classes = style();

  return (
    <>
      {title}
      <CustomToolTip title={field ? formatFieldType(field) : (title as string)}>
        <Icons.info classes={{ root: classes.icon }} />
      </CustomToolTip>
    </>
  );
};

export default CollectionColHeader;

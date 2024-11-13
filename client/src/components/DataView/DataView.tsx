import { Typography } from '@mui/material';
import MediaPreview from '../MediaPreview/MediaPreview';

const DataView = (props: { type: string; value: any }) => {
  const { type, value } = props;

  switch (type) {
    case 'VarChar':
      return <MediaPreview value={value} />;
    case 'JSON':
    case 'Array':
    case 'SparseFloatVector':
    case 'BFloat16Vector':
    case 'FloatVector':
    case 'Float16Vector':
      const stringValue = JSON.stringify(value, null, 2);
      // remove escape characters
      const formattedValue = stringValue
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"');

      // remove first and last double quotes if present
      const trimmedValue = formattedValue.replace(/^"|"$/g, '');
      return <Typography title={trimmedValue}>{trimmedValue}</Typography>;

    default:
      return <Typography title={value}>{value}</Typography>;
  }
};

export default DataView;

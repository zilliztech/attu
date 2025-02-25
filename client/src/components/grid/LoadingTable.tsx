import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

const LoadingTable = (props: { wrapperClass?: string; count: number }) => {
  const { wrapperClass = '', count } = props;
  const { t: btnTrans } = useTranslation('btn');

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={2}
      className={wrapperClass}
    >
      <CircularProgress size={24} />
      <Typography variant="body1">{btnTrans('loading')}...</Typography>
    </Box>
  );
};

export default LoadingTable;

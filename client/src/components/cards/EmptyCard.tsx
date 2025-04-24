import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import type { FC } from 'react';
import type { EmptyCardProps } from './Types';

const EmptyCard: FC<EmptyCardProps> = ({
  icon,
  text,
  wrapperClass = '',
  loading = false,
}) => {
  return (
    <Box
      component="section"
      className={wrapperClass}
      sx={{
        color: 'text.disabled',
        backgroundColor: 'background.paper',
        flexDirection: 'column',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CardContent>
        {loading && <StatusIcon type={LoadingType.CREATING} size={40} />}
        {icon}
        <Typography variant="h2" sx={{ mt: 2 }}>
          {text}
        </Typography>
      </CardContent>
    </Box>
  );
};

export default EmptyCard;

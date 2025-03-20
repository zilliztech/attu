import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import type { FC } from 'react';
import type { EmptyCardProps } from './Types';

const StyledSection = styled('section')(({ theme }) => ({
  color: theme.palette.text.disabled,
  backgroundColor: theme.palette.background.paper,
  flexDirection: 'column',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const EmptyCard: FC<EmptyCardProps> = ({
  icon,
  text,
  wrapperClass = '',
  loading = false,
}) => {
  return (
    <StyledSection className={wrapperClass}>
      <CardContent>
        {loading && <StatusIcon type={LoadingType.CREATING} size={40} />}
        {icon}
        <TitleTypography variant="h2">{text}</TitleTypography>
      </CardContent>
    </StyledSection>
  );
};

export default EmptyCard;

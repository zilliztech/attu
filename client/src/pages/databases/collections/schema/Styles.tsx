import { styled } from '@mui/material/styles';
import { Chip, Box } from '@mui/material';

export const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '100%',
  overflow: 'auto',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
  maxWidth: '100%',
}));

export const InfoWrapper = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns:
    'minmax(300px, 1.5fr) minmax(250px, 1fr) minmax(250px, 1fr)',
  gap: theme.spacing(2),
  width: '100%',
}));

export const Card = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: 8,
  padding: theme.spacing(2),
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
  minWidth: 0,
}));

export const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  '&:not(:last-child)': {
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

export const InfoLabel = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 13,
  fontWeight: 400,
  minWidth: 80,
  flexShrink: 0,
  paddingTop: '2px',
}));

export const InfoValue = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: 14,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
  flexWrap: 'nowrap',
  '& .truncate': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  '& .features-wrapper': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: '100%',
    alignItems: 'flex-start',
  },
}));

export const ActionWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginLeft: 'auto',
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  fontSize: '12px',
  color: theme.palette.text.primary,
  cursor: 'normal',
  height: 24,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

export const DataTypeChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: '12px',
  height: 24,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

export const NameWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& .key': {
    width: '16px',
    height: '16px',
  },
}));

export const ParamWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  '& .param': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    '& .key': {
      color: theme.palette.text.secondary,
    },
    '& .value': {
      color: theme.palette.text.primary,
    },
  },
}));

export const GridWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
}));

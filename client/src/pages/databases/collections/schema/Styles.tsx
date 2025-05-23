import { styled } from '@mui/material/styles';
import { Chip, Box } from '@mui/material';

export const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '100%',
  overflow: 'auto',
  '& h5': {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    fontSize: 13,
    fontWeight: 400,
  },
  '& h6': {
    fontSize: 14,
    lineHeight: '20px',
    display: 'flex',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),

    '& p': {
      margin: 0,
      marginRight: 8,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: 150,
      fontWeight: 700,
    },
  },
}));

export const InfoWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  paddingTop: theme.spacing(0.5),
}));

export const CardWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  '& > div:not(:last-child)': { marginRight: theme.spacing(1.5) },
  height: 200,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

export const Card = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: 8,
  padding: theme.spacing(1.5, 2),
  boxSizing: 'border-box',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  width: 'calc(33.333% - 8px)',
  minWidth: 200,
  height: '100%',
}));

export const PrimaryKeyChip = styled('div')({
  fontSize: '8px',
});

export const StyledChip = styled(Chip)(({ theme }) => ({
  fontSize: '12px',
  color: theme.palette.text.primary,
  cursor: 'normal',
  marginRight: 4,
  marginBottom: 4,
  marginTop: 4,
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

  '& .key': {
    width: '16px',
    height: '16px',
    marginLeft: theme.spacing(0.5),
  },
}));

export const ParamWrapper = styled(Box)(({ theme }) => ({
  minWidth: 180,

  '& .param': {
    marginRight: theme.spacing(2),

    '& .key': {
      color: theme.palette.text.secondary,
      display: 'inline-block',
      marginRight: theme.spacing(0.5),
    },

    '& .value': {
      color: theme.palette.text.primary,
    },
  },
}));

export const GridWrapper = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
}));

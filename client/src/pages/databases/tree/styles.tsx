import { Box, styled } from '@mui/material';

export const TreeRoot = styled(Box)(({ theme }) => ({
  fontSize: '15px',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  '& .MuiSvgIcon-root': {
    fontSize: '14px',
    color: theme.palette.text.primary,
  },
}));

export const CollectionNode = styled(Box)(({ theme }) => ({
  minHeight: '24px',
  lineHeight: '24px',
  display: 'flex',
  minWidth: 190,
}));

export const CollectionName = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: 'calc(100% - 45px)',
  '& .collectionName': {
    minWidth: 36,
  },
}));

export const DbName = styled(Box)(({ theme }) => ({
  width: 'calc(100% - 30px)',
}));

export const Count = styled(Box)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 500,
  marginLeft: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  pointerEvents: 'none',
}));

export const Dot = styled(Box)(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  position: 'absolute',
  right: 6,
  top: 10,
  zIndex: 1,
}));

export const LoadedDot = styled(Dot)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.primary.main,
}));

export const UnloadedDot = styled(Dot)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  background: '#fff !important',
}));

export const LoadingDot = styled(Dot)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.light}`,
  backgroundColor: `${theme.palette.primary.light} !important`,
}));

export const NoIndexDot = styled(Dot)(({ theme }) => ({
  border: `1px solid ${theme.palette.text.disabled}`,
  backgroundColor: theme.palette.text.disabled,
}));

export const MenuItem = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

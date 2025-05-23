import { styled } from '@mui/material/styles';
import { Box, MenuItem, Divider } from '@mui/material';

export const CollectionNodeWrapper = styled(Box)({
  minHeight: '24px',
  lineHeight: '24px',
  display: 'flex',
  minWidth: 190,
});

export const CollectionNameWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: 'calc(100% - 45px)',
  '& .collectionName': {
    minWidth: 36,
  },
});

export const Count = styled('span')(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 500,
  marginLeft: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  pointerEvents: 'none',
}));

export const StatusDot = styled(Box, {
  shouldForwardProp: prop => prop !== 'status',
})<{ status: 'loaded' | 'unloaded' | 'loading' | 'noIndex' }>(
  ({ theme, status }) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    position: 'absolute',
    right: 6,
    top: 10,
    zIndex: 1,
    ...(status === 'loaded' && {
      border: `1px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.primary.main,
    }),
    ...(status === 'unloaded' && {
      border: `1px solid ${theme.palette.primary.main}`,
      background: '#fff !important',
    }),
    ...(status === 'loading' && {
      border: `1px solid ${theme.palette.primary.light}`,
      backgroundColor: `${theme.palette.primary.light} !important`,
    }),
    ...(status === 'noIndex' && {
      border: `1px solid ${theme.palette.text.disabled}`,
      backgroundColor: theme.palette.text.disabled,
    }),
  })
);

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '14px',
  padding: '6px 16px',
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: 0,
}));

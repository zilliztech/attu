import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100%)',
}));

export const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0, 0, 1),
  gap: theme.spacing(1),

  '& .left': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,

    '& .textarea': {
      width: '100%',
      '& .MuiFormHelperText-root': {
        display: 'none',
      },
    },
  },

  '& .right': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  '& .btn': {
    height: 56,
    width: 80,
  },
}));

export const Selector = styled(Box)({
  width: 160,
});

export const Outputs = styled(Box)({
  height: 56,
  width: 140,
});

export const Button = styled(Box)({
  height: 56,
  width: 80,
});

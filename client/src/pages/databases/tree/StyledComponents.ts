import { styled } from '@mui/material/styles';
import { Box, MenuItem, Divider } from '@mui/material';

export const Count = styled('span')(({ theme }) => ({
  fontSize: '11px',
  fontWeight: 500,
  marginLeft: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  pointerEvents: 'none',
}));

export const StatusDot = styled(Box, {
  shouldForwardProp: prop => prop !== 'status',
})<{ status: 'loaded' | 'unloaded' | 'loading' | 'noIndex' }>(
  ({ theme, status }) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
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

// New styled components for tree view
export const TreeContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 64px)',
  overflow: 'auto',
  fontSize: '15px',
  color: theme.palette.text.primary,
  '& .MuiSvgIcon-root': {
    fontSize: '14px',
    color: theme.palette.text.primary,
  },
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.15)',
    borderRadius: '3px',
    '&:hover': {
      background:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.25)'
          : 'rgba(0, 0, 0, 0.25)',
    },
  },
  '& > div': {
    width: '100%',
  },
}));

export const TreeContent = styled(Box)({
  height: '100%',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
});

export const NoResultsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100px',
  color: theme.palette.text.secondary,
}));

export const TreeNodeBox = styled(Box, {
  shouldForwardProp: prop =>
    ![
      'isSelected',
      'isContextMenuTarget',
      'isCollectionNoSchema',
      'depth',
    ].includes(prop as string),
})<{
  isSelected: boolean;
  isContextMenuTarget: boolean;
  isCollectionNoSchema: boolean;
  depth: number;
}>(({ theme, isSelected, isCollectionNoSchema, depth }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '30px',
  transform: 'translateY(0)',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  paddingLeft: `${depth * 16 === 0 ? 8 : depth * 12}px`,
  paddingRight: '8px',
  backgroundColor: isSelected
    ? theme.palette.primary.light
    : theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
  opacity: isCollectionNoSchema ? 0.5 : 1,
  color: isCollectionNoSchema ? theme.palette.text.disabled : 'inherit',
  pointerEvents: isCollectionNoSchema ? 'none' : 'auto',
  marginBottom: depth === 0 ? '0' : '0',
  boxSizing: 'border-box',
}));

export const SearchBoxContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '30px',
  transform: 'translateY(0)',
  boxSizing: 'border-box',
});

export const NodeContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
  paddingRight: '4px',
});

export const SearchButton = styled(Box)(({ theme }) => ({
  padding: '4px',
  marginLeft: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));

export const CollectionCount = styled('span')({
  marginLeft: 8,
  color: '#888',
  fontSize: 12,
});

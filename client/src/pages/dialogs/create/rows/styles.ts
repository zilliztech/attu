import { SxProps } from '@mui/material/styles';
import { Theme } from '@mui/material/styles/createTheme';

export const rowStyles = {
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: '8px',
  marginBottom: 4,
  '& .MuiFormLabel-root': {
    fontSize: 14,
  },
  '& .MuiInputBase-root': {
    fontSize: 14,
  },
  '& .MuiSelect-filled': {
    fontSize: 14,
  },
  '& .MuiCheckbox-root': {
    padding: 4,
  },
  '& .MuiFormControlLabel-label': {
    fontSize: 14,
  },
} as SxProps<Theme>;

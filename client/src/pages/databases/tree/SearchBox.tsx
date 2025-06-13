import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import icons from '@/components/icons/Icons';

interface SearchBoxProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  searchQuery,
  onSearchChange,
  onClose,
}) => {
  const { t: collectionTrans } = useTranslation('collection');
  const SearchIcon = icons.search;
  const ClearIcon = icons.clear;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'background.grey',
      }}
    >
      <TextField
        size="small"
        placeholder={collectionTrans('searchCollections')}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        autoComplete="off"
        autoFocus
        fullWidth
        InputProps={{
          sx: {
            paddingLeft: '8px',
            paddingRight: '8px',
            height: '30px',
          },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={onClose}
                edge="end"
                sx={{
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <ClearIcon
                  sx={{
                    fontSize: '16px',
                    color: 'text.secondary',
                  }}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
            fontSize: '15px',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent',
            },
          },
          '& .MuiInputBase-input': {
            padding: '4px 0',
            fontSize: '13px',
            '&::placeholder': {
              fontSize: '13px',
              opacity: 1,
              color: 'text.disabled',
            },
          },
        }}
      />
    </Box>
  );
};

export default SearchBox;

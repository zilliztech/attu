import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useRef, FC, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Icons from '../icons/Icons';
import type { SearchType } from './Types';

const SearchWrapper = styled('div')({
  display: 'flex',
});

const StyledTextField = styled(TextField, {
  shouldForwardProp: prop => prop !== 'searched',
})<{ searched?: boolean }>(({ theme, searched }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
  width: '240px',
  border: `1px solid ${theme.palette.divider}`,
  fontSize: '14px',
  transition: 'all 0.2s',

  '& .MuiAutocomplete-endAdornment': {
    right: theme.spacing(0.5),
  },

  '& .MuiInput-underline:before': {
    border: 'none',
  },

  '& .MuiInput-underline:after': {
    border: 'none',
  },

  '&:focus-within': {
    border: `1px solid ${theme.palette.primary.main}`,

    '& .search-icon': {
      width: 0,
    },
  },

  '& .MuiInputBase-input': {
    padding: 0,
    height: '16px',

    '&:focus': {
      caretColor: theme.palette.primary.main,
    },
  },
}));

const SearchIconWrapper = styled('span')<{ searched?: boolean }>(
  ({ theme, searched }) => ({
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    fontSize: '20px',
    width: searched ? 0 : '20px',
    transition: 'width 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: searched ? 0 : 1,
    overflow: 'hidden',
  })
);

const IconWrapper = styled('span')<{ searched?: boolean }>(
  ({ theme, searched }) => ({
    opacity: searched ? 1 : 0,
    transition: 'opacity 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  })
);

const ClearIcon = styled(Icons.clear)(({ theme }) => ({
  color: theme.palette.primary.main,
  cursor: 'pointer',
}));

const SearchInput: FC<SearchType> = props => {
  const { searchText = '', onClear = () => {}, onSearch = () => {} } = props;
  const [searchValue, setSearchValue] = useState<string>(searchText || '');
  const searched = useMemo(() => searchValue !== '', [searchValue]);
  const { t: commonTrans } = useTranslation();
  const inputRef = useRef<any>(null);

  const handleSearch = (value: string) => {
    onSearch(value);
  };

  useEffect(() => {
    let hashPart = window.location.hash.substring(1);
    hashPart = hashPart.replace(/(\?search=)[^&]+(&?)/, '$2');
    const searchPart = !searchValue
      ? ''
      : `?search=${encodeURIComponent(searchValue)}`;
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}#${hashPart}${searchPart}`
    );
    handleSearch(searchValue);
  }, [searchValue]);

  return (
    <SearchWrapper>
      <StyledTextField
        searched={searched}
        inputRef={inputRef}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIconWrapper
                className="search-icon"
                searched={searched}
                onClick={() => handleSearch(searchValue)}
              >
                {Icons.search()}
              </SearchIconWrapper>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconWrapper
                data-testid="clear-icon"
                searched={searched}
                onClick={() => {
                  setSearchValue('');
                  inputRef.current?.focus();
                  onClear();
                }}
              >
                <ClearIcon />
              </IconWrapper>
            </InputAdornment>
          ),
        }}
        onChange={e => {
          const value = e.target.value.trim();
          setSearchValue(value);
          if (value === '') onClear();
        }}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            handleSearch(searchValue);
            e.preventDefault();
          }
        }}
        value={searchValue || ''}
        placeholder={commonTrans('search')}
      />
    </SearchWrapper>
  );
};

export default SearchInput;

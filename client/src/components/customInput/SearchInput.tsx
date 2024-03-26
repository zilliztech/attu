import { InputAdornment, makeStyles, TextField } from '@material-ui/core';
import { useRef, FC, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Icons from '../icons/Icons';
import { SearchType } from './Types';

const useSearchStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
  },
  input: {
    backgroundColor: '#fff',
    padding: theme.spacing(1),
    width: '240px',
    border: '1px solid #e9e9ed',
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

    /**
     * when input focus
     * 1. change parent wrapper border color
     * 2. hide input start search icon
     */
    '&:focus-within': {
      border: `1px solid ${theme.palette.primary.main}`,

      '& $searchIcon': {
        width: 0,
      },
    },
  },
  textfield: {
    padding: 0,
    height: '16px',

    '&:focus': {
      caretColor: theme.palette.primary.main,
    },
  },
  searchIcon: {
    color: theme.palette.attuGrey.main,
    cursor: 'pointer',
    fontSize: '20px',
    width: (props: { searched: boolean }) => `${props.searched ? 0 : '20px'}`,

    transition: 'width 0.2s',
  },
  clearIcon: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
  iconWrapper: {
    opacity: (props: { searched: boolean }) => `${props.searched ? 1 : 0}`,
    transition: 'opacity 0.2s',
  },
  searchWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const SearchInput: FC<SearchType> = props => {
  const { searchText = '', onClear = () => {}, onSearch = () => {} } = props;
  const [searchValue, setSearchValue] = useState<string>(searchText || '');
  const searched = useMemo(() => searchValue !== '', [searchValue]);
  const classes = useSearchStyles({ searched });
  const { t: commonTrans } = useTranslation();
  const inputRef = useRef<any>(null);

  const handleSearch = (value: string) => {
    onSearch(value);
  };

  useEffect(() => {
    let hashPart = window.location.hash.substring(1);
    // remove search part from hash part, include the '?'
    hashPart = hashPart.replace(/(\?search=)[^&]+(&?)/, '$2');

    let searchPart = !searchValue
      ? ''
      : `?search=${encodeURIComponent(searchValue)}`;

    hashPart = `${hashPart}${searchPart}`;

    const newUrl = `${window.location.pathname}#${hashPart}`;

    window.history.replaceState(null, '', newUrl);

    handleSearch(searchValue);
  }, [searchValue]);

  return (
    <div className={classes.wrapper}>
      <TextField
        inputRef={inputRef}
        variant="standard"
        classes={{ root: classes.input }}
        InputProps={{
          disableUnderline: true,
          classes: { input: classes.textfield },
          endAdornment: (
            <InputAdornment position="end">
              <span
                data-testid="clear-icon"
                className={`flex-center ${classes.iconWrapper}`}
                onClick={e => {
                  setSearchValue('');
                  inputRef.current.focus();
                  onClear();
                }}
              >
                {Icons.clear({ classes: { root: classes.clearIcon } })}
              </span>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position="start">
              <span
                className={classes.searchWrapper}
                onClick={() => handleSearch(searchValue)}
              >
                {Icons.search({ classes: { root: classes.searchIcon } })}
              </span>
            </InputAdornment>
          ),
        }}
        onChange={e => {
          const value = e.target.value.trim();
          setSearchValue(value);
          if (value === '') {
            onClear();
          }
        }}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            // Do code here
            handleSearch(searchValue);
            e.preventDefault();
          }
        }}
        value={searchValue || ''}
        placeholder={commonTrans('search')}
      />
    </div>
  );
};

export default SearchInput;

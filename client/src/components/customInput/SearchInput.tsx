import { InputAdornment, makeStyles, TextField } from '@material-ui/core';
import { useRef, FC, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Icons from '../icons/Icons';
import { SearchType } from './Types';

const useSearchStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: '4px',
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
    color: '#aeaebb',
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

let timer: NodeJS.Timeout | null = null;

const SearchInput: FC<SearchType> = props => {
  const { searchText = '', onClear = () => {}, onSearch = () => {} } = props;
  const [searchValue, setSearchValue] = useState<string | null>(
    searchText || null
  );

  const [isInit, setIsInit] = useState<boolean>(true);

  const searched = useMemo(
    () => searchValue !== '' && searchValue !== null,
    [searchValue]
  );

  const classes = useSearchStyles({ searched });
  const { t: commonTrans } = useTranslation();

  const navigate = useNavigate();
  const params = useParams();

  const inputRef = useRef<any>(null);

  const savedSearchFn = useRef<(value: string) => void>(() => {});
  useEffect(() => {
    savedSearchFn.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    if (searchValue !== null && !isInit) {
      timer = setTimeout(() => {
        // // save other params data and remove last time search info
        // const location = navigate.location;
        // const params = new URLSearchParams(location.search);
        // params.delete('search');

        // if (searchValue) {
        //   params.append('search', searchValue);
        // }
        // // add search value in url
        // history.push({ search: params.toString() });

        savedSearchFn.current(searchValue);
      }, 300);
    }

    return () => {
      timer && clearTimeout(timer);
    };
  }, [searchValue, history, isInit]);

  const handleSearch = (value: string | null) => {
    if (value !== null) {
      onSearch(value);
    }
  };

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
                  setIsInit(false);
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
          setIsInit(false);
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

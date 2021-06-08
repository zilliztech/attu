import { InputAdornment, makeStyles, TextField } from '@material-ui/core';
import React, { FC, useState } from 'react';
import Icons from '../icons/Icons';
import { SearchType } from './Types';

const useSearchStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: '4px 4px 0 0',
    padding: (props: any) => `${props.showInput ? theme.spacing(0, 1) : 0}`,
    boxSizing: 'border-box',
    width: (props: any) => `${props.showInput ? '255px' : 0}`,
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
  },
  searchIcon: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    cursor: 'pointer',
    fontSize: '24px',
  },
  clearIcon: {
    color: 'rgba(0, 0, 0, 0.6)',
    cursor: 'pointer',
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    opacity: (props: any) => `${props.searched ? 1 : 0}`,
    transition: 'opacity 0.2s',
  },
  searchWrapper: {
    display: (props: any) => `${props.showInput ? 'flex' : 'none'}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const SearchInput: FC<SearchType> = props => {
  const { searchText = '', onClear = () => {}, onSearch = () => {} } = props;
  const [searchValue, setSearchValue] = useState<string>(searchText);
  const searched = searchValue !== '';
  const [showInput, setShowInput] = useState<boolean>(searchValue !== '');

  const classes = useSearchStyles({ searched, showInput });

  const inputRef = React.useRef<any>(null);

  const onIconClick = () => {
    setShowInput(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (searched) {
      onSearch(searchValue);
    }
  };

  const handleInputBlur = () => {
    setShowInput(searched);
  };

  return (
    <div className={classes.wrapper}>
      {!showInput && (
        <div className={classes.searchIcon} onClick={onIconClick}>
          {Icons.search()}
        </div>
      )}
      <TextField
        inputRef={inputRef}
        autoFocus={true}
        variant="standard"
        classes={{ root: classes.input }}
        InputProps={{
          disableUnderline: true,
          endAdornment: (
            <InputAdornment position="end">
              <span
                className={classes.iconWrapper}
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
                onClick={() => onSearch(searchValue)}
              >
                {Icons.search({ classes: { root: classes.searchIcon } })}
              </span>
            </InputAdornment>
          ),
        }}
        onBlur={handleInputBlur}
        onChange={e => {
          // console.log('change', e.target.value);
          const value = e.target.value;
          setSearchValue(value);
          if (value === '') {
            onClear();
          }
        }}
        onKeyPress={e => {
          // console.log(`Pressed keyCode ${e.key}`);
          if (e.key === 'Enter') {
            // Do code here
            onSearch(searchValue);
            e.preventDefault();
          }
        }}
        value={searchValue}
      />
    </div>
  );
};

export default SearchInput;

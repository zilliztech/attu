import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { makeStyles } from '@mui/styles';
import { FC } from 'react';
import type { Theme } from '@mui/material/styles';
import type { GroupOption, ICustomGroupSelect } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: '100%',
  },
  formControl: {
    width: '100%',
  },
  groupName: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    lineHeight: '32px',
    color: theme.palette.text.primary,
    fontWeight: 'bold',
    fontSize: '12.8px',
  },
  menuItem: {
    padding: theme.spacing(0, 4),
    lineHeight: '24px',

    '&:hover': {
      backgroundColor: 'rgba(18, 195, 244, 0.05)',
    },
  },
  menuItemSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
}));

const CustomGroupedSelect: FC<ICustomGroupSelect> = props => {
  const classes = getStyles();
  const {
    options,
    className = '',
    haveLabel = true,
    label,
    placeholder = '',
    value,
    onChange,
  } = props;

  const renderSelectGroup = (option: GroupOption) => {
    const items = option.children.map(child => {
      return (
        <MenuItem
          classes={{ root: classes.menuItem }}
          key={child.value}
          value={child.value}
        >
          {child.label}
        </MenuItem>
      );
    });
    return [
      <ListSubheader key={option.label} classes={{ root: classes.groupName }}>
        {option.label}
      </ListSubheader>,
      items,
    ];
  };

  return (
    <div className={`${classes.wrapper} ${className}`}>
      <FormControl variant="filled" className={classes.formControl}>
        {haveLabel && <InputLabel htmlFor="grouped-select">{label}</InputLabel>}
        <Select
          displayEmpty={!haveLabel}
          value={value}
          id="grouped-select"
          placeholder={placeholder}
          onChange={onChange}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          {options.map(option => renderSelectGroup(option))}
        </Select>
      </FormControl>
    </div>
  );
};

export default CustomGroupedSelect;

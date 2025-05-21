import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FC } from 'react';
import type { GroupOption, ICustomGroupSelect } from './Types';

const CustomGroupedSelect: FC<
  ICustomGroupSelect & { style?: React.CSSProperties }
> = props => {
  const {
    options,
    className = '',
    haveLabel = true,
    label,
    placeholder = '',
    value,
    onChange,
    style = {},
  } = props;

  const renderSelectGroup = (option: GroupOption) => {
    const items = option.children.map(child => (
      <MenuItem
        key={child.value}
        value={child.value}
        sx={{
          px: 4,
          lineHeight: '24px',
          '&:hover': {
            backgroundColor: 'rgba(18, 195, 244, 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          },
        }}
      >
        {child.label}
      </MenuItem>
    ));
    return [
      <ListSubheader
        key={option.label}
        sx={{
          pl: 2,
          pr: 2,
          lineHeight: '32px',
          color: theme => theme.palette.text.primary,
          fontWeight: 'bold',
          fontSize: '12.8px',
        }}
      >
        {option.label}
      </ListSubheader>,
      items,
    ];
  };

  return (
    <div className={className} style={{ width: '100%', ...style }}>
      <FormControl variant="filled" sx={{ width: '100%' }}>
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

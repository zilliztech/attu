import { FC } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { generateId } from '../../utils/Common';
import type { CustomSelectorType } from './Types';

const CustomSelector: FC<CustomSelectorType> = props => {
  const {
    label,
    value,
    onChange,
    options,
    classes,
    variant,
    wrapperClass = '',
    labelClass = '',
    size = 'medium',
    ...others
  } = props;
  const id = generateId('selector');

  return (
    <FormControl variant={variant} className={wrapperClass} size={size}>
      {label && (
        <InputLabel classes={{ root: labelClass }} htmlFor={id}>
          {label}
        </InputLabel>
      )}
      <Select
        classes={{ ...classes }}
        {...others}
        value={value}
        onChange={onChange}
        inputProps={{
          id,
        }}
      >
        {options.map(v => (
          <MenuItem key={v.value} value={v.value}>
            {v.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelector;

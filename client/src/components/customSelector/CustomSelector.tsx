import { FC } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { CustomSelectorType } from './Types';
import { generateId } from '../../utils/Common';

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

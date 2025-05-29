import { FC } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { generateId } from '../../utils/Common';
import type { CustomMultiSelectorType } from './Types';

const CustomSelector: FC<CustomMultiSelectorType> = props => {
  const {
    label,
    values,
    onChange,
    options,
    classes,
    variant,
    wrapperClass = '',
    labelClass = '',
    size = 'small',
    renderValue = selected => <>selected</>,
    sx,
    ...others
  } = props;

  const id = generateId('selector');

  return (
    <FormControl
      variant={variant}
      className={wrapperClass}
      size={size}
      sx={{ ...sx }}
    >
      {label && (
        <InputLabel className={labelClass} htmlFor={id}>
          {label}
        </InputLabel>
      )}
      <Select
        className={classes?.root}
        multiple
        value={values}
        onChange={onChange}
        inputProps={{
          id,
        }}
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
        {...others}
      >
        {options.map(v => (
          <MenuItem
            key={v.value}
            value={v.value}
            sx={{
              padding: '4px',
              fontSize: '12px',
            }}
          >
            <Checkbox
              checked={values.indexOf(v.value as string) !== -1}
              size="small"
              sx={{ padding: '4px' }}
            />
            {v.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelector;

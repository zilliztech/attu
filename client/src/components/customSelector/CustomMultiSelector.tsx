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
    ...others
  } = props;

  const id = generateId('selector');

  return (
    <FormControl
      variant={variant}
      className={wrapperClass}
      size={size}
      sx={{ minWidth: 120 }}
    >
      {label && (
        <InputLabel className={labelClass} htmlFor={id}>
          {label}
        </InputLabel>
      )}
      <Select
        className={classes?.root}
        {...others}
        multiple
        value={values}
        onChange={onChange}
        inputProps={{
          id,
        }}
        renderValue={renderValue}
        sx={{
          '& .MuiSelect-multiple': {
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
          },
        }}
      >
        {options.map(v => (
          <MenuItem
            key={v.value}
            value={v.value}
            sx={{
              minHeight: 'auto',
              px: 1,
              fontSize: '0.875rem',
            }}
          >
            <Checkbox checked={values.indexOf(v.value as string) !== -1} />
            {v.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelector;

import { FC } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import { generateId } from '../../utils/Common';
import type { CustomMultiSelectorType } from './Types';

const StyledMenuItem = styled(MenuItem)({
  minHeight: 'auto',
  padding: '0 8px',
  fontSize: '0.875rem',
});

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
    <FormControl variant={variant} className={wrapperClass} size={size}>
      {label && (
        <InputLabel className={labelClass} htmlFor={id}>
          {label}
        </InputLabel>
      )}
      <Select
        className={classes?.root}
        {...others}
        multiple={true}
        value={values}
        onChange={onChange}
        inputProps={{
          id,
        }}
        renderValue={renderValue}
      >
        {options.map(v => (
          <StyledMenuItem key={v.value} value={v.value}>
            <Checkbox checked={values.indexOf(v.value as string) !== -1} />
            {v.label}
          </StyledMenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelector;

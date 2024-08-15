import { FC } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import { CustomMultiSelectorType } from './Types';
import { generateId } from '../../utils/Common';

const CustomMenuItem = withStyles({
  root: {
    minHeight: 'auto',
    padding: '0 8px',
    fontSize: '0.875rem',
  },
})(MenuItem);

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
        <InputLabel classes={{ root: labelClass }} htmlFor={id}>
          {label}
        </InputLabel>
      )}
      <Select
        classes={{ ...classes }}
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
          <CustomMenuItem key={v.value} value={v.value}>
            <Checkbox checked={values.indexOf(v.value as string) !== -1} />
            {v.label}
          </CustomMenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelector;

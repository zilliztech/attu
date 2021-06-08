import { FC } from 'react';
import {
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core';
import { CustomSelectorType } from './Types';
import { generateId } from '../../utils/Common';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      // textTransform: 'capitalize',
    },
  })
);

/**
 *  label: We may need label lowecase or capitalize, so we cant control css inside.
 * */
const CustomSelector: FC<CustomSelectorType> = props => {
  const { label, value, onChange, options, classes, variant, ...others } =
    props;
  const id = generateId('selector');
  const selectorClasses = useStyles();

  return (
    <FormControl variant={variant} classes={classes}>
      <InputLabel htmlFor={id} className={selectorClasses.label}>
        {label}
      </InputLabel>
      <Select
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

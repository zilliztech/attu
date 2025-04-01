import React from 'react';
import { TextField } from '@mui/material';
import { useStyles } from './styles';

interface DescProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isReadOnly?: boolean;
  validate?: (value: string | number | null) => string;
}

const Desc: React.FC<DescProps> = ({
  value,
  onChange,
  className = '',
  isReadOnly = false,
  validate = (val: string | number | null) => ' ',
}) => {
  const classes = useStyles();

  return (
    <TextField
      label="Description"
      onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
        onChange(e.target.value as string);
      }}
      variant="filled"
      className={className}
      InputProps={{
        classes: {
          input: classes.descInput,
        },
      }}
      InputLabelProps={{
        shrink: true,
      }}
      size="small"
      disabled={isReadOnly}
      error={validate(value) !== ' '}
      helperText={validate(value)}
      FormHelperTextProps={{
        className: classes.helperText,
      }}
      defaultValue={value}
      type="text"
    />
  );
};

export default Desc;

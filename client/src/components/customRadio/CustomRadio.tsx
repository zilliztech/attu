import * as React from 'react';
import { FormGroup, FormControlLabel, Switch } from '@material-ui/core';

export const CustomRadio = (props: {
  label: string;
  checked?: boolean;
  handleChange: (checked: boolean) => void;
}) => {
  const { label, checked, handleChange } = props;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    handleChange(checked);
  };
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch checked={checked} onChange={onChange} color="primary" />
        }
        label={label}
      />
    </FormGroup>
  );
};

import * as React from 'react';
import { FormGroup, FormControlLabel, Switch } from '@material-ui/core';

export const CustomRadio = (props: {
  label: string;
  defaultChecked?: boolean;
  handleChange: (checked: boolean) => void;
}) => {
  const { label, defaultChecked = false, handleChange } = props;
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
          <Switch
            defaultChecked={defaultChecked}
            onChange={onChange}
            color="primary"
          />
        }
        label={label}
      />
    </FormGroup>
  );
};

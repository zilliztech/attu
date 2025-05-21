import { Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { FC } from 'react';
import { PrivilegeGrpOptionsProps } from '../Types';

const PrivilegeGroupOptions: FC<PrivilegeGrpOptionsProps> = ({
  options,
  selection,
  onChange,
}) => {
  return (
    <>
      <FormGroup row sx={{ mb: 2 }}>
        {options.map((r: string) => (
          <FormControlLabel
            control={
              <Checkbox
                onChange={(
                  e: React.ChangeEvent<HTMLInputElement>,
                  checked: boolean
                ) => {
                  let newSelection = [...selection];

                  if (!checked) {
                    newSelection = newSelection.filter((n: string) => n !== r);
                  } else {
                    newSelection.push(r);
                  }

                  onChange(newSelection);
                }}
              />
            }
            key={r}
            label={r}
            value={r}
            checked={selection.filter(s => s === r).length > 0 ? true : false}
            sx={{ width: theme => (theme as any).spacing(24) }}
          />
        ))}
      </FormGroup>
    </>
  );
};

export default PrivilegeGroupOptions;

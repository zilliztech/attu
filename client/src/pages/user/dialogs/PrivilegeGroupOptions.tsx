import {
  Theme,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { FC } from 'react';
import { PrivilegeGrpOptionsProps } from '../Types';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  checkBox: {
    width: theme.spacing(24),
  },
  formGrp: {
    marginBottom: theme.spacing(2),
  },
  subTitle: {
    marginBottom: theme.spacing(0.5),
  },
}));

const PrivilegeGroupOptions: FC<PrivilegeGrpOptionsProps> = ({
  options,
  selection,
  onChange,
}) => {
  const classes = useStyles();

  return (
    <>
      <FormGroup row className={classes.formGrp}>
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
            className={classes.checkBox}
          />
        ))}
      </FormGroup>
    </>
  );
};

export default PrivilegeGroupOptions;

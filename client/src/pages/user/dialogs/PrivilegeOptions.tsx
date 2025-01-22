import {
  Theme,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { FC } from 'react';
import { makeStyles } from '@mui/styles';
import type { Privilege, PrivilegeOptionsProps } from '../Types';

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

const PrivilegeOptions: FC<PrivilegeOptionsProps> = ({
  options,
  selection,
  onChange,
  title,
  roleName,
  object,
  objectName = '*',
}) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h6" component="h6" className={classes.subTitle}>
        {title}
      </Typography>
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
                    newSelection = newSelection.filter(
                      (n: Privilege) => n.privilegeName !== r
                    );
                  } else {
                    newSelection.push({
                      privilegeName: r,
                      object: object,
                      objectName: objectName,
                      roleName: roleName,
                    });
                  }
                  onChange(newSelection);
                }}
              />
            }
            key={r}
            label={r}
            value={r}
            checked={
              selection.filter((s: Privilege) => s.privilegeName === r).length >
              0
            }
            className={classes.checkBox}
          />
        ))}
      </FormGroup>
    </>
  );
};

export default PrivilegeOptions;

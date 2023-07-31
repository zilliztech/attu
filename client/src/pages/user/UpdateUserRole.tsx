import {
  makeStyles,
  Theme,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@material-ui/core';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { UpdateUserRoleProps, UpdateUserRoleParams } from './Types';
import { UserHttp } from '@/http/User';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(2, 0, 0.5),
  },
  dialogWrapper: {
    maxWidth: theme.spacing(70),
    '& .MuiFormControlLabel-root': {
      width: theme.spacing(20),
    },
  },
}));

const UpdateUserRole: FC<UpdateUserRoleProps> = ({
  onUpdate,
  handleClose,
  roles,
  allRoles,
  username,
}) => {
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');

  const [form, setForm] = useState<UpdateUserRoleParams>({
    roles: roles,
  });

  const classes = useStyles();

  const handleUpdate = async () => {
    await UserHttp.updateUserRole({
      username: username,
      roles: form.roles,
    });
    onUpdate(form);
  };

  return (
    <DialogTemplate
      title={userTrans('updateRoleTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('update')}
      handleConfirm={handleUpdate}
      confirmDisabled={false}
      dialogClass={classes.dialogWrapper}
    >
      <>
        <FormGroup row>
          {allRoles.map((r: any, index: number) => (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    let newRoles = [...form.roles];

                    if (!checked) {
                      newRoles = newRoles.filter(
                        (n: string | number) => n !== r
                      );
                    } else {
                      newRoles.push(r);
                    }

                    setForm(v => ({ ...v, roles: [...newRoles] }));
                  }}
                />
              }
              key={index}
              label={r}
              value={r}
              checked={form.roles.indexOf(r) !== -1}
            />
          ))}
        </FormGroup>
      </>
    </DialogTemplate>
  );
};

export default UpdateUserRole;

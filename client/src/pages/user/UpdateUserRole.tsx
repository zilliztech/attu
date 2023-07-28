import {
  makeStyles,
  Theme,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@material-ui/core';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { useFormValidation } from '@/hooks/Form';
import { formatForm } from '@/utils/Form';
import { UpdateUserRoleProps, UpdateUserRoleParams } from './Types';

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
  handleUpdate,
  handleClose,
  roles,
}) => {
  const { t: commonTrans } = useTranslation();
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState<UpdateUserRoleParams>({
    roles: [],
  });

  // selected Role
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const classes = useStyles();

  const handleInputChange = (key: 'username' | 'password', value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const handleCreateUser = () => {
    handleUpdate(form);
  };

  return (
    <DialogTemplate
      title={userTrans('createTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateUser}
      confirmDisabled={disabled}
      dialogClass={classes.dialogWrapper}
    >
      <>
        <FormGroup row>
          {roles.map((r: any, index: number) => (
            <FormControlLabel
              control={<Checkbox />}
              key={index}
              label={r.label}
              value={r.value}
              onChange={(e: React.ChangeEvent<{}>, checked: boolean) => {
                let newRoles = [...form.roles];

                if (!checked) {
                  newRoles = newRoles.filter(
                    (n: string | number) => n === r.vlaue
                  );
                } else {
                  newRoles.push(r.value);
                }

                setForm(v => ({ ...v, roles: [...newRoles] }));
              }}
            />
          ))}
        </FormGroup>
      </>
    </DialogTemplate>
  );
};

export default UpdateUserRole;

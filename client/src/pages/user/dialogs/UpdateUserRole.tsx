import { Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { UserService } from '@/http';
import type { UpdateUserRoleProps, UpdateUserRoleParams } from '../Types';

const UpdateUserRole: FC<UpdateUserRoleProps> = ({
  onUpdate,
  handleClose,
  roles,
  username,
}) => {
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  const [form, setForm] = useState<UpdateUserRoleParams>({
    username: username,
    roles: roles,
  });

  const handleUpdate = async () => {
    await UserService.updateUserRole(form);
    onUpdate(form);
  };

  const fetchAllRoles = async () => {
    const roles = await UserService.getRoles();

    setRoleOptions(roles.map(role => role.roleName));
  };

  useEffect(() => {
    fetchAllRoles();
  }, []);

  return (
    <DialogTemplate
      title={userTrans('updateRoleTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('update')}
      handleConfirm={handleUpdate}
      confirmDisabled={false}
      sx={{
        maxWidth: theme => (theme as any).spacing(70),
        '& .MuiFormControlLabel-root': {
          width: (theme: any) => theme.spacing(20),
        },
      }}
    >
      <>
        <FormGroup row>
          {roleOptions.map((roleOption: string, index: number) => (
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
                        (n: string | number) => n !== roleOption
                      );
                    } else {
                      newRoles.push(roleOption);
                    }

                    setForm(v => ({ ...v, roles: [...newRoles] }));
                  }}
                />
              }
              key={index}
              label={roleOption}
              value={roleOption}
              checked={form.roles.indexOf(roleOption) !== -1}
            />
          ))}
        </FormGroup>
      </>
    </DialogTemplate>
  );
};

export default UpdateUserRole;

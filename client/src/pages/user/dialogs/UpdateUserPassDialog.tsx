import { Theme } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { makeStyles } from '@mui/styles';
import { UserService } from '@/http';
import type { UpdateUserParams, UpdateUserProps } from '../Types';
import type { ITextfieldConfig } from '@/components/customInput/Types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: 480,
  },
  input: {
    margin: theme.spacing(1, 0, 0.5),
  },
}));

const UpdateUser: FC<UpdateUserProps> = ({
  handleClose,
  onUpdate,
  username,
}) => {
  // styles
  const classes = useStyles();

  // i18n
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  // UI state
  const [form, setForm] = useState<
    Omit<UpdateUserParams, 'username'> & { confirmPassword: string }
  >({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI handlers
  const checkedForm = useMemo(() => {
    const { oldPassword, newPassword, confirmPassword } = form;
    return formatForm({ oldPassword, newPassword, confirmPassword });
  }, [JSON.stringify(form)]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const handleInputChange = (
    key: 'oldPassword' | 'newPassword' | 'confirmPassword',
    value: string
  ) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const handleUpdateUser = async () => {
    const res = await UserService.updateUser({
      username,
      newPassword: form.newPassword,
      oldPassword: form.oldPassword,
    });
    onUpdate(res);
  };

  // UI configs
  const createConfigs: ITextfieldConfig[] = [
    {
      label: userTrans('oldPassword'),
      key: 'oldPassword',
      onChange: (value: string) => handleInputChange('oldPassword', value),
      variant: 'filled',
      className: classes.input,
      placeholder: userTrans('oldPassword'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: userTrans('oldPassword'),
          }),
        },
      ],
      type: 'password',
      defaultValue: form.oldPassword,
    },
    {
      label: userTrans('newPassword'),
      key: 'newPassword',
      onChange: (value: string) => handleInputChange('newPassword', value),
      variant: 'filled',
      className: classes.input,
      placeholder: userTrans('newPassword'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: userTrans('newPassword'),
          }),
        },
      ],
      type: 'password',
      defaultValue: form.newPassword,
    },
    {
      label: userTrans('confirmPassword'),
      key: 'confirmPassword',
      onChange: (value: string) => handleInputChange('confirmPassword', value),
      variant: 'filled',
      className: classes.input,
      placeholder: userTrans('confirmPassword'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: userTrans('newPassword'),
          }),
        },
        {
          rule: 'confirm',
          extraParam: {
            compareValue: form.newPassword,
          },
          errorText: userTrans('isNotSame'),
        },
      ],
      type: 'password',
      defaultValue: form.confirmPassword,
    },
  ];

  return (
    <DialogTemplate
      dialogClass={classes.root}
      title={userTrans('updateUserPassTitle', { username })}
      handleClose={handleClose}
      confirmLabel={btnTrans('update')}
      handleConfirm={handleUpdateUser}
      confirmDisabled={disabled}
    >
      <>
        {createConfigs.map(v => (
          <CustomInput
            type="text"
            textConfig={v}
            checkValid={checkIsValid}
            validInfo={validation}
            key={v.label}
          />
        ))}
      </>
    </DialogTemplate>
  );
};

export default UpdateUser;

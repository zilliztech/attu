import { Theme } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { UpdateUserParams, UpdateUserProps } from './Types';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(1, 0, 0.5),
  },
}));

const UpdateUser: FC<UpdateUserProps> = ({
  handleClose,
  handleUpdate,
  username,
}) => {
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState<
    Omit<UpdateUserParams, 'username'> & { confirmPassword: string }
  >({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const checkedForm = useMemo(() => {
    const { oldPassword, newPassword } = form;
    return formatForm({ oldPassword, newPassword });
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const classes = useStyles();

  const handleInputChange = (
    key: 'oldPassword' | 'newPassword' | 'confirmPassword',
    value: string
  ) => {
    setForm(v => ({ ...v, [key]: value }));
  };

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

  const handleUpdateUser = () => {
    handleUpdate({
      username,
      newPassword: form.newPassword,
      oldPassword: form.oldPassword,
    });
  };

  return (
    <DialogTemplate
      title={userTrans('updateTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
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

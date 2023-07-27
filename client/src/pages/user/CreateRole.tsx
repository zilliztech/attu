import { makeStyles, Theme } from '@material-ui/core';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks/Form';
import { formatForm } from '@/utils/Form';
import { CreateRoleProps, CreateRoleParams } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(3, 0, 0.5),
  },
}));

const CreateRole: FC<CreateRoleProps> = ({ handleCreate, handleClose }) => {
  const { t: commonTrans } = useTranslation();
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const attuTrans = commonTrans('attu');

  const [form, setForm] = useState<CreateRoleParams>({
    roleName: '',
  });
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const classes = useStyles();

  const handleInputChange = (key: 'roleName' | 'password', value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const createConfigs: ITextfieldConfig[] = [
    {
      label: userTrans('role'),
      key: 'roleName',
      onChange: (value: string) => handleInputChange('roleName', value),
      variant: 'filled',
      className: classes.input,
      placeholder: userTrans('role'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: userTrans('role'),
          }),
        },
      ],
      defaultValue: form.roleName,
    },
  ];

  const handleCreateRole = () => {
    handleCreate(form);
  };

  return (
    <DialogTemplate
      title={userTrans('createRoleTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateRole}
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

export default CreateRole;

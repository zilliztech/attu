import {
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { FC, useMemo, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { authContext } from '@/context';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import type { CreateUserProps, CreateUserParams } from '../Types';
import type { Option as RoleOption } from '@/components/customSelector/Types';
import type {
  ITextfieldConfig,
  IValidation,
} from '@/components/customInput/Types';

const CreateUser: FC<CreateUserProps> = ({
  handleCreate,
  handleClose,
  roleOptions,
}) => {
  // context
  const { isDedicated } = useContext(authContext);
  // i18n
  const { t: commonTrans } = useTranslation();
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  // UI states
  const [form, setForm] = useState<CreateUserParams>({
    username: '',
    password: '',
    roles: [],
  });

  // selected Role
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  // UI handlers
  const handleInputChange = (key: 'username' | 'password', value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const opensourceUserPassRule: IValidation[] = [
    {
      rule: 'valueLength',
      errorText: warningTrans('valueLength', {
        name: commonTrans('attu.password'),
        min: 6,
        max: 256,
      }),
      extraParam: {
        min: 6,
        max: 256,
      },
    },
  ];

  const cloudUserPassRule: IValidation[] = [
    {
      rule: 'require',
      errorText: warningTrans('required', {
        name: commonTrans('attu.password'),
      }),
    },
    {
      rule: 'valueLength',
      errorText: warningTrans('valueLength', {
        name: commonTrans('attu.password'),
        min: 8,
        max: 64,
      }),
      extraParam: {
        min: 8,
        max: 64,
      },
    },
    {
      rule: 'cloudPassword',
      errorText: warningTrans('cloudPassword'),
    },
  ];

  const inputSx = { mt: 1, mb: 0.5 };
  const createConfigs: ITextfieldConfig[] = [
    {
      label: commonTrans('attu.username'),
      key: 'username',
      onChange: (value: string) => handleInputChange('username', value),
      variant: 'filled',
      sx: inputSx,
      placeholder: commonTrans('attu.username'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: commonTrans('attu.username'),
          }),
        },
        {
          rule: 'username',
          errorText: warningTrans('username'),
        },
      ],
      defaultValue: form.username,
    },
    {
      label: commonTrans('attu.password'),
      key: 'password',
      onChange: (value: string) => handleInputChange('password', value),
      variant: 'filled',
      sx: inputSx,
      placeholder: commonTrans('attu.password'),
      fullWidth: true,
      type: 'password',
      validations: !isDedicated ? opensourceUserPassRule : cloudUserPassRule,
      defaultValue: form.username,
    },
  ];

  const handleCreateUser = () => {
    handleCreate(form);
  };

  return (
    <DialogTemplate
      title={userTrans('createTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateUser}
      confirmDisabled={disabled}
      sx={{
        maxWidth: theme => (theme as any).spacing(70),
        '& .MuiFormControlLabel-root': {
          width: (theme: any) => theme.spacing(20),
        },
      }}
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

        <Typography variant="h5" component="span">
          {userTrans('roles')}
        </Typography>

        <FormGroup row>
          {roleOptions.map((r: RoleOption, index: number) => (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    let newRoles = [...form.roles];

                    if (!checked) {
                      newRoles = newRoles.filter((n: string) => n === r.value);
                    } else {
                      newRoles.push(String(r.value));
                    }

                    setForm(v => ({ ...v, roles: [...newRoles] }));
                  }}
                />
              }
              key={index}
              label={r.label}
              value={r.value}
            />
          ))}
        </FormGroup>
      </>
    </DialogTemplate>
  );
};

export default CreateUser;

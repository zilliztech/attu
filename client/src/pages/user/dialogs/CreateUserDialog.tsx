import {
  Theme,
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
import { makeStyles } from '@mui/styles';
import type { CreateUserProps, CreateUserParams } from '../Types';
import type { Option as RoleOption } from '@/components/customSelector/Types';
import type {
  ITextfieldConfig,
  IValidation,
} from '@/components/customInput/Types';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(1, 0, 0.5),
  },
  dialogWrapper: {
    maxWidth: theme.spacing(70),
    '& .MuiFormControlLabel-root': {
      width: theme.spacing(20),
    },
  },
}));

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
  const attuTrans = commonTrans('attu');

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

  // styles
  const classes = useStyles();

  // UI handlers
  const handleInputChange = (key: 'username' | 'password', value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const opensourceUserPassRule: IValidation[] = [
    {
      rule: 'valueLength',
      errorText: warningTrans('valueLength', {
        name: attuTrans.password,
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
        name: attuTrans.password,
      }),
    },
    {
      rule: 'valueLength',
      errorText: warningTrans('valueLength', {
        name: attuTrans.password,
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

  const createConfigs: ITextfieldConfig[] = [
    {
      label: attuTrans.username,
      key: 'username',
      onChange: (value: string) => handleInputChange('username', value),
      variant: 'filled',
      className: classes.input,
      placeholder: attuTrans.username,
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: attuTrans.username,
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
      label: attuTrans.password,
      key: 'password',
      onChange: (value: string) => handleInputChange('password', value),
      variant: 'filled',
      className: classes.input,
      placeholder: attuTrans.password,
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
      dialogClass={classes.dialogWrapper}
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

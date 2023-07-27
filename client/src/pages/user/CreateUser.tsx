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
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks/Form';
import { formatForm } from '@/utils/Form';
import { CreateUserProps, CreateUserParams } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(3, 0, 0.5),
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
  roles,
}) => {
  const { t: commonTrans } = useTranslation();
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const attuTrans = commonTrans('attu');

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

  const classes = useStyles();

  const handleInputChange = (key: 'username' | 'password', value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

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
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: attuTrans.password,
          }),
        },
      ],
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

export default CreateUser;

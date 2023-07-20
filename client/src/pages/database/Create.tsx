import { makeStyles, Theme } from '@material-ui/core';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import CustomInput from '../../components/customInput/CustomInput';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import { CreateDatabaseProps, CreateDatabaseParams } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(3, 0, 0.5),
  },
}));

const CreateUser: FC<CreateDatabaseProps> = ({ handleCreate, handleClose }) => {
  const { t: databaseTrans } = useTranslation('database');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState<CreateDatabaseParams>({
    db_name: '',
  });
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const classes = useStyles();

  const handleInputChange = (key: 'db_name', value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const createConfigs: ITextfieldConfig[] = [
    {
      label: databaseTrans('database'),
      key: 'db_name',
      onChange: (value: string) => handleInputChange('db_name', value),
      variant: 'filled',
      className: classes.input,
      placeholder: databaseTrans('database'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: databaseTrans('databaseName'),
          }),
        },
      ],
      defaultValue: form.db_name,
    },
  ];

  const handleCreateDatabase = () => {
    handleCreate(form);
  };

  return (
    <DialogTemplate
      title={databaseTrans('createTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateDatabase}
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

export default CreateUser;

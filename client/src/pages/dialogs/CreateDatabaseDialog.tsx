import { Theme } from '@mui/material';
import { FC, useMemo, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { CreateDatabaseParams } from '@/http';
import { dataContext, rootContext } from '@/context';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(3, 0, 0.5),
  },
}));

export interface CreateDatabaseProps {
  onCreate?: () => void;
}

const CreateDatabaseDialog: FC<CreateDatabaseProps> = ({ onCreate }) => {
  // context
  const { createDatabase } = useContext(dataContext);
  const { openSnackBar, handleCloseDialog } = useContext(rootContext);

  // i18n
  const { t: databaseTrans } = useTranslation('database');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');

  // UI state
  const [form, setForm] = useState<CreateDatabaseParams>({
    db_name: '',
  });
  const [loading, setLoading] = useState(false);

  // validation
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

  const handleCreate = async () => {
    setLoading(true);
    const res = await createDatabase(form).finally(() => {
      setLoading(false);
    });

    openSnackBar(successTrans('create', { name: dbTrans('database') }));

    handleCloseDialog();

    if (onCreate) {
      onCreate();
    }

    setLoading(false);
  };

  const handleClose = () => {
    handleCloseDialog();
  };

  return (
    <DialogTemplate
      title={databaseTrans('createTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreate}
      confirmDisabled={disabled || loading}
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

export default CreateDatabaseDialog;

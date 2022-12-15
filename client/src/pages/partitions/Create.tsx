import { makeStyles, Theme } from '@material-ui/core';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import CustomInput from '../../components/customInput/CustomInput';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import { PartitionCreateProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(3, 0, 0.5),
  },
}));

const CreatePartition: FC<PartitionCreateProps> = ({
  handleCreate,
  handleClose,
}) => {
  const { t: partitionTrans } = useTranslation('partition');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState<{ name: string }>({
    name: '',
  });
  const checkedForm = useMemo(() => {
    const { name } = form;
    return formatForm({ name });
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const classes = useStyles();

  const handleInputChange = (value: string) => {
    setForm({ name: value });
  };

  const nameInputConfig: ITextfieldConfig = {
    label: partitionTrans('name'),
    variant: 'filled',
    key: 'name',
    fullWidth: true,
    onChange: handleInputChange,
    className: classes.input,
    validations: [
      {
        rule: 'require',
        errorText: warningTrans('required', { name: partitionTrans('name') }),
      },
      {
        rule: 'partitionName',
        errorText: partitionTrans('nameWarning'),
      },
    ],
  };

  const handleCreatePartition = () => {
    handleCreate(form.name);
  };

  return (
    <DialogTemplate
      title={partitionTrans('createTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreatePartition}
      confirmDisabled={disabled}
    >
      <CustomInput
        type="text"
        textConfig={nameInputConfig}
        checkValid={checkIsValid}
        validInfo={validation}
      />
    </DialogTemplate>
  );
};

export default CreatePartition;

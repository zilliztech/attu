import { makeStyles, Theme } from '@material-ui/core';
import { FC, useMemo, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { PartitionService } from '@/http';
import { PartitionCreateProps } from './Types';
import { PartitionManageParam } from '../databases/collections/partitions/Types';
import { ManageRequestMethods } from '../../types/Common';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(3, 0, 0.5),
  },
}));

const CreatePartition: FC<PartitionCreateProps> = ({
  onCreate,
  collectionName,
}) => {
  const classes = useStyles();

  const { handleCloseDialog } = useContext(rootContext);
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
  const handleCreatePartition = async () => {
    const param: PartitionManageParam = {
      partitionName: form.name,
      collectionName: collectionName,
      type: ManageRequestMethods.CREATE,
    };

    await PartitionService.managePartition(param);
    onCreate && onCreate(collectionName);
    handleCloseDialog();
  };

  const handleClose = () => {
    handleCloseDialog();
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

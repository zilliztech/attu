import { makeStyles, Theme } from '@material-ui/core';
import { FC, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../customDialog/DialogTemplate';
import icons from '../icons/Icons';
import { rootContext } from '../../context/Root';
import InsertImport from './Import';
import InsertPreview from './Preview';
import InsertStatus from './Status';
import {
  InsertContentProps,
  InsertStatusEnum,
  InsertStepperEnum,
} from './Types';
import { Option } from '../customSelector/Types';

const getStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '16px',
  },
}));

/**
 * this component contains processes during insert
 * all datas and methods passed in as props, no interactions with server done in it
 */

const InsertContainer: FC<InsertContentProps> = ({
  collections,
  selectedCollection,
  partitions,
  selectedPartition,
  schema,
  handleInsert,
}) => {
  const classes = getStyles();

  // props children component needed:
  const collectionOptions: Option[] = collections.map(c => ({
    label: c._name,
    value: c._name,
  }));
  const partitionOptions: Option[] = partitions.map(p => ({
    label: p._name,
    value: p._name,
  }));
  const schemaOptions: Option[] = schema.map(s => ({
    label: s._fieldName,
    value: s._fieldId,
  }));
  const isContainFieldNamesOptions: Option[] = [
    {
      label: 'Yes',
      value: 1,
    },
    { label: 'No', value: 0 },
  ];

  const { t: insertTrans } = useTranslation('insert');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog } = useContext(rootContext);
  const [activeStep, setActiveStep] = useState<InsertStepperEnum>(
    InsertStepperEnum.import
  );
  const [insertStatus, setInsertStauts] = useState<InsertStatusEnum>(
    InsertStatusEnum.init
  );
  // const [nextDisabled, setNextDisabled] = useState<boolean>(false);
  const [collectionValue, setCollectionValue] =
    useState<string>(selectedCollection);
  const [partitionValue, setPartitionValue] =
    useState<string>(selectedPartition);
  // use contain field names yes as default
  const [isContainFieldNames, setIsContainFieldNames] = useState<number>(1);

  const BackIcon = icons.back;

  const { confirm, cancel } = useMemo(() => {
    /**
     * activeStep type is InsertStepperEnum
     * so index 0 represents import,
     * index 1 represents preview,
     * index 2 represents status
     */
    const labelList = [
      {
        confirm: btnTrans('next'),
        cancel: btnTrans('cancel'),
      },
      {
        confirm: btnTrans('insert'),
        cancel: (
          <>
            <BackIcon classes={{ root: classes.icon }} />
            {btnTrans('previous')}
          </>
        ),
      },
      {
        confirm: btnTrans('done'),
        cancel: '',
      },
    ];
    return labelList[activeStep];
  }, [activeStep, btnTrans, BackIcon, classes.icon]);

  const { showActions, showCancel } = useMemo(() => {
    return {
      showActions: insertStatus !== InsertStatusEnum.loading,
      showCancel: insertStatus === InsertStatusEnum.init,
    };
  }, [insertStatus]);

  const handleUploadedData = (data: string) => {
    console.log('----- data 102', data);
  };

  const handleInsertData = () => {
    // mock status change
    setInsertStauts(InsertStatusEnum.loading);
    handleInsert();
    setTimeout(() => {
      setInsertStauts(InsertStatusEnum.success);
    }, 500);
  };

  const handleNext = () => {
    switch (activeStep) {
      case InsertStepperEnum.import:
        setActiveStep(activeStep => activeStep + 1);
        break;
      case InsertStepperEnum.preview:
        setActiveStep(activeStep => activeStep + 1);
        handleInsertData();
        break;
      // default represent InsertStepperEnum.status
      default:
        handleCloseDialog();
        break;
    }
  };

  const handleBack = () => {
    switch (activeStep) {
      case InsertStepperEnum.import:
        handleCloseDialog();
        break;
      case InsertStepperEnum.preview:
        setActiveStep(activeStep => activeStep - 1);
        break;
      // default represent InsertStepperEnum.status
      // status don't have cancel button
      default:
        break;
    }
  };

  const generateContent = (activeStep: InsertStepperEnum) => {
    switch (activeStep) {
      case InsertStepperEnum.import:
        return (
          <InsertImport
            collectionOptions={collectionOptions}
            partitionOptions={partitionOptions}
            isContainedOptions={isContainFieldNamesOptions}
            selectedCollection={collectionValue}
            selectedPartition={partitionValue}
            isContainFieldNames={isContainFieldNames}
            handleCollectionChange={setCollectionValue}
            handlePartitionChange={setPartitionValue}
            handleIsContainedChange={setIsContainFieldNames}
            handleUploadedData={handleUploadedData}
          />
        );
      case InsertStepperEnum.preview:
        return <InsertPreview schemaOptions={schemaOptions} />;
      // default represents InsertStepperEnum.status
      default:
        return <InsertStatus status={insertStatus} />;
    }
  };

  return (
    <DialogTemplate
      title={insertTrans('import')}
      handleClose={handleCloseDialog}
      confirmLabel={confirm}
      cancelLabel={cancel}
      handleCancel={handleBack}
      handleConfirm={handleNext}
      confirmDisabled={false}
      showActions={showActions}
      showCancel={showCancel}
    >
      {generateContent(activeStep)}
    </DialogTemplate>
  );
};

export default InsertContainer;

import { makeStyles, Theme } from '@material-ui/core';
import { FC, ReactElement, useContext, useMemo, useState } from 'react';
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
import { parse } from 'papaparse';

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

  const { t: insertTrans } = useTranslation('insert');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
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
  const [fileName, setFileName] = useState<string>('');
  const [csvData, setCsvData] = useState<any[]>([]);

  const BackIcon = icons.back;

  const { confirm, cancel } = useMemo(() => {
    const labelMap: {
      [key in InsertStepperEnum]: {
        confirm: string;
        cancel: string | ReactElement;
      };
    } = {
      [InsertStepperEnum.import]: {
        confirm: btnTrans('next'),
        cancel: btnTrans('cancel'),
      },
      [InsertStepperEnum.preview]: {
        confirm: btnTrans('insert'),
        cancel: (
          <>
            <BackIcon classes={{ root: classes.icon }} />
            {btnTrans('previous')}
          </>
        ),
      },
      [InsertStepperEnum.status]: {
        confirm: btnTrans('done'),
        cancel: '',
      },
    };
    return labelMap[activeStep];
  }, [activeStep, btnTrans, BackIcon, classes.icon]);

  const { showActions, showCancel } = useMemo(() => {
    return {
      showActions: insertStatus !== InsertStatusEnum.loading,
      showCancel: insertStatus === InsertStatusEnum.init,
    };
  }, [insertStatus]);

  const checkUploadFileValidation = (fieldNamesLength: number): boolean => {
    return schemaOptions.length === fieldNamesLength;
  };

  const previewData = useMemo(() => {
    const end = isContainFieldNames ? 5 : 4;
    return csvData.slice(0, end);
  }, [csvData, isContainFieldNames]);

  const handleUploadedData = (csv: string) => {
    const { data } = parse(csv);
    const uploadFieldNamesLength = (data as string[])[0].length;
    const validation = checkUploadFileValidation(uploadFieldNamesLength);
    if (!validation) {
      // open snackbar
      openSnackBar(insertTrans('uploadFieldNamesLenWarning'), 'error');
      // reset filename
      setFileName('');
      return;
    }
    setCsvData(data);
  };

  const handleInsertData = () => {
    // mock status change
    setInsertStauts(InsertStatusEnum.loading);
    handleInsert();
    setTimeout(() => {
      setInsertStauts(InsertStatusEnum.success);
    }, 1000);
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
            selectedCollection={collectionValue}
            selectedPartition={partitionValue}
            handleCollectionChange={setCollectionValue}
            handlePartitionChange={setPartitionValue}
            handleUploadedData={handleUploadedData}
            fileName={fileName}
            setFileName={setFileName}
          />
        );
      case InsertStepperEnum.preview:
        return (
          <InsertPreview
            schemaOptions={schemaOptions}
            data={previewData}
            isContainFieldNames={isContainFieldNames}
            handleIsContainedChange={setIsContainFieldNames}
          />
        );
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
      // don't show close icon when insert not finish
      showCloseIcon={insertStatus !== InsertStatusEnum.loading}
    >
      {generateContent(activeStep)}
    </DialogTemplate>
  );
};

export default InsertContainer;

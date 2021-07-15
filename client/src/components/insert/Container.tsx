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
  partitions,

  /**
   * every time selected collection change,
   * we need to call handleSelectedCollectionChange function to update partitions and schema data,
   */
  defaultSelectedCollection,
  handleSelectedCollectionChange,

  defaultSelectedPartition,

  schema,
  handleInsert,
}) => {
  const classes = getStyles();

  // props children component needed:
  const collectionOptions: Option[] = useMemo(
    () =>
      collections.map(c => ({
        label: c._name,
        value: c._name,
      })),
    [collections]
  );
  const partitionOptions: Option[] = useMemo(
    () =>
      partitions.map(p => ({
        label: p._name,
        value: p._name,
      })),
    [partitions]
  );
  const schemaOptions: Option[] = useMemo(
    () =>
      schema.map(s => ({
        label: s._fieldName,
        value: s._fieldId,
      })),
    [schema]
  );

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

  // selected collection name
  const [collectionValue, setCollectionValue] = useState<string>(
    defaultSelectedCollection
  );
  // selected partition name
  const [partitionValue, setPartitionValue] = useState<string>(
    defaultSelectedPartition
  );
  // use contain field names yes as default
  const [isContainFieldNames, setIsContainFieldNames] = useState<number>(1);
  // uploaded file name
  const [fileName, setFileName] = useState<string>('');
  // uploaded csv data (type: string)
  const [csvData, setCsvData] = useState<any[]>([]);

  const BackIcon = icons.back;

  // modal actions part, buttons label text or component
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
    // we only show top 4 results of uploaded csv data
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

  const handleInsertData = async () => {
    setInsertStauts(InsertStatusEnum.loading);
    const res = await handleInsert();
    const status = res ? InsertStatusEnum.success : InsertStatusEnum.error;
    setInsertStauts(status);
  };

  const handleCollectionChange = (name: string) => {
    setCollectionValue(name);
    handleSelectedCollectionChange && handleSelectedCollectionChange(name);
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
            handleCollectionChange={handleCollectionChange}
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

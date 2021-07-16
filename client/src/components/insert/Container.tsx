import { makeStyles, Theme } from '@material-ui/core';
import {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import { PartitionHttp } from '../../http/Partition';
import { combineHeadsAndData } from '../../utils/Insert';

const getStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '16px',
  },
}));

/**
 * this component contains processes during insert
 * including import, preview and status
 */

const InsertContainer: FC<InsertContentProps> = ({
  collections = [],
  defaultSelectedCollection,
  defaultSelectedPartition,

  partitions,
  schema,
  handleInsert,
}) => {
  const classes = getStyles();

  const { t: insertTrans } = useTranslation('insert');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const [activeStep, setActiveStep] = useState<InsertStepperEnum>(
    InsertStepperEnum.import
  );
  const [insertStatus, setInsertStauts] = useState<InsertStatusEnum>(
    InsertStatusEnum.init
  );
  const [insertFailMsg, setInsertFailMsg] = useState<string>('');

  const [nextDisabled, setNextDisabled] = useState<boolean>(false);

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

  // handle changed table heads
  const [tableHeads, setTableHeads] = useState<string[]>([]);

  const [partitionOptions, setPartitionOptions] = useState<Option[]>([]);

  const previewData = useMemo(() => {
    // we only show top 4 results of uploaded csv data
    const end = isContainFieldNames ? 5 : 4;
    return csvData.slice(0, end);
  }, [csvData, isContainFieldNames]);

  useEffect(() => {
    if (activeStep === InsertStepperEnum.import) {
      /**
       * 1. must choose collection and partition
       * 2. must upload a csv file
       */
      const selectValid = collectionValue !== '' && partitionValue !== '';
      const uploadValid = csvData.length > 0;
      const condition = selectValid && uploadValid;
      setNextDisabled(!condition);
    }
    if (activeStep === InsertStepperEnum.preview) {
      /**
       * table heads shouldn't be empty
       */
      const headsValid = tableHeads.every(h => h !== '');
      setNextDisabled(!headsValid);
    }
  }, [activeStep, collectionValue, partitionValue, csvData, tableHeads]);

  useEffect(() => {
    const heads = isContainFieldNames
      ? previewData[0]
      : new Array(previewData[0].length).fill('');

    setTableHeads(heads);
  }, [previewData, isContainFieldNames]);

  const fetchPartition = useCallback(async () => {
    if (collectionValue) {
      const partitions = await PartitionHttp.getPartitions(collectionValue);
      const partitionOptions: Option[] = partitions.map(p => ({
        label: p._formatName,
        value: p._name,
      }));
      setPartitionOptions(partitionOptions);
    }
  }, [collectionValue]);

  useEffect(() => {
    // if not on partitions page, we need to fetch partitions according to selected collection
    if (!partitions || partitions.length === 0) {
      fetchPartition();
    } else {
      const options = partitions
        .map(p => ({
          label: p._formatName,
          value: p._name,
        }))
        // when there's single selected partition
        // insert dialog partitions shouldn't selectable
        .filter(
          partition =>
            partition.label === defaultSelectedPartition ||
            defaultSelectedPartition === ''
        );
      setPartitionOptions(options);
    }
  }, [partitions, fetchPartition, defaultSelectedPartition]);

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

  // props children component needed:
  const collectionOptions: Option[] = useMemo(
    () =>
      defaultSelectedCollection === ''
        ? collections.map(c => ({
            label: c._name,
            value: c._name,
          }))
        : [
            {
              label: defaultSelectedCollection,
              value: defaultSelectedCollection,
            },
          ],
    [collections, defaultSelectedCollection]
  );

  const schemaOptions: Option[] = useMemo(() => {
    const list =
      schema && schema.length > 0
        ? schema
        : collections.find(c => c._name === collectionValue)?._fields;
    return (list || []).map(s => ({
      label: s._fieldName,
      value: s._fieldId,
    }));
  }, [schema, collectionValue, collections]);

  const checkUploadFileValidation = (fieldNamesLength: number): boolean => {
    return schemaOptions.length === fieldNamesLength;
  };

  const handleUploadedData = (csv: string, uploader: HTMLFormElement) => {
    const { data } = parse(csv);
    const uploadFieldNamesLength = (data as string[])[0].length;
    const validation = checkUploadFileValidation(uploadFieldNamesLength);
    if (!validation) {
      // open snackbar
      openSnackBar(insertTrans('uploadFieldNamesLenWarning'), 'error');
      // reset uploader value and filename
      setFileName('');
      uploader.value = null;
      return;
    }
    setCsvData(data);
  };

  const handleInsertData = async () => {
    // combine table heads and data
    const tableData = isContainFieldNames ? csvData.slice(1) : csvData;
    const data = combineHeadsAndData(tableHeads, tableData);

    setInsertStauts(InsertStatusEnum.loading);
    const { result, msg } = await handleInsert(
      collectionValue,
      partitionValue,
      data
    );

    if (!result) {
      setInsertFailMsg(msg);
    }
    const status = result ? InsertStatusEnum.success : InsertStatusEnum.error;
    setInsertStauts(status);
  };

  const handleCollectionChange = (name: string) => {
    setCollectionValue(name);
    // reset partition
    setPartitionValue('');
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
            tableHeads={tableHeads}
            setTableHeads={setTableHeads}
            isContainFieldNames={isContainFieldNames}
            handleIsContainedChange={setIsContainFieldNames}
          />
        );
      // default represents InsertStepperEnum.status
      default:
        return <InsertStatus status={insertStatus} failMsg={insertFailMsg} />;
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
      confirmDisabled={nextDisabled}
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

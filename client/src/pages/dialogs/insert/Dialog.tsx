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
import { parse } from 'papaparse';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import icons from '@/components/icons/Icons';
import { Option } from '@/components/customSelector/Types';
import { PartitionHttp } from '@/http';
import { rootContext } from '@/context';
import { combineHeadsAndData } from '@/utils';
import { FILE_MIME_TYPE } from '@/consts';
import InsertImport from './Import';
import InsertPreview from './Preview';
import InsertStatus from './Status';
import {
  InsertContentProps,
  InsertStatusEnum,
  InsertStepperEnum,
} from './Types';

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
  const [insertStatus, setInsertStatus] = useState<InsertStatusEnum>(
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
  const [file, setFile] = useState<File | null>(null);

  // uploaded csv data (type: string)
  const [csvData, setCsvData] = useState<any[]>([]);
  const [jsonData, setJsonData] = useState<
    Record<string, unknown> | undefined
  >();

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
      const uploadValid = csvData.length > 0 || typeof jsonData !== 'undefined';
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
  }, [
    activeStep,
    collectionValue,
    partitionValue,
    csvData,
    tableHeads,
    jsonData,
  ]);

  useEffect(() => {
    const heads = isContainFieldNames
      ? previewData[0]
      : new Array(previewData[0].length).fill('');

    setTableHeads(heads);
  }, [previewData, isContainFieldNames]);

  // every time selected collection value change, partition options and default value will change
  const fetchPartition = useCallback(async () => {
    if (collectionValue) {
      const partitions = await PartitionHttp.getPartitions(collectionValue);
      const partitionOptions: Option[] = partitions.map(p => ({
        label: p._formatName,
        value: p._name,
      }));
      setPartitionOptions(partitionOptions);

      if (partitionOptions.length > 0) {
        // set first partition option value as default value
        const [{ value: defaultPartitionValue }] = partitionOptions;
        setPartitionValue(defaultPartitionValue as string);
      }
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

  const {
    schemaOptions,
    autoIdFieldName,
  }: { schemaOptions: Option[]; autoIdFieldName: string } = useMemo(() => {
    /**
     * on collection page, we get schema data from collection
     * on partition page, we pass schema as props
     */
    const list =
      schema && schema.length > 0
        ? schema
        : collections.find(c => c._name === collectionValue)?._fields;

    const autoIdFieldName =
      list?.find(item => item._isPrimaryKey && item._isAutoId)?._fieldName ||
      '';
    /**
     * if below conditions all met, this schema shouldn't be selectable as head:
     * 1. this field is primary key
     * 2. this field auto id is true
     */
    const options = (list || [])
      .filter(s => !s._isAutoId || !s._isPrimaryKey)
      .map(s => ({
        label: s._fieldName,
        value: s._fieldId,
      }));
    return {
      schemaOptions: options,
      autoIdFieldName,
    };
  }, [schema, collectionValue, collections]);

  const checkUploadFileValidation = (firstRowItems: string[]): boolean => {
    const uploadFieldNamesLength = firstRowItems.length;
    return (
      checkIsAutoIdFieldValid(firstRowItems) ||
      checkColumnLength(uploadFieldNamesLength)
    );
  };

  /**
   * when primary key field auto id is true
   * no need to upload this field data
   * @param firstRowItems uploaded file first row items
   * @returns whether invalid, true means invalid
   */
  const checkIsAutoIdFieldValid = (firstRowItems: string[]): boolean => {
    const isContainAutoIdField = firstRowItems.includes(autoIdFieldName);
    isContainAutoIdField &&
      openSnackBar(
        insertTrans('uploadAutoIdFieldWarning', { fieldName: autoIdFieldName }),
        'error'
      );
    return isContainAutoIdField;
  };

  /**
   * uploaded file column length should be equal to schema length
   * @param fieldNamesLength every row items length
   * @returns whether invalid, true means invalid
   */
  const checkColumnLength = (fieldNamesLength: number): boolean => {
    const isLengthEqual = schemaOptions.length === fieldNamesLength;
    // if not equal, open warning snackbar
    !isLengthEqual &&
      openSnackBar(insertTrans('uploadFieldNamesLenWarning'), 'error');
    return !isLengthEqual;
  };

  const handleUploadedData = (
    content: string,
    uploader: HTMLFormElement,
    type: FILE_MIME_TYPE
  ) => {
    // if json, just parse json to object
    if (type === FILE_MIME_TYPE.JSON) {
      setJsonData(JSON.parse(content));
      return;
    }
    const { data } = parse(content);
    // if uploaded csv contains heads, firstRowItems is the list of all heads
    const [firstRowItems = []] = data as string[][];

    const invalid = checkUploadFileValidation(firstRowItems);
    if (invalid) {
      // reset uploader value and filename
      setFileName('');
      setFile(null);
      uploader.value = null;
      return;
    }
    setCsvData(data);
  };

  const handleInsertData = async () => {
    // start loading
    setInsertStatus(InsertStatusEnum.loading);

    // process data
    const data =
      typeof jsonData !== 'undefined'
        ? jsonData
        : combineHeadsAndData(
            tableHeads,
            isContainFieldNames ? csvData.slice(1) : csvData
          );

    const { result, msg } = await handleInsert(
      collectionValue,
      partitionValue,
      data
    );

    if (!result) {
      setInsertFailMsg(msg);
    }
    const status = result ? InsertStatusEnum.success : InsertStatusEnum.error;
    setInsertStatus(status);
  };

  const handleCollectionChange = (name: string) => {
    setCollectionValue(name);
  };

  const handleNext = () => {
    const isJSON = typeof jsonData !== 'undefined';
    switch (activeStep) {
      case InsertStepperEnum.import:
        setActiveStep(activeStep => activeStep + (isJSON ? 2 : 1));
        if (isJSON) {
          handleInsertData();
        }
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

  const handleUploadFileChange = (file: File, upload: HTMLFormElement) => {
    setFile(file);
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
            handleUploadFileChange={handleUploadFileChange}
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
            file={file}
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

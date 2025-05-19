import { Box, Typography } from '@mui/material';
import {
  FC,
  useContext,
  useMemo,
  useState,
  ChangeEvent,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { rootContext, dataContext } from '@/context';
import { useFormValidation } from '@/hooks';
import {
  formatForm,
  getAnalyzerParams,
  TypeEnum,
  parseCollectionJson,
} from '@/utils';
import {
  DataTypeEnum,
  ConsistencyLevelEnum,
  DEFAULT_ATTU_DIM,
  FunctionType,
} from '@/consts';
import CreateFields from './create/CreateFields';
import ExtraInfoSection from './create/ExtraInfoSection';
import BM25FunctionSection from './create/BM25FunctionSection';
import type {
  CollectionCreateParam,
  CollectionCreateProps,
  CreateField,
} from '../databases/collections/Types';
import { CollectionService } from '@/http';

// Add this type at the top of your file or in a relevant types file
interface BM25Function {
  name: string;
  description: string;
  type: FunctionType;
  input_field_names: string[];
  output_field_names: string[];
  params: Record<string, any>;
}

const CreateCollectionDialog: FC<CollectionCreateProps> = ({ onCreate }) => {
  const { fetchCollection } = useContext(dataContext);
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState<{
    collection_name: string;
    description: string;
    enableDynamicField: boolean;
    loadAfterCreate: boolean;
    functions: BM25Function[];
  }>({
    collection_name: '',
    description: '',
    enableDynamicField: false,
    loadAfterCreate: true,
    functions: [],
  });

  const [fieldsValidation, setFieldsValidation] = useState(true);

  // State for BM25 selection UI
  const [showBm25Selection, setShowBm25Selection] = useState<boolean>(false);
  const [selectedBm25Input, setSelectedBm25Input] = useState<string>('');
  const [selectedBm25Output, setSelectedBm25Output] = useState<string>('');

  const [consistencyLevel, setConsistencyLevel] =
    useState<ConsistencyLevelEnum>(ConsistencyLevelEnum.Bounded); // Bounded is the default value of consistency level
  const [properties, setProperties] = useState({});

  const [fields, setFields] = useState<CreateField[]>([
    {
      data_type: DataTypeEnum.Int64,
      is_primary_key: true,
      name: 'id', // we need hide helpertext at first time, so we use null to detect user enter input or not.
      description: '',
      isDefault: true,
      id: '1',
    },
    {
      data_type: DataTypeEnum.FloatVector,
      is_primary_key: false,
      name: 'vector',
      dim: DEFAULT_ATTU_DIM,
      description: '',
      isDefault: true,
      id: '2',
    },
  ]);

  const checkedForm = useMemo(() => {
    const { collection_name } = form;
    return formatForm({ collection_name });
  }, [form]);

  const { validation, checkIsValid, disabled, setDisabled } =
    useFormValidation(checkedForm);

  const updateCheckBox = (
    event: ChangeEvent<any>,
    key: string,
    value: boolean
  ) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleInputChange = (key: string, value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const generalInfoConfigs: ITextfieldConfig[] = [
    {
      label: collectionTrans('name'),
      key: 'collection_name',
      value: form.collection_name,
      onChange: (value: string) => handleInputChange('collection_name', value),
      variant: 'filled',
      validations: [
        // cannot be empty
        {
          rule: 'require',
          errorText: warningTrans('requiredOnly'),
        },
        // length <= 255
        {
          rule: 'range',
          extraParam: {
            max: 255,
            type: 'string',
          },
          errorText: collectionTrans('nameLengthWarning'),
        },
        // name can only be combined with letters, number or underscores
        {
          rule: 'collectionName',
          errorText: collectionTrans('nameContentWarning'),
        },
        // name can not start with number
        {
          rule: 'firstCharacter',
          extraParam: {
            invalidTypes: [TypeEnum.number],
          },
          errorText: collectionTrans('nameFirstLetterWarning'),
        },
      ],
      InputLabelProps: {
        shrink: true,
      },
      size: 'small',
      sx: {
        width: '100%',
      },
    },
    {
      label: collectionTrans('description'),
      key: 'description',
      value: form.description,
      onChange: (value: string) => handleInputChange('description', value),
      variant: 'filled',
      validations: [],
      size: 'small',
      InputLabelProps: {
        shrink: true,
      },
      sx: {
        width: '100%',
      },
    },
  ];

  const handleCreateCollection = async () => {
    const param: CollectionCreateParam = {
      ...form,
      fields: fields.map(v => {
        let data: CreateField = {
          ...v,
          name: v.name,
          description: v.description,
          is_primary_key: !!v.is_primary_key,
          is_partition_key: !!v.is_partition_key,
          data_type: v.data_type,
        };

        // remove unused id
        delete data.id;

        // if we need
        if (typeof v.dim !== undefined && !isNaN(Number(v.dim))) {
          data.dim = Number(v.dim);
        }

        if (typeof v.max_length === 'number') {
          data.max_length = Number(v.max_length);
        }
        if (typeof v.element_type !== 'undefined') {
          data.element_type = Number(v.element_type);
        }
        if (typeof v.max_capacity !== 'undefined') {
          data.max_capacity = Number(v.max_capacity);
        }

        if (data.analyzer_params) {
          // if analyzer_params is string, we need to use default value
          data.analyzer_params = getAnalyzerParams(data.analyzer_params);
        }

        // delete sparse vector dime
        if (data.data_type === DataTypeEnum.SparseFloatVector) {
          delete data.dim;
        }

        // delete analyzer if not varchar
        if (
          data.data_type !== DataTypeEnum.VarChar &&
          data.data_type === DataTypeEnum.Array &&
          data.element_type !== DataTypeEnum.VarChar
        ) {
          delete data.enable_analyzer;
          delete data.analyzer_params;
          delete data.max_length;
        }

        return data;
      }),
      functions: form.functions || [],
      consistency_level: consistencyLevel,
      properties: {
        ...properties,
      },
    };

    // create collection
    await CollectionService.createCollection({
      ...param,
    });

    // refresh collection
    await fetchCollection(param.collection_name);

    // show success message
    openSnackBar(
      successTrans('create', {
        name: collectionTrans('collection'),
      })
    );

    onCreate && onCreate(param.collection_name);
    handleCloseDialog();
  };

  // Filter available fields for BM25 selectors
  const varcharFields = useMemo(
    () => fields.filter(f => f.data_type === DataTypeEnum.VarChar && f.name),
    [fields]
  );
  const sparseFields = useMemo(
    () =>
      fields.filter(
        f => f.data_type === DataTypeEnum.SparseFloatVector && f.name
      ),
    [fields]
  );

  const handleAddBm25Click = () => {
    setShowBm25Selection(true);
  };

  const handleConfirmAddBm25 = () => {
    if (!selectedBm25Input || !selectedBm25Output) {
      openSnackBar(collectionTrans('bm25SelectFieldsWarning'), 'warning');
      return;
    }

    const inputField = fields.find(f => f.name === selectedBm25Input);
    const outputField = fields.find(f => f.name === selectedBm25Output);

    if (!inputField || !outputField) {
      // Should not happen if state is managed correctly, but good to check
      console.error('Selected BM25 fields not found');
      return;
    }

    // Generate a unique name for the function
    const functionName = `BM25_${inputField.name}_${
      outputField.name
    }_${Math.floor(Math.random() * 1000)}`;

    // Create a new function with the selected fields
    const newFunction: BM25Function = {
      name: functionName,
      description: `BM25 function: ${inputField.name} → ${outputField.name}`,
      type: FunctionType.BM25,
      input_field_names: [inputField.name],
      output_field_names: [outputField.name],
      params: {}, // Add default params if needed, e.g., { k1: 1.2, b: 0.75 }
    };

    // Update form with the new function
    setForm(prev => ({
      ...prev,
      functions: [...(prev.functions || []), newFunction],
    }));

    // Hide selection UI
    setShowBm25Selection(false);

    // need to update field.is_function_output to true
    const updatedFields = fields.map(field => {
      if (field.name === outputField.name) {
        return {
          ...field,
          is_function_output: true,
        };
      }
      return field;
    });
    setFields(updatedFields);
  };

  const handleCancelAddBm25 = () => {
    setShowBm25Selection(false);
  };

  // Effect to reset selection when fields change or selection UI is hidden
  useEffect(() => {
    if (!showBm25Selection) {
      setSelectedBm25Input('');
      setSelectedBm25Output('');
    } else {
      // Pre-select first available fields when opening selection
      setSelectedBm25Input(varcharFields[0]?.name || '');
      setSelectedBm25Output(sparseFields[0]?.name || '');
    }
  }, [showBm25Selection, varcharFields, sparseFields]);

  // Effect to filter out functions with invalid field names
  useEffect(() => {
    setForm(prevForm => {
      const fieldNames = fields.map(f => f.name);
      const filteredFunctions = (prevForm.functions || []).filter(
        fn =>
          fn.input_field_names.every(name => fieldNames.includes(name)) &&
          fn.output_field_names.every(name => fieldNames.includes(name))
      );
      if (filteredFunctions.length !== (prevForm.functions || []).length) {
        return { ...prevForm, functions: filteredFunctions };
      }
      return prevForm;
    });
  }, [fields]);

  // Import from json
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);

        if (
          !json.collection_name ||
          !Array.isArray(json.schema?.fields) ||
          json.schema.fields.length === 0
        ) {
          openSnackBar('Invalid JSON file', 'error');
          return;
        }

        const {
          form: importedForm,
          fields: importedFields,
          consistencyLevel: importedConsistencyLevel,
          properties: importedProperties,
        } = parseCollectionJson(json);

        setFields(importedFields);
        setConsistencyLevel(importedConsistencyLevel);
        setForm(importedForm);
        setProperties(importedProperties);

        // enable submit
        setDisabled(false);

        openSnackBar('Import successful', 'success');
      } catch (err) {
        openSnackBar('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <DialogTemplate
      dialogClass="create-collection-dialog"
      title={collectionTrans('createTitle', { name: form.collection_name })}
      handleClose={() => {
        handleCloseDialog();
      }}
      leftActions={
        <>
          <button
            type="button"
            onClick={handleImportClick}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: '#1976d2',
            }}
          >
            {btnTrans('importFromJSON')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </>
      }
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateCollection}
      confirmDisabled={disabled || !fieldsValidation}
      sx={{ width: 900 }}
    >
      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          {generalInfoConfigs.map(config => (
            <CustomInput
              key={config.key}
              type="text"
              textConfig={{ ...config }}
              checkValid={checkIsValid}
              validInfo={validation}
            />
          ))}
        </Box>

        <Box
          sx={{
            background: theme => theme.palette.background.lightGrey,
            padding: '16px',
            borderRadius: 0.5,
          }}
        >
          <CreateFields
            fields={fields}
            setFields={setFields}
            onValidationChange={setFieldsValidation}
          />
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h4" sx={{ fontSize: 16 }}>
            {collectionTrans('functions')}
          </Typography>
          <BM25FunctionSection
            showBm25Selection={showBm25Selection}
            varcharFields={varcharFields}
            sparseFields={sparseFields}
            selectedBm25Input={selectedBm25Input}
            selectedBm25Output={selectedBm25Output}
            setSelectedBm25Input={setSelectedBm25Input}
            setSelectedBm25Output={setSelectedBm25Output}
            handleAddBm25Click={handleAddBm25Click}
            handleConfirmAddBm25={handleConfirmAddBm25}
            handleCancelAddBm25={handleCancelAddBm25}
            formFunctions={form.functions}
            setForm={setForm}
            collectionTrans={collectionTrans}
            btnTrans={btnTrans}
          />
        </Box>

        <ExtraInfoSection
          consistencyLevel={consistencyLevel}
          setConsistencyLevel={setConsistencyLevel}
          form={form}
          updateCheckBox={updateCheckBox}
          collectionTrans={collectionTrans}
        />
      </Box>
    </DialogTemplate>
  );
};

export default CreateCollectionDialog;

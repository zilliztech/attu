import { Theme, Checkbox } from '@mui/material';
import { FC, useContext, useMemo, useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ITextfieldConfig } from '@/components/customInput/Types';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { rootContext, dataContext } from '@/context';
import { useFormValidation } from '@/hooks';
import { formatForm, getAnalyzerParams, TypeEnum } from '@/utils';
import {
  DataTypeEnum,
  ConsistencyLevelEnum,
  DEFAULT_ATTU_DIM,
  FunctionType,
} from '@/consts';
import CreateFields from './create/CreateFields';
import { CONSISTENCY_LEVEL_OPTIONS } from './create/Constants';
import { makeStyles } from '@mui/styles';
import type {
  CollectionCreateParam,
  CollectionCreateProps,
  CreateField,
} from '../databases/collections/Types';

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    minWidth: 800,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',

    '& section': {
      display: 'flex',
      '& fieldset': {},
    },
  },
  generalInfo: {
    '& fieldset': {
      gap: 16,
      display: 'flex',
      width: '100%',
    },
  },
  schemaInfo: {
    background: theme.palette.background.grey,
    padding: '16px',
    borderRadius: 8,
  },
  extraInfo: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: 8,

    '& input': {
      marginLeft: 0,
    },
  },
  input: {
    width: '100%',
  },
  chexBoxArea: {
    paddingTop: 8,
    fontSize: 14,
    marginLeft: -8,
    '& label': {
      display: 'inline-block',
    },
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  consistencySelect: {
    width: '50%',
    marginBottom: 16,
  },
}));

const CreateCollectionDialog: FC<CollectionCreateProps> = ({ onCreate }) => {
  const { createCollection } = useContext(dataContext);
  const classes = useStyles();
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState({
    collection_name: '',
    description: '',
    autoID: true,
    enableDynamicField: false,
    loadAfterCreate: true,
  });

  const [consistencyLevel, setConsistencyLevel] =
    useState<ConsistencyLevelEnum>(ConsistencyLevelEnum.Bounded); // Bounded is the default value of consistency level

  const [fields, setFields] = useState<CreateField[]>([
    {
      data_type: DataTypeEnum.Int64,
      is_primary_key: true,
      name: '', // we need hide helpertext at first time, so we use null to detect user enter input or not.
      description: '',
      isDefault: true,
      id: '1',
    },
    {
      data_type: DataTypeEnum.FloatVector,
      is_primary_key: false,
      name: '',
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

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const changeIsAutoID = (value: boolean) => {
    setForm({
      ...form,
      autoID: value,
    });
  };

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
      className: classes.input,
    },
    {
      label: collectionTrans('description'),
      key: 'description',
      value: form.description,
      onChange: (value: string) => handleInputChange('description', value),
      variant: 'filled',
      validations: [],
      size: 'small',
      className: classes.input,
      InputLabelProps: {
        shrink: true,
      },
    },
  ];

  const handleCreateCollection = async () => {
    // function output fields
    const fnOutputFields: CreateField[] = [];
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

        // handle BM25 row
        if (data.data_type === DataTypeEnum.VarCharBM25) {
          data.data_type = DataTypeEnum.VarChar;
          data.enable_analyzer = true;
          data.analyzer_params = data.analyzer_params || 'standard';
          // create sparse field
          const sparseField = {
            name: `${data.name}_embeddings`,
            is_primary_key: false,
            data_type: DataTypeEnum.SparseFloatVector,
            description: `fn BM25(${data.name}) -> embeddings`,
            is_function_output: true,
          };
          // push sparse field to fields
          fnOutputFields.push(sparseField);
        }

        if (data.analyzer_params) {
          // if analyzer_params is string, we need to use default value
          data.analyzer_params = getAnalyzerParams(data.analyzer_params);
        }

        data.is_primary_key && (data.autoID = form.autoID);

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
      functions: [],
      consistency_level: consistencyLevel,
    };

    // push sparse fields to param.fields
    param.fields.push(...fnOutputFields);

    // build functions
    fnOutputFields.forEach((field, index) => {
      const [input] = (field.name as string).split('_');
      const functionParam = {
        name: `BM25_${index}`,
        description: `${input} BM25 function`,
        type: FunctionType.BM25,
        input_field_names: [input],
        output_field_names: [field.name as string],
        params: {},
      };
      param.functions.push(functionParam);
    });

    // create collection
    await createCollection({
      ...param,
    });

    // show success message
    openSnackBar(
      successTrans('create', {
        name: collectionTrans('collection'),
      })
    );

    onCreate && onCreate();
    handleCloseDialog();
  };

  return (
    <DialogTemplate
      title={collectionTrans('createTitle', { name: form.collection_name })}
      handleClose={() => {
        handleCloseDialog();
      }}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateCollection}
      confirmDisabled={disabled}
      dialogClass={classes.dialog}
    >
      <div className={classes.container}>
        <section className={classes.generalInfo}>
          <fieldset>
            {generalInfoConfigs.map(config => (
              <CustomInput
                key={config.key}
                type="text"
                textConfig={config}
                checkValid={checkIsValid}
                validInfo={validation}
              />
            ))}
          </fieldset>
        </section>

        <section className={classes.schemaInfo}>
          <fieldset>
            {/* <legend>{collectionTrans('schema')}</legend> */}
            <CreateFields
              fields={fields}
              setFields={setFields}
              autoID={form.autoID}
              setAutoID={changeIsAutoID}
            />
          </fieldset>
        </section>

        <section className={classes.extraInfo}>
          <fieldset>
            <CustomSelector
              wrapperClass={classes.consistencySelect}
              size="small"
              options={CONSISTENCY_LEVEL_OPTIONS}
              onChange={e => {
                setConsistencyLevel(e.target.value as ConsistencyLevelEnum);
              }}
              label={collectionTrans('consistency')}
              value={consistencyLevel}
              variant="filled"
            />
          </fieldset>
          <fieldset className={classes.chexBoxArea}>
            <div>
              <CustomToolTip title={collectionTrans('partitionKeyTooltip')}>
                <label htmlFor="enableDynamicField">
                  <Checkbox
                    id="enableDynamicField"
                    checked={!!form.enableDynamicField}
                    size="small"
                    onChange={event => {
                      updateCheckBox(
                        event,
                        'enableDynamicField',
                        !form.enableDynamicField
                      );
                    }}
                  />
                  {collectionTrans('enableDynamicSchema')}
                </label>
              </CustomToolTip>
            </div>

            <div>
              <CustomToolTip
                title={collectionTrans('loadCollectionAfterCreateTip')}
              >
                <label htmlFor="loadAfterCreate">
                  <Checkbox
                    id="loadAfterCreate"
                    checked={!!form.loadAfterCreate}
                    size="small"
                    onChange={event => {
                      updateCheckBox(
                        event,
                        'loadAfterCreate',
                        !form.loadAfterCreate
                      );
                    }}
                  />
                  {collectionTrans('loadCollectionAfterCreate')}
                </label>
              </CustomToolTip>
            </div>
          </fieldset>
        </section>
      </div>
    </DialogTemplate>
  );
};

export default CreateCollectionDialog;

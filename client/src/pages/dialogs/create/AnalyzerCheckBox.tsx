import React from 'react';
import { Checkbox, SelectChangeEvent } from '@mui/material';
import CustomSelector from '@/components/customSelector/CustomSelector';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import EditJSONDialog from '@/pages/dialogs/EditJSONDialog';
import { DataTypeEnum } from '@/consts';
import type { FieldType } from '../../databases/collections/Types';
import icons from '@/components/icons/Icons';
import { useStyles } from './styles';
import { getAnalyzerParams } from '@/utils/Format';

const ANALYZER_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'english', label: 'English' },
  { value: 'custom', label: 'Custom' },
];

interface AnalyzerCheckBoxProps {
  field: FieldType;
  onChange: (id: string, update: Partial<FieldType>) => void;
  collectionTrans: (key: string) => string;
  dialogTrans: (key: string) => string;
  localFieldAnalyzers: React.MutableRefObject<Map<string, any>>;
  setDialog: (config: {
    open: boolean;
    type: 'custom' | 'notice';
    params: { component: React.ReactNode };
  }) => void;
  getAnalyzerParams: typeof getAnalyzerParams;
}

const AnalyzerCheckBox: React.FC<AnalyzerCheckBoxProps> = ({
  field,
  onChange,
  collectionTrans,
  dialogTrans,
  localFieldAnalyzers,
  setDialog,
  getAnalyzerParams,
}) => {
  const classes = useStyles();

  const determineAnalyzer = () => {
    if (typeof field.analyzer_params === 'string') {
      return field.analyzer_params;
    } else if (!field.analyzer_params) {
      return 'standard';
    }
    return 'custom';
  };

  const analyzer = determineAnalyzer();
  const localAnalyzer = localFieldAnalyzers.current.get(field.id!) || {
    tokenizer: 'standard',
    filter: ['lowercase'],
  };

  const handleCheckboxChange = () => {
    onChange(field.id!, {
      enable_analyzer: !field.enable_analyzer,
    });
  };

  const handleAnalyzerChange = (e: SelectChangeEvent<unknown>) => {
    const selectedAnalyzer = e.target.value as string;
    if (selectedAnalyzer === 'custom') {
      onChange(field.id!, {
        analyzer_params: localAnalyzer,
      });
    } else {
      onChange(field.id!, {
        analyzer_params: selectedAnalyzer,
      });
    }
  };

  const handleEditClick = () => {
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <EditJSONDialog
            data={getAnalyzerParams(field.analyzer_params || 'standard')}
            dialogTitle={dialogTrans('editAnalyzerTitle')}
            dialogTip={dialogTrans('editAnalyzerInfo')}
            handleConfirm={data => {
              localFieldAnalyzers.current.set(field.id!, data);
              onChange(field.id!, { analyzer_params: data });
            }}
            handleCloseDialog={() =>
              setDialog({
                open: false,
                type: 'custom',
                params: { component: null },
              })
            }
          />
        ),
      },
    });
  };

  return (
    <div className={classes.analyzerInput}>
      <Checkbox
        checked={
          !!field.enable_analyzer ||
          field.data_type === DataTypeEnum.VarCharBM25
        }
        size="small"
        onChange={handleCheckboxChange}
        disabled={field.data_type === DataTypeEnum.VarCharBM25}
      />

      <CustomSelector
        wrapperClass="select"
        options={ANALYZER_OPTIONS}
        size="small"
        onChange={handleAnalyzerChange}
        disabled={
          !field.enable_analyzer && field.data_type !== DataTypeEnum.VarCharBM25
        }
        value={analyzer}
        variant="filled"
        label={collectionTrans('analyzer')}
      />

      <CustomIconButton
        disabled={
          !field.enable_analyzer && field.data_type !== DataTypeEnum.VarCharBM25
        }
        onClick={handleEditClick}
      >
        <icons.settings className={classes.icon} />
      </CustomIconButton>
    </div>
  );
};

export default AnalyzerCheckBox;

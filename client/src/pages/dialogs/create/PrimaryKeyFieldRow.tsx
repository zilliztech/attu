import { FC } from 'react';
import { FormControlLabel, Switch, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../databases/collections/Types';
import NameField from './NameField';
import DescriptionField from './DescriptionField';
import MaxLengthField from './MaxLengthField';
import PrimaryKeyTypeSelector from './PrimaryKeyTypeSelector';

interface PrimaryKeyFieldRowProps {
  field: FieldType;
  autoID: boolean;
  onFieldChange: (id: string, changes: Partial<FieldType>) => void;
  setAutoID: (value: boolean) => void;
  className?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  rowWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    marginBottom: 4,
    '& .MuiFormLabel-root': {
      fontSize: 14,
    },
    '& .MuiInputBase-root': {
      fontSize: 14,
    },
    '& .MuiSelect-filled': {
      fontSize: 14,
    },
    '& .MuiCheckbox-root': {
      padding: 4,
    },
    '& .MuiFormControlLabel-label': {
      fontSize: 14,
    },
  },
  select: {
    width: '150px',
    marginTop: '-20px',
  },
  maxLength: {
    maxWidth: '80px',
  },
  descInput: {
    width: '64px',
  },
  toggle: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}));

const PrimaryKeyFieldRow: FC<PrimaryKeyFieldRowProps> = ({
  field,
  autoID,
  onFieldChange,
  setAutoID,
  className,
}) => {
  const classes = useStyles();
  const { t: collectionTrans } = useTranslation('collection');

  const isVarChar = field.data_type === DataTypeEnum.VarChar;

  return (
    <div className={`${classes.rowWrapper} ${className || ''}`}>
      <NameField
        field={field}
        onChange={(id, name) => onFieldChange(field.id!, { name: name })}
        label={collectionTrans('idFieldName')}
      />
      <PrimaryKeyTypeSelector
        value={field.data_type}
        onChange={(value: DataTypeEnum) => {
          onFieldChange(field.id!, { data_type: value });
          if (value === DataTypeEnum.VarChar) {
            setAutoID(false);
          }
        }}
        className={classes.select}
      />
      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description })}
        className={classes.descInput}
      />

      {isVarChar && (
        <MaxLengthField
          field={field}
          onChange={onFieldChange}
          inputClassName={classes.maxLength}
        />
      )}

      <FormControlLabel
        control={
          <Switch
            checked={autoID}
            disabled={isVarChar}
            size="small"
            onChange={() => {
              onFieldChange(field.id!, { autoID: !autoID });
              setAutoID(!autoID);
            }}
          />
        }
        label={
          <CustomToolTip
            title={collectionTrans('autoIdToggleTip')}
            placement="top"
          >
            <>{collectionTrans('autoId')}</>
          </CustomToolTip>
        }
        className={classes.toggle}
      />
    </div>
  );
};

export default PrimaryKeyFieldRow;

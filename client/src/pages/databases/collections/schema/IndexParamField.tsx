import {
  TextField,
  Switch,
  FormControlLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { IndexParamConfig } from './indexParamsConfig';

interface IndexParamFieldProps {
  config: IndexParamConfig;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
  error?: string;
}

const IndexParamField = ({
  config,
  value,
  onChange,
  error,
}: IndexParamFieldProps) => {
  const { t: indexTrans } = useTranslation('index');

  const renderField = () => {
    switch (config.type) {
      case 'bool':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={typeof value === 'boolean' ? value : value === 'true'}
                onChange={e => onChange(config.key, e.target.checked)}
                color="primary"
              />
            }
            label={config.label}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            variant="filled"
            label={config.label}
            type="number"
            value={typeof value === 'number' ? value : value || ''}
            onChange={e => {
              const val = e.target.value;
              if (val === '') {
                onChange(config.key, '');
              } else {
                const num = Number(val);
                if (!isNaN(num)) {
                  onChange(config.key, num);
                }
              }
            }}
            error={!!error}
            helperText={error}
            inputProps={{
              min: config.min,
              max: config.max,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            required={config.required}
          />
        );
      default:
        return (
          <TextField
            fullWidth
            variant="filled"
            label={config.label}
            value={value || ''}
            onChange={e => onChange(config.key, e.target.value)}
            error={!!error}
            helperText={error}
            InputLabelProps={{
              shrink: true,
            }}
            required={config.required}
          />
        );
    }
  };

  return (
    <Box sx={{ mb: 0 }}>
      {renderField()}
      {(config.helperText || error) && (
        <FormHelperText
          error={!!error}
          sx={{
            mt: 0.5,
            mb: 0,
            fontSize: '0.75rem',
            lineHeight: 1.2,
          }}
        >
          {config.description && indexTrans(config.description)}
          {error || (config.helperText ? indexTrans(config.helperText) : '')}
        </FormHelperText>
      )}
    </Box>
  );
};

export default IndexParamField;

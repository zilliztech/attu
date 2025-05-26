import {
  TextField,
  Switch,
  FormControlLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material';
import type { IndexParamConfig } from './indexParamsConfig';

interface IndexParamFieldProps {
  config: IndexParamConfig;
  value: string | number | boolean;
  onChange: (key: string, value: string) => void;
  error?: string;
}

const IndexParamField = ({
  config,
  value,
  onChange,
  error,
}: IndexParamFieldProps) => {
  const theme = useTheme();

  const renderField = () => {
    switch (config.type) {
      case 'bool':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value === 'true'}
                onChange={e =>
                  onChange(config.key, e.target.checked.toString())
                }
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
            value={value}
            onChange={e => onChange(config.key, e.target.value)}
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
            value={value}
            onChange={e => onChange(config.key, e.target.value)}
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
    }
  };

  return (
    <Box sx={{ mb: 0 }}>
      {renderField()}
      {(config.helperText || error) && (
        <FormHelperText error={!!error}>
          {config.description}, {error || config.helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default IndexParamField;

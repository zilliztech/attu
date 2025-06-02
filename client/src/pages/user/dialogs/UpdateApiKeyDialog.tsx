import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Box } from '@mui/material';
import DialogTemplate from '@/components/customDialog/DialogTemplate';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const UpdateApiKeyDialog: FC<Props> = ({ onClose, onSave }) => {
  const { t } = useTranslation('user');
  const [apiKey, setApiKey] = useState(localStorage.getItem('attu.ui.openai_api_key') || '');

  const handleSave = async () => {
    localStorage.setItem('attu.ui.openai_api_key', apiKey);
    onSave(apiKey);
  };

  return (
    <DialogTemplate
      title={t('setApiKey')}
      handleClose={onClose}
      handleConfirm={handleSave}
    >
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label={t('apiKey')}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type="password"
          helperText={t('apiKeyHelper')}
        />
      </Box>
    </DialogTemplate>
  );
};

export default UpdateApiKeyDialog; 
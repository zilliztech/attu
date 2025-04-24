import { FC, useContext, useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
} from '@mui/material';
import CustomButton from '@/components/customButton/CustomButton';
import CustomDialogTitle from '@/components/customDialog/CustomDialogTitle';
import { rootContext } from '@/context';
import type { DeleteDialogContentType } from '@/components/customDialog/Types';

const DeleteTemplate: FC<DeleteDialogContentType> = ({
  title,
  text,
  label,
  compare,
  handleDelete,
  handleCancel,
  forceDelLabel,
}) => {
  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');

  const [value, setValue] = useState('');
  const [force, setForce] = useState(false);
  const deleteReady = value.toLowerCase() === (compare || label).toLowerCase();

  const handleCancelClick = () => {
    handleCloseDialog();
    handleCancel?.();
  };

  return (
    <Box
      sx={{
        maxWidth: 540,
        backgroundColor: theme => theme.palette.background.paper,
      }}
    >
      <form
        onSubmit={e => {
          e.preventDefault();
          handleDelete(force);
        }}
      >
        <CustomDialogTitle onClose={handleCancelClick} sx={{ mb: 2.5 }}>
          {title}
        </CustomDialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="body1"
              sx={{ mb: 0.5, color: theme => theme.palette.text.secondary }}
              dangerouslySetInnerHTML={{ __html: text }}
            />
            <Typography variant="body1">
              {dialogTrans('deleteTipAction')}
              <Box
                component="strong"
                sx={{ fontWeight: 'bold', display: 'inline' }}
              >
                {` ${(compare || label).toLowerCase()} `}
              </Box>
              {dialogTrans('deleteTipPurpose')}
            </Typography>
          </Box>

          <TextField
            fullWidth
            variant="filled"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value)
            }
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px 12px',
              },
              '& .MuiInputLabel-root': {
                display: 'none',
              },
            }}
          />

          {forceDelLabel && (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(e, checked) => setForce(checked)}
                  checked={force}
                />
              }
              label={forceDelLabel}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ display: 'flex' }}>
          <CustomButton
            onClick={handleCancelClick}
            sx={{ color: theme => theme.palette.text.secondary }}
          >
            {btnTrans('cancel')}
          </CustomButton>
          <CustomButton
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!deleteReady}
          >
            {label}
          </CustomButton>
        </DialogActions>
      </form>
    </Box>
  );
};

export default DeleteTemplate;

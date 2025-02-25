import { FC, useContext, useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import {
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CustomButton from '@/components/customButton/CustomButton';
import CustomDialogTitle from '@/components/customDialog/CustomDialogTitle';
import { rootContext } from '@/context';
import type { DeleteDialogContentType } from '@/components/customDialog/Types';

const Root = styled('div')(({ theme }) => ({
  maxWidth: 540,
  backgroundColor: theme.palette.background.paper,
}));

const DialogSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
}));

const StyledDialogTitle = styled(CustomDialogTitle)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.secondary,
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    padding: '10px 12px',
  },
  '& .MuiInputLabel-root': {
    display: 'none',
  },
});

const ActionButtons = styled(DialogActions)({
  display: 'flex',
});

const CancelButton = styled(CustomButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const BoldText = styled('strong')({
  fontWeight: 'bold',
});

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
    <Root>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleDelete(force);
        }}
      >
        <StyledDialogTitle onClose={handleCancelClick}>
          {title}
        </StyledDialogTitle>

        <DialogContent>
          <DialogSection>
            <StyledTypography
              variant="body1"
              dangerouslySetInnerHTML={{ __html: text }}
            />
            <Typography variant="body1">
              {dialogTrans('deleteTipAction')}
              <BoldText>{` ${(compare || label).toLowerCase()} `}</BoldText>
              {dialogTrans('deleteTipPurpose')}
            </Typography>
          </DialogSection>

          <StyledTextField
            fullWidth
            variant="filled"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value)
            }
          />

          {forceDelLabel && (
            <FormControlLabel
              control={
                <Checkbox onChange={(e, checked) => setForce(checked)} />
              }
              label={forceDelLabel}
              checked={force}
            />
          )}
        </DialogContent>

        <ActionButtons>
          <CancelButton onClick={handleCancelClick}>
            {btnTrans('cancel')}
          </CancelButton>
          <CustomButton
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!deleteReady}
          >
            {label}
          </CustomButton>
        </ActionButtons>
      </form>
    </Root>
  );
};

export default DeleteTemplate;

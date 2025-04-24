import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
} from '@mui/material';
import CustomDialogTitle from './CustomDialogTitle';
import CustomButton from '../customButton/CustomButton';
import CodeView from '../code/CodeView';
import type { DialogContainerProps } from './Types';

const DialogTemplate: FC<DialogContainerProps> = ({
  title,
  cancelLabel,
  handleClose,
  handleCancel,
  confirmLabel,
  confirmDisabledTooltip,
  handleConfirm,
  confirmDisabled,
  children,
  showActions = true,
  showCancel = true,
  showCloseIcon = true,
  leftActions,
  showCode = false,
  codeBlocksData = [],
  dialogClass = '',
}) => {
  const [confirming, setConfirming] = useState(false);
  const { t } = useTranslation('btn');
  const cancel = cancelLabel || t('cancel');
  const confirm = confirmLabel || t('confirm');
  const onCancel = handleCancel || handleClose;

  const dialogRef = useRef(null);

  const _handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    setConfirming(true);
    event.preventDefault();
    try {
      await handleConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        '& form': { display: 'flex' },
        '& .MuiDialogContent-root': { maxHeight: '60vh' },
      }}
    >
      <form onSubmit={_handleConfirm}>
        <Box
          ref={dialogRef}
          className={dialogClass}
          sx={{
            color: theme => theme.palette.text.primary,
            backgroundColor: theme => theme.palette.background.paper,
            minWidth: 540,
            transition: 'width 0.2s',
            width: showCode ? 540 : 'auto',
          }}
        >
          <CustomDialogTitle
            onClose={handleClose}
            showCloseIcon={showCloseIcon}
          >
            {title}
          </CustomDialogTitle>
          <DialogContent>{children}</DialogContent>
          {showActions && (
            <DialogActions
              sx={{
                pt: 1,
                pb: 2,
                justifyContent: 'space-between',
                '& .btn': { m: 0.5 },
              }}
            >
              <Box>{leftActions}</Box>
              <Box>
                {showCancel && (
                  <CustomButton
                    onClick={onCancel}
                    name="cancel"
                    className="btn"
                    disabled={confirming}
                  >
                    {cancel}
                  </CustomButton>
                )}
                <CustomButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={confirming || confirmDisabled}
                  name="confirm"
                  className="btn"
                  tooltip={confirmDisabled ? confirmDisabledTooltip : ''}
                >
                  {confirming ? <CircularProgress size={16} /> : confirm}
                </CustomButton>
              </Box>
            </DialogActions>
          )}
        </Box>

        <Box
          sx={{
            color: theme => theme.palette.text.primary,
            backgroundColor: theme => theme.palette.background.paper,
            width: showCode ? 540 : 0,
            transition: 'width 0.2s',
          }}
        >
          {showCode && (
            <Box
              sx={{
                height: '100%',
                p: showCode ? 4 : 0,
              }}
            >
              <CodeView data={codeBlocksData} />
            </Box>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default DialogTemplate;

import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { DialogContent, DialogActions, CircularProgress } from '@mui/material';
import CustomDialogTitle from './CustomDialogTitle';
import CustomButton from '../customButton/CustomButton';
import CodeView from '../code/CodeView';
import type { DialogContainerProps } from './Types';

const Wrapper = styled('section')({
  display: 'flex',
  '& form': {
    display: 'flex',
  },
  '& .MuiDialogContent-root': {
    maxHeight: '60vh',
  },
});

const DialogBlock = styled('div')<{ showCode: boolean }>(
  ({ theme, showCode }) => ({
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    minWidth: 540,
    transition: 'width 0.2s',
    width: showCode ? 540 : 'auto',
  })
);

const CodeWrapper = styled('div')<{ showCode: boolean }>(
  ({ theme, showCode }) => ({
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    width: showCode ? 540 : 0,
    transition: 'width 0.2s',
  })
);

const CodeContainer = styled('div')<{ showCode: boolean }>(
  ({ theme, showCode }) => ({
    height: '100%',
    padding: showCode ? theme.spacing(4) : 0,
  })
);

const Actions = styled(DialogActions)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(2),
  justifyContent: 'space-between',
  '& .btn': {
    margin: theme.spacing(0.5),
  },
}));

const DialogTemplate: FC<DialogContainerProps> = ({
  title,
  cancelLabel,
  handleClose,
  handleCancel,
  confirmLabel,
  confirmDisaledTooltip,
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
    <Wrapper>
      <form onSubmit={_handleConfirm}>
        <DialogBlock
          showCode={showCode}
          ref={dialogRef}
          className={dialogClass}
        >
          <CustomDialogTitle
            onClose={handleClose}
            showCloseIcon={showCloseIcon}
          >
            {title}
          </CustomDialogTitle>
          <DialogContent>{children}</DialogContent>
          {showActions && (
            <Actions>
              <div>{leftActions}</div>
              <div>
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
                  tooltip={confirmDisabled ? confirmDisaledTooltip : ''}
                >
                  {confirming ? <CircularProgress size={16} /> : confirm}
                </CustomButton>
              </div>
            </Actions>
          )}
        </DialogBlock>

        <CodeWrapper showCode={showCode}>
          {showCode && (
            <CodeContainer showCode={showCode}>
              <CodeView data={codeBlocksData} />
            </CodeContainer>
          )}
        </CodeWrapper>
      </form>
    </Wrapper>
  );
};

export default DialogTemplate;

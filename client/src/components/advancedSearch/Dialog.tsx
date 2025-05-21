import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import CustomButton from '../customButton/CustomButton';
import ConditionGroup from './ConditionGroup';
import icons from '../icons/Icons';
import CopyBtn from './CopyButton';
import type { Theme } from '@mui/material/styles';
import type { DialogProps } from './Types';

const AdvancedDialog = (props: DialogProps) => {
  // i18n
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');

  const {
    open = false,
    onClose,
    onSubmit,
    onReset,
    onCancel,
    handleConditions = {},
    conditions: flatConditions = [],
    isLegal = false,
    expression: filterExpression = '',
    title = searchTrans('advancedFilter'),
    fields = [],
    ...others
  } = props;
  const { addCondition } = handleConditions;
  const ResetIcon = icons.refresh;
  const CloseIcon = icons.clear;

  useEffect(() => {
    flatConditions.length === 0 && addCondition();
    // Only need add one condition after dialog's first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldSowPlaceholder: boolean = !isLegal || !filterExpression;

  return (
    <>
      <Dialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="xl"
        sx={{
          '& .disable-exp': {
            userSelect: 'none',
            color: (theme: Theme) => theme.palette.text.disabled, // Changed for better theme coordination
          },
        }}
        {...others}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h5" component="div">
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            sx={{ color: (theme: Theme) => theme.palette.action.active }} // Changed for better theme coordination
            onClick={onCancel}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              ...(shouldSowPlaceholder && {
                userSelect: 'none',
                color: (theme: Theme) => theme.palette.text.secondary, // Changed for placeholder
              }),
              backgroundColor: (theme: Theme) => theme.palette.action.hover, // Changed for subtle background
              minHeight: '32px',
              fontSize: '13px',
              fontFamily: 'monospace',
              padding: (theme: Theme) => theme.spacing(1, 2),
            }}
          >
            {`${shouldSowPlaceholder ? 'Filter Expression' : filterExpression}`}
            {!shouldSowPlaceholder && (
              <CopyBtn
                label="copy expression"
                value={filterExpression}
                sx={{
                  padding: (theme: Theme) => theme.spacing(0.25, 0.5),
                  '& svg': {
                    fontSize: '14px',
                  },
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogContent>
          <Box>
            <ConditionGroup
              fields={fields}
              handleConditions={handleConditions}
              conditions={flatConditions}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <CustomButton
            onClick={onReset}
            color="primary"
            size="small"
            startIcon={<ResetIcon />}
          >
            <Typography variant="button"> {btnTrans('reset')}</Typography>
          </CustomButton>
          <div>
            <CustomButton
              autoFocus
              onClick={onCancel}
              color="primary"
              sx={{ marginRight: (theme: Theme) => theme.spacing(1) }}
            >
              <Typography variant="button"> {btnTrans('cancel')}</Typography>
            </CustomButton>

            <CustomButton
              onClick={onSubmit}
              variant="contained"
              color="primary"
              disabled={!isLegal}
            >
              {btnTrans('applyFilter')}
            </CustomButton>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

AdvancedDialog.displayName = 'AdvancedDialog';

export default AdvancedDialog;

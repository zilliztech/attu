import { ReactElement } from 'react';
import { DialogType } from '@/context';
import { SxProps, Theme } from '@mui/material';

export type CustomDialogType = DialogType & {
  onClose: () => void;
  containerClass?: string;
};

export type DeleteDialogType = DeleteDialogContentType & {
  title: string;
  open: boolean;
  setOpen: Function;
  onDelete: () => void;
};

export type DeleteDialogContentType = {
  title: string;
  text: string;
  label: string;
  compare?: string;
  handleCancel?: () => void;
  handleDelete: (force?: boolean) => void;
  forceDelLabel?: string;
};

export type DialogContainerProps = {
  title: string;
  cancelLabel?: string | ReactElement;
  confirmLabel?: string | ReactElement;
  showCloseIcon?: boolean;
  handleClose: () => void;
  handleCancel?: () => void;
  handleConfirm: (param?: any) => void;
  confirmDisabled?: boolean;
  confirmDisabledTooltip?: string;
  showActions?: boolean;
  showCancel?: boolean;
  leftActions?: ReactElement;
  // code mode requirement
  showCode?: boolean;
  children: ReactElement;
  dialogClass?: string;
  sx?: SxProps<Theme>;
};

import { ReactElement } from 'react';
import { DialogType } from '../../context/Types';
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
  handleCancel?: () => void;
  handleDelete: () => void;
};

export type DialogContainerProps = {
  title: string;
  cancelLabel?: string | ReactElement;
  confirmLabel?: string | ReactElement;
  handleClose: () => void;
  handleCancel?: () => void;
  handleConfirm: (param: any) => void;
  confirmDisabled?: boolean;
  showActions?: boolean;
  showCancel?: boolean;
};

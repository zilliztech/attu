import { SnackBarType } from '../../context/Types';
export type CustomSnackBarType = SnackBarType & { onClose: () => void };

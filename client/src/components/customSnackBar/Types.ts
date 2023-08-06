import { SnackBarType } from '@/context';
export type CustomSnackBarType = SnackBarType & { onClose: () => void };

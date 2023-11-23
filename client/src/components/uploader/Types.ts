import { FILE_MIME_TYPE } from '@/consts';

export interface UploaderProps {
  label: string;
  accept: string;
  btnClass?: string;
  disabled?: boolean;
  disableTooltip?: string;
  // unit should be byte
  maxSize?: number;
  // snackbar warning when uploaded file size is over limit
  overSizeWarning?: string;
  setFileName: (fileName: string) => void;
  // handle uploader uploaded
  handleUploadedData: (
    data: string,
    uploader: HTMLFormElement,
    type: FILE_MIME_TYPE
  ) => void;
  // handle uploader onchange
  handleUploadFileChange?: (file: File, uploader: HTMLFormElement) => void;
  handleUploadError?: () => void;
}

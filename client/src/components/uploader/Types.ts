export interface UploaderProps {
  label: string;
  accept: string;
  btnClass?: string;
  // unit should be byte
  maxSize?: number;
  // snackbar warning when uploaded file size is over limit
  overSizeWarning?: string;
  setFileName: (fileName: string) => void;
  handleUploadedData: (data: string) => void;
  handleUploadFileChange?: (file: File) => void;
  handleUploadError?: () => void;
}

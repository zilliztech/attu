import { makeStyles, Theme } from '@material-ui/core';
import { FC, useContext, useRef } from 'react';
import { rootContext } from '@/context';
import CustomButton from '../customButton/CustomButton';
import { UploaderProps } from './Types';
import { FILE_MIME_TYPE } from '@/consts';

const getStyles = makeStyles((theme: Theme) => ({
  btn: {},
}));

const Uploader: FC<UploaderProps> = ({
  label,
  accept,
  btnClass = '',
  disabled = false,
  disableTooltip = '',
  maxSize,
  overSizeWarning = '',
  handleUploadedData,
  handleUploadFileChange,
  handleUploadError,
  setFileName,
}) => {
  const inputRef = useRef(null);
  const type = useRef<FILE_MIME_TYPE>(FILE_MIME_TYPE.CSV);
  const classes = getStyles();

  const { openSnackBar } = useContext(rootContext);

  const handleUpload = () => {
    const uploader = inputRef.current! as HTMLFormElement;
    const reader = new FileReader();
    // handle uploaded data
    reader.onload = async e => {
      const data = reader.result;
      if (data) {
        handleUploadedData(data as string, inputRef.current!, type.current);
      }
    };
    // handle upload error
    reader.onerror = e => {
      if (handleUploadError) {
        handleUploadError();
      }
      console.error(e);
    };
    uploader!.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file: File = (target.files as FileList)[0];
      if (file) {
        type.current = file.type as FILE_MIME_TYPE; // This will log the MIME type of the file
      }
      const isSizeOverLimit = file && maxSize && maxSize < file.size;

      if (!file) {
        return;
      }
      if (isSizeOverLimit) {
        openSnackBar(overSizeWarning, 'error');
        const uploader = inputRef.current! as HTMLFormElement;
        uploader.value = null;
        return;
      }

      setFileName(file.name || 'file');
      handleUploadFileChange && handleUploadFileChange(file, inputRef.current!);
      reader.readAsText(file, 'utf8');
    };
    uploader.click();
  };

  return (
    <form>
      <CustomButton
        variant="contained"
        className={`${classes.btn} ${btnClass}`}
        onClick={handleUpload}
        disabled={disabled}
        tooltip={disabled ? disableTooltip : ''}
      >
        {label}
      </CustomButton>
      <input
        ref={inputRef}
        id="fileId"
        type="file"
        accept={accept}
        style={{ display: 'none' }}
      />
    </form>
  );
};

export default Uploader;

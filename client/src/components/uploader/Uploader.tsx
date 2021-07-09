import { makeStyles, Theme } from '@material-ui/core';
import { FC, useRef } from 'react';
import CustomButton from '../customButton/CustomButton';
import { UploaderProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  btn: {},
}));

const Uploader: FC<UploaderProps> = ({ label, accept, btnClass = '' }) => {
  const inputRef = useRef(null);
  const classes = getStyles();

  return (
    <form>
      <CustomButton variant="text" className={`${classes.btn} ${btnClass}`}>
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

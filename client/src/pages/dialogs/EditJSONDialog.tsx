import { FC, useState } from 'react';
import { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { makeStyles } from '@mui/styles';

import { JSONEditor } from '../play/JSONEditor';

const useStyles = makeStyles((theme: Theme) => ({
  code: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    overflow: 'auto',
  },
  tip: {
    fontSize: 12,
    marginBottom: 8,
    width: 480,
    lineHeight: '20px',
  },
}));

type EditJSONDialogProps = {
  data: { [key: string]: any };
  handleConfirm: (data: { [key: string]: any }) => void;
  handleCloseDialog: () => void;
  dialogTitle: string;
  dialogTip: string;
  cb?: () => void;
};

const EditJSONDialog: FC<EditJSONDialogProps> = props => {
  // props
  const { data, handleCloseDialog, handleConfirm } = props;
  // UI states
  const [disabled, setDisabled] = useState(true);
  // translations
  const { t: btnTrans } = useTranslation('btn');
  // styles
  const classes = useStyles();

  const originalData = JSON.stringify(data, null, 2) + '\n';
  const [value, setValue] = useState(originalData);

  // handle confirm
  const _handleConfirm = async () => {
    handleConfirm(JSON.parse(value));
    handleCloseDialog();
  };

  const handleChange = (docValue: string) => {
    try {
      setValue(docValue);
      const jsonValue = JSON.parse(docValue);
      setDisabled(docValue === originalData);
    } catch (err) {
      setDisabled(true);
    }
  };

  return (
    <DialogTemplate
      title={props.dialogTitle}
      handleClose={handleCloseDialog}
      children={
        <>
          <div
            className={classes.tip}
            dangerouslySetInnerHTML={{
              __html: props.dialogTip,
            }}
          ></div>
          <div className={classes.code}>
            <JSONEditor value={originalData} onChange={handleChange} />
          </div>
        </>
      }
      confirmDisabled={disabled}
      confirmLabel={btnTrans('edit')}
      handleConfirm={_handleConfirm}
      showCancel={true}
    />
  );
};

export default EditJSONDialog;

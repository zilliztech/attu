import { FC, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';

import { JSONEditor } from '../play/JSONEditor';

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
  // theme
  const theme = useTheme();

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
      // Validate JSON parsing
      JSON.parse(docValue);
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
          <Box
            sx={{
              fontSize: 12,
              marginBottom: 1, // theme.spacing(1)
              width: 480,
              lineHeight: '20px',
            }}
            dangerouslySetInnerHTML={{
              __html: props.dialogTip,
            }}
          ></Box>
          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1, // theme.shape.borderRadius
              overflow: 'auto',
            }}
          >
            <JSONEditor value={originalData} onChange={handleChange} />
          </Box>
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

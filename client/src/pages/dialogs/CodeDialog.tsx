import { FC, useContext, useState } from 'react';
import { Theme, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CodeBlock from '@/components/code/CodeBlock';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  code: {
    backgroundColor: theme.palette.background.default,
    width: 800,
    height: '40vh',
    overflow: 'auto',
  },
}));

type CodeDialogProps = {
  data: { [key: string]: string };
};

const CodeDialog: FC<CodeDialogProps> = props => {
  // props
  const langauges = Object.keys(props.data);

  // build options
  const options = langauges.map(lang => ({
    label: lang,
    value: lang,
  }));
  // styles
  const classes = useStyles();
  // states
  const [langauge, setLanguage] = useState(langauges[0]);
  const code = props.data[langauge];

  // context
  const { handleCloseDialog } = useContext(rootContext);
  // translations
  const { t: btnTrans } = useTranslation('btn');

  const disabled = false;

  return (
    <DialogTemplate
      title={'Code View(beta)'}
      handleClose={handleCloseDialog}
      children={
        <>
          <CustomSelector
            label="Language"
            value={langauge}
            onChange={(event: SelectChangeEvent<unknown>) => {
              setLanguage(event.target.value as string);
            }}
            options={options}
            variant="filled"
          />
          <CodeBlock
            code={code}
            language={langauge === 'node.js' ? 'javascript' : langauge}
            wrapperClass={classes.code}
          />
        </>
      }
      confirmLabel={btnTrans('Ok')}
      handleConfirm={() => {
        handleCloseDialog();
      }}
      showCancel={false}
      confirmDisabled={disabled}
    />
  );
};

export default CodeDialog;

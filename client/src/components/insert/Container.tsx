import { makeStyles, Theme } from '@material-ui/core';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../customDialog/DialogTemplate';
import icons from '../icons/Icons';
import { rootContext } from '../../context/Root';
import InsertImport from './Import';
import InsertPreview from './Preview';
import InsertStatus from './Status';
import { InsertStatusEnum, InsertStepperEnum } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '16px',
  },
}));

/**
 * this component contains processes during insert
 * all datas and methods passed in as props, no interactions with server done in it
 */

const InsertContainer = () => {
  const classes = getStyles();

  const { t: insertTrans } = useTranslation('insert');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog } = useContext(rootContext);
  const [activeStep, setActiveStep] = useState<InsertStepperEnum>(
    InsertStepperEnum.import
  );
  const [insertStatus, setInsertStauts] = useState<InsertStatusEnum>(
    InsertStatusEnum.init
  );
  // const [nextDisabled, setNextDisabled] = useState<boolean>(false);

  const BackIcon = icons.back;

  const { confirm, cancel } = useMemo(() => {
    /**
     * activeStep type is InsertStepperEnum
     * so index 0 represents import,
     * index 1 represents preview,
     * index 2 represents status
     */
    const labelList = [
      {
        confirm: btnTrans('next'),
        cancel: btnTrans('cancel'),
      },
      {
        confirm: btnTrans('insert'),
        cancel: (
          <>
            <BackIcon classes={{ root: classes.icon }} />
            {btnTrans('previous')}
          </>
        ),
      },
      {
        confirm: btnTrans('done'),
        cancel: '',
      },
    ];
    return labelList[activeStep];
  }, [activeStep, btnTrans, BackIcon, classes.icon]);

  const { showActions, showCancel } = useMemo(() => {
    return {
      showActions: insertStatus !== InsertStatusEnum.loading,
      showCancel: insertStatus === InsertStatusEnum.init,
    };
  }, [insertStatus]);

  const handleInsertData = () => {
    // mock status change
    setInsertStauts(InsertStatusEnum.loading);
    setTimeout(() => {
      setInsertStauts(InsertStatusEnum.success);
    }, 500);
  };

  const handleNext = () => {
    switch (activeStep) {
      case InsertStepperEnum.import:
        setActiveStep(activeStep => activeStep + 1);
        break;
      case InsertStepperEnum.preview:
        setActiveStep(activeStep => activeStep + 1);
        // @TODO insert interactions
        handleInsertData();
        break;
      // default represent InsertStepperEnum.status
      default:
        handleCloseDialog();
        break;
    }
  };

  const handleBack = () => {
    switch (activeStep) {
      case InsertStepperEnum.import:
        handleCloseDialog();
        break;
      case InsertStepperEnum.preview:
        setActiveStep(activeStep => activeStep - 1);
        // @TODO reset uploaded file?
        break;
      // default represent InsertStepperEnum.status
      // status don't have cancel button
      default:
        break;
    }
  };

  const generateContent = (activeStep: InsertStepperEnum) => {
    switch (activeStep) {
      case InsertStepperEnum.import:
        return <InsertImport />;
      case InsertStepperEnum.preview:
        return <InsertPreview />;
      // default represents InsertStepperEnum.status
      default:
        return <InsertStatus />;
    }
  };

  return (
    <DialogTemplate
      title={insertTrans('import')}
      handleClose={handleCloseDialog}
      confirmLabel={confirm}
      cancelLabel={cancel}
      handleCancel={handleBack}
      handleConfirm={handleNext}
      confirmDisabled={false}
      showActions={showActions}
      showCancel={showCancel}
    >
      {generateContent(activeStep)}
    </DialogTemplate>
  );
};

export default InsertContainer;

import { makeStyles, Theme } from '@material-ui/core';
import { FC, useState, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../customDialog/DialogTemplate';
import CustomSelector from '../customSelector/CustomSelector';
import { rootContext } from '../../context/Root';

const getStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '16px',
  },
  selectors: {
    '& .selectorWrapper': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',

      marginBottom: theme.spacing(2),

      '& .selectLabel': {
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.attuDark.main,
      },

      '& .divider': {
        width: '20px',
        margin: theme.spacing(0, 4),
        backgroundColor: theme.palette.attuGrey.dark,
      },
    },

    '& .selector': {
      flexBasis: '40%',
      minWidth: '128px',
    },
  },
}));

/**
 * this component contains processes during insert
 * including import, preview and status
 */

const LoadDemo: FC<{ collection: string; handleLoadSample: Function }> =
  props => {
    const classes = getStyles();

    const { t: insertTrans } = useTranslation('insert');
    const { handleCloseDialog, openSnackBar } = useContext(rootContext);
    // selected collection name
    const [size, setSize] = useState<string>('100');

    const sizeOptions = [
      {
        label: '100',
        value: '100',
      },
      {
        label: '1k',
        value: '1000',
      },
      {
        label: '10k',
        value: '10000',
      },
      {
        label: '50k',
        value: '50000',
      },
    ];

    const handleNext = async () => {
      // start loading
      // setInsertStatus(InsertStatusEnum.loading);
      const { result, msg } = await props.handleLoadSample(
        props.collection,
        size
      );

      // if (!result) {
      //   setInsertFailMsg(msg);
      // }
      // const status = result ? InsertStatusEnum.success : InsertStatusEnum.error;
      // setInsertStatus(status);
    };

    return (
      <DialogTemplate
        title={insertTrans('loadSampleData', { collection: props.collection })}
        handleClose={handleCloseDialog}
        confirmLabel={'confirm'}
        handleConfirm={handleNext}
        confirmDisabled={false}
        showActions={true}
        showCancel={true}
        // don't show close icon when insert not finish
        // showCloseIcon={insertStatus !== InsertStatusEnum.loading}
      >
        <form className={classes.selectors}>
          <div className="selectorWrapper">
            <CustomSelector
              label={insertTrans('sampleDataSize')}
              options={sizeOptions}
              wrapperClass="selector"
              labelClass="selectLabel"
              value={size}
              variant="filled"
              onChange={(e: { target: { value: unknown } }) => {
                const size = e.target.value;
                setSize(size as string);
              }}
            />
          </div>
        </form>
      </DialogTemplate>
    );
  };

export default LoadDemo;

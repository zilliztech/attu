import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../customDialog/DialogTemplate';
import CustomSelector from '../customSelector/CustomSelector';
import { rootContext } from '../../context/Root';
import { InsertStatusEnum } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '16px',
  },

  selectors: {
    '& .selectorWrapper': {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(2),

      '& .selectLabel': {
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.attuDark.main,
      },

      '& .description': {
        color: theme.palette.attuGrey.dark,
        marginBottom: theme.spacing(1),
        fontSize: 12,
      },
    },

    '& .selector': {
      minWidth: '128px',
    },
  },
}));

/**
 * this component contains processes during insert
 * including import, preview and status
 */

const ImportSample: FC<{ collection: string; handleLoadSample: Function }> =
  props => {
    const classes = getStyles();
    const [size, setSize] = useState<string>('100');
    const [insertStatus, setInsertStatus] = useState<InsertStatusEnum>(
      InsertStatusEnum.init
    );

    const { t: insertTrans } = useTranslation('insert');
    const { handleCloseDialog, openSnackBar } = useContext(rootContext);
    // selected collection name

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
      if (insertStatus === InsertStatusEnum.success) {
        handleCloseDialog();
        return;
      }
      // start loading
      setInsertStatus(InsertStatusEnum.loading);
      const { result, msg } = await props.handleLoadSample(
        props.collection,
        size
      );

      if (!result) {
        openSnackBar(msg, 'error');
        setInsertStatus(InsertStatusEnum.init);
        return;
      }
      setInsertStatus(InsertStatusEnum.success);
      // hide dialog
      handleCloseDialog();
    };

    return (
      <DialogTemplate
        title={insertTrans('loadSampleData', { collection: props.collection })}
        handleClose={handleCloseDialog}
        confirmLabel={
          insertStatus === InsertStatusEnum.init
            ? 'Import'
            : insertStatus === InsertStatusEnum.loading
            ? 'Loading...'
            : insertStatus === InsertStatusEnum.success
            ? 'Done'
            : insertStatus
        }
        handleConfirm={handleNext}
        confirmDisabled={false}
        showActions={true}
        showCancel={false}
        // don't show close icon when insert not finish
        // showCloseIcon={insertStatus !== InsertStatusEnum.loading}
      >
        <form className={classes.selectors}>
          <div className="selectorWrapper">
            <div className="description">
              <Typography variant="inherit" component="p">
                {insertTrans('loadSampleDataDesc')}
              </Typography>
            </div>

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

export default ImportSample;

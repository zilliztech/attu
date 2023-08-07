import { Dialog, makeStyles, Theme } from '@material-ui/core';
import { useMemo, useState } from 'react';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { HEALTHY_STATUS_COLORS } from './consts';
import { EHealthyStatus, IThreshold } from './Types';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import CustomButton from '@/components/customButton/CustomButton';
export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '24px 32px',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
  },
  note: {
    fontWeight: 500,
    color: '#444',
    fontSize: '14px',
    margin: theme.spacing(1, 0, 2),
  },
  input: {
    margin: theme.spacing(0.5, 0, 0),
  },
  button: {
    alignSelf: 'flex-end',
  },
}));

function ThresholdSettingDialog({
  onClose,
  open,
  threshold,
  setThreshold,
}: {
  open: boolean;
  onClose: () => void;
  threshold: IThreshold;
  setThreshold: (threshold: IThreshold) => void;
}) {
  const classes = getStyles();
  const handleClose = () => {
    setThreshold({ ...form, memory: form.memory * 1024 * 1024 * 1024 });
    onClose();
  };

  const [form, setForm] = useState<IThreshold>({
    cpu: threshold.cpu,
    memory: threshold.memory / 1024 / 1024 / 1024,
  });

  const handleFormChange = (key: 'cpu' | 'memory', value: number) => {
    setForm(v => ({ ...v, [key]: value }));
  };
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid } = useFormValidation(checkedForm);

  const inputConfigs: ITextfieldConfig[] = useMemo(
    () => [
      {
        label: `CPU (Core)`,
        key: 'prometheus_address',
        onChange: (v: string) => handleFormChange('cpu', +v),
        variant: 'filled',
        className: classes.input,
        placeholder: 'CPU',
        fullWidth: true,

        defaultValue: form.cpu,
      },
      {
        label: `Memory (GB)`,
        key: 'prometheus_address',
        onChange: (v: string) => handleFormChange('memory', +v),
        variant: 'filled',
        className: classes.input,
        placeholder: 'Memory',
        fullWidth: true,

        defaultValue: form.memory,
      },
    ],
    [form]
  );

  return (
    <Dialog onClose={handleClose} open={open}>
      <div className={classes.root}>
        <div className={classes.note}>
          {`Exceeding any threshold will result in a `}
          <span
            style={{
              color: HEALTHY_STATUS_COLORS[EHealthyStatus.warning],
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            warning
          </span>
          .
        </div>
        {inputConfigs.map(v => (
          <CustomInput
            type="text"
            textConfig={v}
            key={v.label}
            checkValid={checkIsValid}
            validInfo={validation}
          />
        ))}
        <div className={classes.button}>
          <CustomButton variant="contained" onClick={handleClose}>
            Confirm
          </CustomButton>
        </div>
      </div>
    </Dialog>
  );
}

const ThresholdSetting = ({
  threshold,
  setThreshold,
}: {
  threshold: IThreshold;
  setThreshold: (threshold: IThreshold) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <SettingsOutlinedIcon
        onClick={handleClickOpen}
        style={{
          cursor: 'pointer',
          opacity: 0.8,
        }}
      />
      <ThresholdSettingDialog
        threshold={threshold}
        setThreshold={setThreshold}
        open={open}
        onClose={handleClose}
      />
    </>
  );
};

export default ThresholdSetting;

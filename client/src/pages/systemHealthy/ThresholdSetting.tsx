import {
  Button,
  Dialog,
  DialogTitle,
  Input,
  List,
  ListItem,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import CustomInput from '../../components/customInput/CustomInput';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import { HEALTHY_STATUS_COLORS } from './consts';
import { EHealthyStatus, IThreshold } from './Types';

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '12px 16px',
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
  setThreshold: Dispatch<SetStateAction<IThreshold>>;
}) {
  const classes = getStyles();
  const handleClose = () => {
    console.log('form', form)
    setThreshold(form);
    onClose();
  };

  const [form, setForm] = useState<IThreshold>({
    cpu: threshold.cpu,
    memory: threshold.memory,
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
        label: `CPU (Cores)`,
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
    []
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
      </div>
    </Dialog>
  );
}

const ThresholdSetting = ({
  threshold,
  setThreshold,
}: {
  threshold: IThreshold;
  setThreshold: Dispatch<SetStateAction<IThreshold>>;
}) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        icon
      </Button>
      <ThresholdSettingDialog
        threshold={threshold}
        setThreshold={setThreshold}
        open={open}
        onClose={handleClose}
      />
    </div>
  );
};

export default ThresholdSetting;

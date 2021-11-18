import { FC, useState } from 'react';
import { DateTimePicker } from '@material-ui/pickers';
import Icons from '../icons/Icons';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DatePickerType } from './Types';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  icon: {
    color: (props: any) =>
      props.date ? theme.palette.primary.main : '#82838E',
  },
  label: {
    marginLeft: '4px',
    color: (props: any) =>
      props.date ? theme.palette.primary.main : '#82838E',
    fontWeight: 'bold',
  },
  picker: {
    width: 0,
  },
  clear: {
    fontSize: '14px',
    color: theme.palette.primary.main,
    marginLeft: '4px',
  },
}));

export const CustomDatePicker: FC<DatePickerType> = props => {
  const { onChange, label, date, setDate } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles({ date });
  const { t: btnTrans } = useTranslation('btn');

  const DatePickerIcon = Icons.datePicker;
  const ClearIcon = Icons.clear;

  const handleChange = (value: MaterialUiPickersDate) => {
    setDate(value);
    onChange(value);
  };

  const handleClear = (e: any) => {
    e.stopPropagation();
    handleChange(null);
  };
  return (
    <>
      <div
        className={classes.wrapper}
        onClick={() => {
          setOpen(true);
        }}
      >
        <DatePickerIcon className={classes.icon} />
        <Typography className={classes.label}>{label}</Typography>
        {date && <ClearIcon onClick={handleClear} className={classes.clear} />}
      </div>

      <DateTimePicker
        className={classes.picker}
        value={date}
        open={open}
        onChange={handleChange}
        onClose={() => setOpen(false)}
        okLabel={btnTrans('confirm')}
      ></DateTimePicker>
    </>
  );
};

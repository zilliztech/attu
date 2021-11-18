import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export type DatePickerType = {
  label: string;
  onChange: (value: any) => void;
  date: MaterialUiPickersDate;
  setDate: (value: MaterialUiPickersDate) => void;
};

import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
  scalarFieldsWrapper: {
    width: '100%',
    paddingRight: theme.spacing(1),
    overflowY: 'auto',
  },
  title: {
    fontSize: 14,
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(1.5),
    '& button': {
      position: 'relative',
      top: '-1px',
      marginLeft: 4,
    },
  },
  rowWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    marginBottom: 4,
    '& .MuiFormLabel-root': {
      fontSize: 14,
    },
    '& .MuiInputBase-root': {
      fontSize: 14,
    },
    '& .MuiSelect-filled': {
      fontSize: 14,
    },
    '& .MuiCheckbox-root': {
      padding: 4,
    },
    '& .MuiFormControlLabel-label': {
      fontSize: 14,
    },
  },
  fieldInput: {
    width: '130px',
  },
  select: {
    width: '150px',
    marginTop: '-20px',
  },
  smallSelect: {
    width: '105px',
    marginTop: '-20px',
  },
  autoIdSelect: {
    width: '120px',
    marginTop: '-20px',
  },
  numberBox: {
    width: '80px',
  },
  maxLength: {
    maxWidth: '80px',
  },
  descInput: {
    width: '64px',
  },
  btnTxt: {
    textTransform: 'uppercase',
  },
  iconBtn: {
    padding: 0,
    position: 'relative',
    top: '-8px',
    '& svg': {
      width: 15,
    },
  },
  helperText: {
    lineHeight: '20px',
    fontSize: '10px',
    margin: theme.spacing(0),
    marginLeft: '11px',
  },
  toggle: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
  },
  paramsGrp: {
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 8,
    minHeight: 44,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  analyzerInput: {
    paddingTop: 8,
    '& .select': {
      width: '110px',
    },
  },
  setting: { fontSize: 12, alignItems: 'center', display: 'flex' },
}));

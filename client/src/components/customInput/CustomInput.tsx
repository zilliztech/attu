import {
  FilledTextFieldProps,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  makeStyles,
  StandardTextFieldProps,
  TextField,
} from '@material-ui/core';
import Icons from '../icons/Icons';
import { ReactElement } from 'react';
import {
  IAdornmentConfig,
  IIconConfig,
  ITextfieldConfig,
  ICustomInputProps,
  IBlurParam,
  IValidInfo,
  IChangeParam,
} from './Types';

const handleOnBlur = (param: IBlurParam) => {
  const {
    event,
    key,
    param: { cb, checkValid, validations },
  } = param;
  const input = event.target.value;
  const isValid = validations
    ? checkValid({
        key,
        value: input,
        rules: validations,
      })
    : true;

  if (isValid) {
    cb(input);
  }
};

const handleOnChange = (param: IChangeParam) => {
  const {
    event,
    key,
    param: { cb, checkValid, validations },
  } = param;
  const input = event.target.value;
  const isValid = validations
    ? checkValid({
        key,
        value: input,
        rules: validations,
      })
    : true;

  if (isValid) {
    cb(input);
  }
};

const getAdornmentStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.milvusGrey.dark,
  },
}));

const getAdornmentInput = (
  config: IAdornmentConfig,
  checkValid: Function,
  validInfo: IValidInfo
): ReactElement => {
  const {
    label,
    key,
    icon,
    isPasswordType = false,
    inputClass,
    showPassword,
    validations,
    onIconClick,
    onInputBlur,
    onInputChange,
  } = config;

  const classes = getAdornmentStyles();

  const param = {
    cb: onInputBlur || (() => {}),
    validations: validations || [],
    checkValid,
  };

  const info = validInfo ? validInfo[key] : null;

  return (
    <FormControl>
      <InputLabel htmlFor="standard-adornment-password">{label}</InputLabel>
      <Input
        classes={{ root: `${inputClass || {}}` }}
        type={isPasswordType ? (showPassword ? 'text' : 'password') : 'text'}
        onBlur={e => {
          handleOnBlur({ event: e, key, param });
        }}
        onChange={e => {
          handleOnChange({
            event: e,
            key,
            param: {
              ...param,
              cb: onInputChange || (() => {}),
            },
          });
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={onIconClick || (() => {})} edge="end">
              {isPasswordType
                ? showPassword
                  ? Icons.visible({ classes: { root: classes.icon } })
                  : Icons.invisible({ classes: { root: classes.icon } })
                : icon}
            </IconButton>
          </InputAdornment>
        }
        inputProps={{
          'data-cy': key,
        }}
      />

      {
        <FormHelperText classes={{ root: `${inputClass || {}}` }}>
          {info && info.result && info.errText
            ? createHelperTextNode(info.errText)
            : ' '}
        </FormHelperText>
      }
    </FormControl>
  );
};

const getIconInput = (
  config: IIconConfig,
  checkValid: Function,
  validInfo: IValidInfo
): ReactElement => {
  const { icon, inputType, inputConfig, containerClass, spacing, alignItems } =
    config;
  return (
    <Grid
      classes={{ container: `${containerClass || {}}` }}
      container
      spacing={spacing || 0}
      alignItems={alignItems}
    >
      <Grid item>{icon}</Grid>
      <Grid item>
        {inputType === 'icon'
          ? getTextfield(inputConfig as ITextfieldConfig, checkValid, validInfo)
          : getAdornmentInput(
              inputConfig as IAdornmentConfig,
              checkValid,
              validInfo
            )}
      </Grid>
    </Grid>
  );
};

const getTextfield = (
  config: ITextfieldConfig,
  checkValid: Function,
  validInfo: IValidInfo
): ReactElement => {
  const {
    key,
    className,
    validations,
    onBlur,
    onChange,
    fullWidth,
    size,
    placeholder,
    inputProps,
    InputProps,
    value,
    ...others
  } = config;

  if (value !== undefined) {
    (others as any).value = value;
  }

  const param = {
    cb: onBlur || (() => {}),
    validations: validations || [],
    checkValid,
  };

  const info = validInfo ? validInfo[key] : null;
  const defaultInputProps = { 'data-cy': key };
  return (
    <TextField
      {...(others as
        | StandardTextFieldProps
        | FilledTextFieldProps
        | FilledTextFieldProps)}
      size={size || 'medium'}
      fullWidth={fullWidth}
      placeholder={placeholder || ''}
      inputProps={
        inputProps
          ? { ...inputProps, ...defaultInputProps }
          : { ...defaultInputProps }
      }
      error={info?.result && info.errText !== ''}
      InputProps={InputProps ? { ...InputProps } : {}}
      helperText={
        info && info.result && info.errText
          ? createHelperTextNode(info.errText)
          : ' '
      }
      className={className || ''}
      onBlur={event => {
        handleOnBlur({ event, key, param });
      }}
      // value={value}
      onChange={event => {
        handleOnChange({
          event,
          key,
          param: { ...param, cb: onChange || (() => {}) },
        });
      }}
    />
  );
};

const getStyles = makeStyles(theme => ({
  errWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    color: `${theme.palette.error.main}`,
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    overflow: 'hidden',
    marginLeft: '12px',
  },
  errBtn: {
    marginRight: `${theme.spacing(1)}`,
  },
}));

const createHelperTextNode = (hint: string): ReactElement => {
  const classes = getStyles();
  return (
    <span className={classes.errWrapper}>
      {/* {Icons.error({
        fontSize: 'small',
        classes: {
          root: classes.errBtn,
        },
      })} */}
      {hint}
    </span>
  );
};

const CustomInput = (props: ICustomInputProps) => {
  const {
    type,
    iconConfig,
    textConfig,
    adornmentConfig,
    checkValid,
    validInfo,
  } = props;

  let template: ReactElement | null;
  switch (type) {
    case 'adornment':
      template = getAdornmentInput(adornmentConfig!, checkValid!, validInfo!);
      break;
    case 'icon':
      template = getIconInput(iconConfig!, checkValid!, validInfo!);
      break;
    case 'text':
      template = getTextfield(textConfig!, checkValid!, validInfo!);
      break;
    default:
      // default is plain text input
      template = getTextfield(textConfig!, checkValid!, validInfo!);
  }

  return template;
};

export default CustomInput;

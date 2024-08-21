import { Button, ButtonProps, Tooltip, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const buttonStyle = makeStyles((theme: Theme) => ({
  button: {
    padding: theme.spacing(1, 3),
    textTransform: 'initial',
    fontWeight: 'bold',
  },
  textBtn: {
    color: theme.palette.primary.main,
    padding: theme.spacing(1),

    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.background.paper,
    },
  },
  containedBtn: {
    color: theme.palette.background.paper,
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'initial',
    fontWeight: 'bold',
    lineHeight: '24px',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: 'initial',
    },
  },
  containedSecondary: {
    backgroundColor: '#fc4c02',

    '&:hover': {
      backgroundColor: '#fc4c02',
    },
  },
  disabledBtn: {
    pointerEvents: 'none',
  },
}));

// props types same as Material Button
const CustomButton = (
  props: ButtonProps & {
    tooltip?: string;
    tooltipPlacement?:
      | 'bottom'
      | 'left'
      | 'right'
      | 'top'
      | 'bottom-end'
      | 'bottom-start'
      | 'left-end'
      | 'left-start'
      | 'right-end'
      | 'right-start'
      | 'top-end'
      | 'top-start'
      | undefined;
  }
) => {
  const classes = buttonStyle();
  const { tooltip, tooltipPlacement, disabled, ...otherProps } = props;

  // wrap a span to let disabled elements show tooltip

  const btn = (
    <Button
      classes={{
        root: classes.button,
        text: classes.textBtn,
        contained: classes.containedBtn,
        containedSecondary: classes.containedSecondary,
        disabled: classes.disabledBtn,
      }}
      disabled={disabled}
      {...otherProps}
    >
      {props.children}
    </Button>
  );

  return (
    <>
      {/*
      add span to let disabled elements show tooltip
      see https://material-ui.com/zh/components/tooltips/#disabled-elements
      */}
      {tooltip ? (
        <Tooltip title={tooltip} placement={tooltipPlacement}>
          {disabled ? <span>{btn}</span> : btn}
        </Tooltip>
      ) : (
        <Button
          classes={{
            root: classes.button,
            text: classes.textBtn,
            contained: classes.containedBtn,
            containedSecondary: classes.containedSecondary,
          }}
          {...otherProps}
        >
          {props.children}
        </Button>
      )}
    </>
  );
};

export default CustomButton;

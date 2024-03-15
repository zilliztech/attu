import { Button, ButtonProps, makeStyles, Tooltip } from '@material-ui/core';

const buttonStyle = makeStyles(theme => ({
  button: {
    padding: theme.spacing(1, 3),
    textTransform: 'initial',
    fontWeight: 'bold',
  },
  textBtn: {
    color: theme.palette.primary.main,
    padding: theme.spacing(1),

    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
  containedBtn: {
    color: '#fff',
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
const CustomButton = (props: ButtonProps & { tooltip?: string }) => {
  const classes = buttonStyle();
  const { tooltip, ...otherProps } = props;

  return (
    <>
      {/*
      add span to let disabled elements show tooltip
      see https://material-ui.com/zh/components/tooltips/#disabled-elements
      */}
      {tooltip ? (
        <Tooltip title={tooltip}>
          <span>
            <Button
              classes={{
                root: classes.button,
                text: classes.textBtn,
                contained: classes.containedBtn,
                containedSecondary: classes.containedSecondary,
                disabled: classes.disabledBtn,
              }}
              {...otherProps}
            >
              {props.children}
            </Button>
          </span>
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

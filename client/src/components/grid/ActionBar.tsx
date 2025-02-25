import { FC } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import Icons from '../icons/Icons';
import CustomToolTip from '../customToolTip/CustomToolTip';
import type { Theme } from '@mui/material/styles';
import type { ActionBarType } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    display: 'inline-block',
    marginRight: theme.spacing(1),
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
  },
  tip: {
    position: 'absolute',
    left: 0,
    bottom: '-10px',
    fontSize: '10px',
    textTransform: 'capitalize',
    textAlign: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.15,
  },
  hoverType: {
    marginRight: 0,

    '& button': {
      color: theme.palette.text.primary,
    },
  },
  link: {
    textDecoration: 'underline',
    color: theme.palette.text.primary,
  },
}));

const ActionBar: FC<ActionBarType> = props => {
  const classes = useStyles();
  const { configs, row, isHoverType = false } = props;

  return (
    <>
      {configs.map((v, i) => {
        const label = v.getLabel ? v.getLabel(row) : v.label;

        return (
          <span
            className={`${classes.root} ${v.className} ${
              isHoverType ? classes.hoverType : ''
            }`}
            key={i}
          >
            <CustomToolTip title={label || ''} placement="bottom">
              {v.icon ? (
                <IconButton
                  aria-label={label || ''}
                  onClickCapture={e => {
                    e.stopPropagation();
                    v.onClick(e, row);
                  }}
                  disabled={v.disabled ? v.disabled(row) : false}
                  classes={{
                    disabled: classes.disabled,
                  }}
                  size="large"
                >
                  {v.showIconMethod === 'renderFn'
                    ? v.renderIconFn && v.renderIconFn(row)
                    : Icons[v.icon]()}
                </IconButton>
              ) : v.linkButton ? (
                <Typography
                  component="a"
                  href="#/users"
                  className={classes.link}
                  onClick={e => {
                    e.stopPropagation();
                    v.onClick(e, row);
                  }}
                >
                  {v.text}
                </Typography>
              ) : (
                <Button
                  aria-label={label || ''}
                  onClickCapture={e => {
                    e.stopPropagation();
                    v.onClick(e, row);
                  }}
                  size="small"
                  disabled={v.disabled ? v.disabled(row) : false}
                  classes={{
                    disabled: classes.disabled,
                  }}
                >
                  {v.text}
                </Button>
              )}
            </CustomToolTip>
          </span>
        );
      })}
    </>
  );
};

export default ActionBar;

import { FC, useState, useEffect } from 'react';
import * as React from 'react';
import CustomButton from '../customButton/CustomButton';
import ICONS from '../icons/Icons';
import {
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Button,
} from '@material-ui/core';
import { FilterType } from './Types';
import Icons from '../icons/Icons';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      display: 'inline-block',
      margin: theme.spacing(0, 2),
    },
    count: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '16px',
      height: '16px',
      marginLeft: theme.spacing(1),
      fontSize: '12px',
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
    },
    options: {
      position: 'absolute',
      top: '120%',
      width: '360px',
      padding: theme.spacing(4, 3),
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.33)',
      border: '2px solid rgba(0, 0, 0, 0.15)',
      zIndex: theme.zIndex.tooltip,
    },
    title: {
      marginBottom: theme.spacing(1),
      textTransform: 'uppercase',
      boxShadow: 'initial',
    },
    btnRoot: {
      color: theme.palette.common.black,
      marginRight: theme.spacing(3),
      opacity: 0.33,
      '&:hover': {
        color: theme.palette.common.black,
        opacity: 0.6,
      },
    },
    active: {
      color: theme.palette.common.black,
      opacity: 0.6,
      backgroundColor: theme.palette.zilliz.light,
    },
    typoButton: {
      textTransform: 'none',
    },
  })
);

const Filter: FC<FilterType> = props => {
  const classes = useStyles();
  const [selected, setSelected] = useState<string[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const { t } = useTranslation('btn');

  const { filterOptions = [], onFilter, filterTitle = '' } = props;

  const handleClick = (e: React.MouseEvent) => {
    setShow(!show);
  };

  const handleFilter = (value: string) => {
    !selected.includes(value) && setSelected([...selected, value]);
  };

  const handleClose = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    setSelected(v => v.filter(text => value !== text));
  };

  const CloseIcon = (props: { value: string }) => (
    <>
      {Icons.clear({
        onClick: (e: React.MouseEvent) => handleClose(e, props.value),
      })}
    </>
  );

  useEffect(() => {
    onFilter && onFilter(selected);
  }, [selected, onFilter]);

  const handleClickAway = () => {
    setShow(false);
  };

  return (
    <div className={classes.root}>
      <CustomButton
        size="small"
        onClick={handleClick}
        startIcon={ICONS.filter()}
        color="primary"
      >
        <Typography variant="button">{t('filter')} </Typography>
        {selected.length ? (
          <Typography
            className={classes.count}
            variant="button"
            component="span"
          >
            {selected.length}
          </Typography>
        ) : null}
      </CustomButton>
      {show && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <div className={classes.options}>
            <Typography className={classes.title}>{filterTitle}</Typography>
            {filterOptions.map(v => (
              <Button
                key={v.value}
                size="small"
                color="default"
                classes={{
                  root: classes.btnRoot,
                }}
                className={selected.includes(v.value) ? classes.active : ''}
                endIcon={
                  selected.includes(v.value) ? (
                    <CloseIcon value={v.value} />
                  ) : null
                }
                onClick={() => {
                  handleFilter(v.value);
                }}
              >
                <Typography
                  variant="button"
                  classes={{ button: classes.typoButton }}
                >
                  {v.label}
                </Typography>
              </Button>
            ))}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default Filter;

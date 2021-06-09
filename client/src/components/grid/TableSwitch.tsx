import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { FC, useState } from 'react';
import Icons from '../icons/Icons';
import { TableSwitchType } from './Types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    line: {
      display: 'inline-block',
      margin: theme.spacing(0, 1),
      border: '1px solid rgba(0, 0, 0, 0.15)',
    },
    btn: {
      cursor: 'pointer',
      color: 'rgba(0, 0, 0, 0.15)',
    },
    active: {
      color: 'rgba(0, 0, 0, 0.6) ',
    },
  })
);

const TableSwitch: FC<TableSwitchType> = props => {
  const { defaultActive = 'list', onListClick, onAppClick } = props;
  const [active, setActive] = useState(defaultActive);
  const classes = useStyles();
  const IconList = Icons.list;
  const IconApp = Icons.app;

  const handleListClick = () => {
    setActive('list');
    onListClick();
  };

  const handleAppClick = () => {
    setActive('app');
    onAppClick();
  };

  return (
    <div className={classes.root}>
      <IconList
        className={`${classes.btn} ${active === 'list' ? classes.active : ''}`}
        role="button"
        onClick={handleListClick}
      />
      <span className={classes.line}></span>
      <IconApp
        className={`${classes.btn} ${active === 'app' ? classes.active : ''}`}
        onClick={handleAppClick}
      />
    </div>
  );
};

export default TableSwitch;

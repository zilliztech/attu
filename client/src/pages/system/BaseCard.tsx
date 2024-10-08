import { FC } from 'react';
import { SvgIcon, Theme } from '@mui/material';
import { BaseCardProps } from './Types';
import pic from '../../assets/imgs/pic.svg?react';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    boxSizing: 'border-box',
    height: '150px',
    padding: theme.spacing(2),
  },
  title: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    marginBottom: '5px',
    textTransform: 'capitalize',
  },
  content: {
    color: theme.palette.text.primary,
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '36px',
  },
  desc: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    lineHeight: '36px',
    marginLeft: theme.spacing(1),
  },
  emptyRoot: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',

    '& > svg': {
      marginTop: '10px',
      width: '100%',
    },
  },
  emptyTitle: {
    fontSize: '14px',
    marginTop: '14px',
    textTransform: 'capitalize',
  },
  emptyDesc: {
    fontSize: '10px',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
}));

const BaseCard: FC<BaseCardProps> = props => {
  const classes = getStyles();
  const { children, title, content, desc } = props;
  return (
    <div className={classes.root}>
      <div className={classes.title}>{title}</div>
      {content && <span className={classes.content}>{content}</span>}
      {desc && <span className={classes.desc}>{desc}</span>}
      {!content && !desc && (
        <div className={classes.emptyRoot}>
          <SvgIcon viewBox="0 0 101 26" component={pic} {...props} />
          <span className={classes.emptyTitle}>no data available</span>
          <span className={classes.emptyDesc}>
            There is no data to show you right now.
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

export default BaseCard;

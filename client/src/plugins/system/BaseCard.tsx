
import { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import { SvgIcon } from '@material-ui/core';
import { BaseCardProps } from './Types';
import { ReactComponent } from '../../assets/imgs/pic.svg'

const getStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',
    boxSizing: 'border-box',
    height: '150px',
    padding: '16px',
  },
  title: {
    color: '#82838E',
    fontSize: '14px',
    marginBottom: '5px',
    textTransform: 'capitalize',
  },
  content: {
    color: '#010E29',
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '36px',
  },
  desc: {
    color: '#82838E',
    fontSize: '14px',
    lineHeight: '36px',
    marginLeft: "8px",
  },
  emptyRoot: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',

    '& > svg': {
      marginTop: '10px',
      width: '100%',
    }
  },
  emptyTitle: {
    fontSize: '14px',
    marginTop: '14px',
    textTransform: 'capitalize',
  },
  emptyDesc: {
    fontSize: '10px',
    color: '#82838E',
    marginTop: '8px',
  },
}));

const BaseCard: FC<BaseCardProps> = (props) => {
  const classes = getStyles();
  const { children, title, content, desc } = props;
  return (
    <div className={classes.root}>
      <div className={classes.title}>{title}</div>
      {content && <span className={classes.content}>{content}</span>}
      {desc && <span className={classes.desc}>{desc}</span>}
      {!content && !desc && (
        <div className={classes.emptyRoot}>
          <SvgIcon viewBox="0 0 101 26" component={ReactComponent} {...props} />
          <span className={classes.emptyTitle}>no data available</span>
          <span className={classes.emptyDesc}>There is no data to show you right now.</span>
        </div>
      )}
      {children}
    </div>
  );
};

export default BaseCard;
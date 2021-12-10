import React, { FC } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import StatusIcon from '../status/StatusIcon';
import { ChildrenStatusType } from '../status/Types';
import { EmptyCardProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  text: {
    marginTop: theme.spacing(4),
    fontSize: '36px',
    lineHeight: '42px',
    color: theme.palette.attuGrey.dark,
    fontWeight: 'bold',
    letterSpacing: '-0.02em',
  },
}));

const EmptyCard: FC<EmptyCardProps> = ({
  icon,
  text,
  wrapperClass = '',
  loading = false,
}) => {
  const classes = useStyles();

  return (
    <section
      className={`flex-center card-wrapper ${classes.wrapper} ${wrapperClass}`}
    >
      {loading && <StatusIcon type={ChildrenStatusType.CREATING} size={40} />}
      {icon}
      <Typography className={classes.text}>{text}</Typography>
    </section>
  );
};

export default EmptyCard;

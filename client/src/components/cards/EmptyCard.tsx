import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC } from 'react';
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
    color: theme.palette.milvusGrey.dark,
    fontWeight: 'bold',
    letterSpacing: '-0.02em',
  },
}));

const EmptyCard: FC<EmptyCardProps> = ({ icon, text, wrapperClass = '' }) => {
  const classes = useStyles();

  return (
    <section
      className={`flex-center card-wrapper ${classes.wrapper} ${wrapperClass}`}
    >
      {icon}
      <Typography className={classes.text}>{text}</Typography>
    </section>
  );
};

export default EmptyCard;

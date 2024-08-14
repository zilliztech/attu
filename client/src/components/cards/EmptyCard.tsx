import { FC } from 'react';
import { Theme, Typography, CardContent } from '@mui/material';
import { makeStyles } from '@mui/styles';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { EmptyCardProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    backgroundColor: '#fff',
    flexDirection: 'column',
    textAlign: 'center',
  },
  text: {
    marginTop: theme.spacing(2),
    fontSize: '36px',
    lineHeight: '42px',
    color: theme.palette.attuGrey.dark,
    fontWeight: 'bold',
    letterSpacing: '-0.02em',
  },
  subText: {
    fontSize: '18px',
    marginTop: theme.spacing(1),
    color: theme.palette.attuGrey.dark,
  },
}));

const EmptyCard: FC<EmptyCardProps> = ({
  icon,
  text,
  wrapperClass = '',
  subText = '',
  loading = false,
}) => {
  const classes = useStyles();

  return (
    <section className={`flex-center ${classes.wrapper} ${wrapperClass}`}>
      <CardContent>
        {loading && <StatusIcon type={LoadingType.CREATING} size={40} />}
        {icon}
        <Typography className={classes.text}>{text}</Typography>
        <Typography className={classes.subText}>{subText}</Typography>
      </CardContent>
    </section>
  );
};

export default EmptyCard;

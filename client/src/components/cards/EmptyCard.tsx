import { FC } from 'react';
import { Theme, Typography, CardContent } from '@mui/material';
import { makeStyles } from '@mui/styles';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { EmptyCardProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    flexDirection: 'column',
    textAlign: 'center',
  },
  text: {
    marginTop: theme.spacing(2),
    fontSize: '36px',
    lineHeight: '42px',
    fontWeight: 'bold',
    letterSpacing: '-0.02em',
  },
  subText: {
    fontSize: '18px',
    marginTop: theme.spacing(1),
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

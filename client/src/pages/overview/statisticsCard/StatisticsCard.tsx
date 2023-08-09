import {
  makeStyles,
  Theme,
  Typography,
  Card,
  CardContent,
} from '@material-ui/core';
import { FC } from 'react';
import { StatisticsCardProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: `grid`,
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    columnGap: theme.spacing(2),
  },
  label: {
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.attuDark.main,
  },
  value: {
    fontSize: '24px',
    lineHeight: '28px',
    fontWeight: 'bold',
  },
}));

const StatisticsCard: FC<StatisticsCardProps> = ({
  data = [],
  wrapperClass = '',
}) => {
  const classes = useStyles();

  return (
    <Card className={`card-wrapper ${wrapperClass}`}>
      <CardContent className={`${classes.wrapper}`}>
        {data.map(item => (
          <div key={item.label}>
            <Typography className={classes.label}>{item.label}</Typography>
            <Typography
              className={classes.value}
              style={{ color: item.valueColor }}
            >
              {item.value}
            </Typography>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;

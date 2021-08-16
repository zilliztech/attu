import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC } from 'react';
import { StatisticsCardProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: `grid`,
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    columnGap: '20px',

    padding: theme.spacing(3),
  },
  itemWrapper: {
    paddingLeft: theme.spacing(1),
    borderLeft: '3px solid #f0f4f9',
  },
  label: {
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.milvusDark.main,
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
    <div className={`card-wrapper ${classes.wrapper} ${wrapperClass}`}>
      {data.map(item => (
        <div key={item.label} className={classes.itemWrapper}>
          <Typography className={classes.label}>{item.label}</Typography>
          <Typography
            className={classes.value}
            style={{ color: item.valueColor }}
          >
            {item.value}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCard;

import { Theme } from '@mui/material';
import { Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: theme.spacing(2),
    paddingTop: 0,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
  },
  skeleton: {
    transform: 'scale(1)',
    background: `linear-gradient(90deg, ${theme.palette.divider} 0%, ${theme.palette.divider} 50%)`,
  },
  tr: {
    display: 'grid',
    gridTemplateColumns: '10% 89%',
    gap: '1%',
    marginTop: theme.spacing(3),
  },
}));

const LoadingTable = (props: { wrapperClass?: string; count: number }) => {
  const { wrapperClass = '', count } = props;
  const classes = getStyles();
  const rows = Array(count || 5).fill(1);

  return (
    <div className={`${classes.wrapper} ${wrapperClass}`}>
      {rows.map((row, index) => (
        <div key={index} className={classes.tr} role="skeleton">
          <Skeleton height={16} classes={{ root: classes.skeleton }} />
          <Skeleton height={16} classes={{ root: classes.skeleton }} />
        </div>
      ))}
    </div>
  );
};

export default LoadingTable;

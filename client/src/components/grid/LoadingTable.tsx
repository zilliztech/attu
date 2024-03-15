import { makeStyles, Theme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: theme.spacing(2),
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  skeleton: {
    transform: 'scale(1)',
    background: 'linear-gradient(90deg, #f0f4f9 0%, #f0f0f0 50%)',
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
  const rows = Array(count).fill(1);

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

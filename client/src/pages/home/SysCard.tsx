import { Theme, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  sysCard: {
    minWidth: 'auto',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    borderRadius: 8,
    '&:hover': {
      boxShadow: '0px 0px 4px 0px #00000029',
    },

    '& p': {
      fontSize: '24px',
      margin: 0,
    },
    '& h3': {
      margin: 0,
      fontSize: '14px',
      lineHeight: 1.5,
      color: theme.palette.text.secondary,
    },
    '& a': {
      textDecoration: 'none',
      color: theme.palette.text.primary,
    },
  },
}));

const SysCard = (data: {
  title: string;
  count: number | string;
  des?: string;
  link?: string;
}) => {
  const classes = useStyles();

  const content = (
    <>
      <Typography component={'p'}>{data.count}</Typography>
      <Typography component={'h3'}>{data.title}</Typography>
      {data.des ? <Typography component={'p'}>{data.des}</Typography> : null}
    </>
  );

  return (
    <section className={classes.sysCard}>
      <section>
        {data.link ? <Link to={data.link}>{content}</Link> : content}
      </section>
    </section>
  );
};

export default SysCard;

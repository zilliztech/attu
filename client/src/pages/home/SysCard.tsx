import { Theme, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const SysCard = (data: {
  title: string;
  count: number | string;
  des?: string;
  link?: string;
}) => {
  return (
    <Box
      sx={(theme: Theme) => ({
        minWidth: 'auto',
        gap: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0px 0px 4px 0px #00000029',
        },
        '& a': {
          textDecoration: 'none',
          color: theme.palette.text.primary,
        },
      })}
    >
      {data.link ? (
        <Link to={data.link} style={{ textDecoration: 'none' }}>
          <Typography component="p" sx={{ fontSize: 24, m: 0 }}>
            {data.count}
          </Typography>
          <Typography
            component="h3"
            sx={theme => ({
              m: 0,
              fontSize: 14,
              lineHeight: 1.5,
              color: theme.palette.text.secondary,
            })}
          >
            {data.title}
          </Typography>
          {data.des ? (
            <Typography component="p" sx={{ fontSize: 14, m: 0 }}>
              {data.des}
            </Typography>
          ) : null}
        </Link>
      ) : (
        <>
          <Typography component="p" sx={{ fontSize: 24, m: 0 }}>
            {data.count}
          </Typography>
          <Typography
            component="h3"
            sx={theme => ({
              m: 0,
              fontSize: 14,
              lineHeight: 1.5,
              color: theme.palette.text.secondary,
            })}
          >
            {data.title}
          </Typography>
          {data.des ? (
            <Typography component="p" sx={{ fontSize: 14, m: 0 }}>
              {data.des}
            </Typography>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default SysCard;

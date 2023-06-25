import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const getLabelDisplayedRows =
  (info: string) =>
  ({ from = 0, to = 0, count = 0 }) => {
    const { t: commonTrans } = useTranslation();
    const gridTrans = commonTrans('grid');
    return (
      <>
        <Typography variant="body2" component="span">
          {from} - {to}
        </Typography>
        <Typography variant="body2" className="rows" component="span">
          {gridTrans.of} {count} {gridTrans.results} {info}
        </Typography>
      </>
    );
  };

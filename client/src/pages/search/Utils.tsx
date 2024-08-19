import React from 'react';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export const getLabelDisplayedRows =
  (itemName: string = 'rows', info: string = '') =>
  ({ from = 0, to = 0, count = 0 }) => {
    const { t: commonTrans } = useTranslation();
    const gridTrans = commonTrans('grid');

    return (
      <>
        <Typography variant="body2" component="span">
          {from} - {to} &nbsp;
        </Typography>
        <Typography variant="body2" className="rows" component="span">
          {gridTrans.of} {count} {itemName} {info}
        </Typography>
      </>
    );
  };

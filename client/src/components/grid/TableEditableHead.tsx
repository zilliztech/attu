import { FC } from 'react';
import { TableEditableHeadType } from './Types';
import { TableHead, TableRow, TableCell, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  tableCell: {
    paddingLeft: theme.spacing(2),
  },
  tableHeader: {
    textTransform: 'capitalize',
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '12.8px',
  },
  tableRow: {
    // borderBottom: '1px solid rgba(0, 0, 0, 0.6);',
  },
}));

const EditableTableHead: FC<TableEditableHeadType> = props => {
  const { editHeads } = props;
  const classes = useStyles();

  return (
    <TableHead>
      <TableRow className={classes.tableRow}>
        {editHeads.map((headCell, index) => (
          <TableCell key={index} className={classes.tableCell}>
            {headCell.component}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default EditableTableHead;

import { FC } from 'react';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import type { TableEditableHeadType } from './Types';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  minHeight: 40,
  maxHeight: 60,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // borderBottom: '1px solid rgba(0, 0, 0, 0.6);',
}));

const EditableTableHead: FC<TableEditableHeadType> = props => {
  const { editHeads } = props;

  return (
    <TableHead>
      <StyledTableRow>
        {editHeads.map((headCell, index) => (
          <StyledTableCell key={index}>{headCell.component}</StyledTableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
};

export default EditableTableHead;

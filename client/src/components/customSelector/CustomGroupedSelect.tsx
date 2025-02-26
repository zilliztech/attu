import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { FC } from 'react';
import type { GroupOption, ICustomGroupSelect } from './Types';

const Wrapper = styled('div')({
  width: '100%',
});

const StyledFormControl = styled(FormControl)({
  width: '100%',
});

const GroupName = styled(ListSubheader)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  lineHeight: '32px',
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  fontSize: '12.8px',
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0, 4),
  lineHeight: '24px',

  '&:hover': {
    backgroundColor: 'rgba(18, 195, 244, 0.05)',
  },

  '&.Mui-selected': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
}));

const CustomGroupedSelect: FC<ICustomGroupSelect> = props => {
  const {
    options,
    className = '',
    haveLabel = true,
    label,
    placeholder = '',
    value,
    onChange,
  } = props;

  const renderSelectGroup = (option: GroupOption) => {
    const items = option.children.map(child => {
      return (
        <StyledMenuItem key={child.value} value={child.value}>
          {child.label}
        </StyledMenuItem>
      );
    });
    return [<GroupName key={option.label}>{option.label}</GroupName>, items];
  };

  return (
    <Wrapper className={className}>
      <StyledFormControl variant="filled">
        {haveLabel && <InputLabel htmlFor="grouped-select">{label}</InputLabel>}
        <Select
          displayEmpty={!haveLabel}
          value={value}
          id="grouped-select"
          placeholder={placeholder}
          onChange={onChange}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          {options.map(option => renderSelectGroup(option))}
        </Select>
      </StyledFormControl>
    </Wrapper>
  );
};

export default CustomGroupedSelect;

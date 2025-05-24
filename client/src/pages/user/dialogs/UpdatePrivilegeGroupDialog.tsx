import {
  Theme,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Box,
  styled,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FC, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { UserService } from '@/http';
import { CreatePrivilegeGroupParams } from '../Types';
import PrivilegeGroupOptions from './PrivilegeGroupOptions';
import { PrivilegeGroup } from '@server/types';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: 0,
  '&.Mui-expanded': {
    opacity: 1,
  },
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: 'none',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: '48px !important',
  '& .MuiAccordionSummary-content': {
    margin: 0,
    alignItems: 'center',
    position: 'relative',
    left: -10,
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  backgroundColor: theme.palette.background.light,
  borderTop: 'none',
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1, 0, 0.5),
}));

const DialogWrapper = styled(Box)(({ theme }) => ({
  maxWidth: theme.spacing(88),
}));

const CheckBoxWrapper = styled(Box)(({ theme }) => ({
  width: theme.spacing(24),
}));

const FormGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export interface CreatePrivilegeGroupProps {
  onUpdate: (data: {
    data: CreatePrivilegeGroupParams;
    isEditing: boolean;
  }) => void;
  handleClose: () => void;
  group?: PrivilegeGroup;
}

const UpdateRoleDialog: FC<CreatePrivilegeGroupProps> = ({
  onUpdate,
  handleClose,
  group = { group_name: '', privileges: [] },
}) => {
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const [rbacOptions, setRbacOptions] = useState<PrivilegeGroup[]>([]);

  const fetchRBAC = async () => {
    const rbacOptions = await UserService.getAllPrivilegeGroups();
    setRbacOptions(rbacOptions);
  };

  const isEditing = group.group_name !== '';

  useEffect(() => {
    fetchRBAC();
  }, []);

  const [form, setForm] = useState<CreatePrivilegeGroupParams>({
    group_name: group.group_name,
    privileges: group.privileges.map(p => p.name),
  });

  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const handleInputChange = (key: 'group_name', value: string) => {
    setForm(v => {
      const newFrom = { ...v, [key]: value };
      return newFrom;
    });
  };

  const createConfigs: ITextfieldConfig[] = [
    {
      label: userTrans('privilegeGroup'),
      key: 'group_name',
      onChange: (value: string) => handleInputChange('group_name', value),
      variant: 'filled',
      className: 'input',
      placeholder: userTrans('privilegeGroup'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: userTrans('privilegeGroup'),
          }),
        },
      ],
      defaultValue: form.group_name,
      disabled: isEditing,
    },
  ];

  const handleCreatePrivilegeGroup = async () => {
    // privileges is an array of strings, should be unique
    const newForm = {
      ...form,
      privileges: Array.from(new Set(form.privileges)),
    };

    if (!isEditing) {
      await UserService.createPrivilegeGroup(newForm);
    }

    await UserService.updatePrivilegeGroup(newForm);

    onUpdate({ data: newForm, isEditing: isEditing });
  };

  const onChange = (newSelection: any) => {
    setForm(v => {
      return { ...v, privileges: [...newSelection] };
    });
  };

  const handleSelectAll = (
    groupName: string,
    privileges: string[],
    isChecked: boolean
  ) => {
    const updatedPrivileges = isChecked
      ? [...form.privileges, ...privileges]
      : form.privileges.filter(p => !privileges.includes(p));

    onChange(updatedPrivileges);
  };

  const isGroupAllSelected = (groupName: string, privileges: string[]) => {
    return privileges.every(p => form.privileges.includes(p));
  };

  const isGroupPartialSelected = (groupName: string, privileges: string[]) => {
    return (
      privileges.some(p => form.privileges.includes(p)) &&
      !isGroupAllSelected(groupName, privileges)
    );
  };

  return (
    <DialogTemplate
      title={userTrans(
        isEditing ? 'updatePrivilegeGroupTitle' : 'createPrivilegeGroupTitle'
      )}
      handleClose={handleClose}
      confirmLabel={btnTrans(isEditing ? 'update' : 'create')}
      handleConfirm={handleCreatePrivilegeGroup}
      confirmDisabled={disabled}
      dialogClass="dialog-wrapper"
    >
      <>
        {createConfigs.map(v => (
          <CustomInput
            type="text"
            textConfig={v}
            checkValid={checkIsValid}
            validInfo={validation}
            key={v.label}
          />
        ))}
        <SubTitle variant="h5">
          {userTrans('privileges')}
        </SubTitle>

        {rbacOptions.map((grp, index) => {
          const groupPrivileges = grp.privileges.map(p => p.name);
          const isAllSelected = isGroupAllSelected(
            grp.group_name,
            groupPrivileges
          );
          const isPartialSelected = isGroupPartialSelected(
            grp.group_name,
            groupPrivileges
          );

          return (
            <StyledAccordion
              key={`${grp.group_name}-${index}`}
              elevation={0}
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${grp.group_name}-content`}
                id={`${grp.group_name}-header`}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.MuiCheckbox-root')) {
                    e.stopPropagation();
                  }
                }}
              >
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartialSelected}
                  onChange={e =>
                    handleSelectAll(
                      grp.group_name,
                      groupPrivileges,
                      e.target.checked
                    )
                  }
                  onClick={e => e.stopPropagation()}
                  className="privilege-checkbox"
                />
                <Typography>
                  {grp.group_name}(
                  {
                    new Set(
                      form.privileges.filter(p => groupPrivileges.includes(p))
                    ).size
                  }
                  /{new Set(groupPrivileges).size})
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <PrivilegeGroupOptions
                  options={groupPrivileges}
                  selection={form.privileges}
                  group_name={grp.group_name}
                  onChange={onChange}
                />
              </StyledAccordionDetails>
            </StyledAccordion>
          );
        })}
      </>
    </DialogTemplate>
  );
};

export default UpdateRoleDialog;

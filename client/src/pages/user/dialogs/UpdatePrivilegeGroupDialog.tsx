import {
  Theme,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
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
import { makeStyles } from '@mui/styles';
import { PrivilegeGroup } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(1, 0, 0.5),
  },
  dialogWrapper: {
    maxWidth: theme.spacing(88),
  },
  checkBox: {
    width: theme.spacing(24),
  },
  formGrp: {
    marginBottom: theme.spacing(2),
  },
  subTitle: {
    marginBottom: theme.spacing(0.5),
  },
  accordionSummary: {
    backgroundColor: theme.palette.background.default,
    '& .MuiAccordionSummary-content': {
      margin: 0,
      alignItems: 'center',
      position: 'relative',
      left: -10,
    },
  },
  accordionDetail: {
    backgroundColor: theme.palette.background.light,
  },
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
    const rbacOptions = await UserService.getRBAC();

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

  const classes = useStyles();

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
      className: classes.input,
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
      dialogClass={classes.dialogWrapper}
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
        <Typography variant="h5" component="h5" className={classes.subTitle}>
          {userTrans('privileges')}
        </Typography>

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
            <Accordion key={`${grp.group_name}-${index}`}>
              <AccordionSummary
                className={classes.accordionSummary}
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
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetail}>
                <PrivilegeGroupOptions
                  options={groupPrivileges}
                  selection={form.privileges}
                  group_name={grp.group_name}
                  onChange={onChange}
                />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </>
    </DialogTemplate>
  );
};

export default UpdateRoleDialog;

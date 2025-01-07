import { Theme, Typography } from '@mui/material';
import { FC, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { UserService } from '@/http';
import {
  CreatePrivilegeGroupParams,
  PrivilegeGrpOptionsProps,
  RBACOptions,
} from '../Types';
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
  const [rbacOptions, setRbacOptions] = useState<RBACOptions>({
    GlobalPrivileges: {},
    CollectionPrivileges: {},
    RbacObjects: {},
    UserPrivileges: {},
    Privileges: {},
  });

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
    if (!isEditing) {
      await UserService.createPrivilegeGroup(form);
    }

    await UserService.updatePrivilegeGroup(form);

    onUpdate({ data: form, isEditing: isEditing });
  };

  const onChange = (newSelection: any) => {
    setForm(v => {
      return { ...v, privileges: [...newSelection] };
    });
  };

  const optionGroups: PrivilegeGrpOptionsProps[] = [
    {
      options: Object.values(rbacOptions.GlobalPrivileges) as string[],
      object: 'Global',
      title: userTrans('objectGlobal'),
      selection: form.privileges,
      group_name: form.group_name,
      onChange: onChange,
    },

    {
      options: Object.values(rbacOptions.CollectionPrivileges) as string[],
      title: userTrans('objectCollection'),
      object: 'Collection',
      selection: form.privileges,
      group_name: form.group_name,
      onChange: onChange,
    },

    {
      options: Object.values(rbacOptions.UserPrivileges) as string[],
      title: userTrans('objectUser'),
      object: 'User',
      selection: form.privileges,
      group_name: form.group_name,
      onChange: onChange,
    },
  ];

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

        {optionGroups.map((o, index) => (
          <PrivilegeGroupOptions
            key={`${o.object}-${index}`}
            title={o.title}
            object={o.object}
            options={o.options}
            selection={o.selection}
            group_name={o.group_name}
            onChange={o.onChange}
          />
        ))}
      </>
    </DialogTemplate>
  );
};

export default UpdateRoleDialog;

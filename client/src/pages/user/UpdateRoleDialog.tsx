import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { UserHttp } from '@/http';
import {
  CreateRoleProps,
  CreateRoleParams,
  PrivilegeOptionsProps,
} from './Types';
import PrivilegeOptions from './PrivilegeOptions';

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

const UpdateRoleDialog: FC<CreateRoleProps> = ({
  onUpdate,
  handleClose,
  role = { name: '', privileges: [] },
}) => {
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const [rbacOptions, setRbacOptions] = useState({
    GlobalPrivileges: {},
    CollectionPrivileges: {},
    RbacObjects: {},
    UserPrivileges: {},
    Privileges: {},
  });

  const fetchRBAC = async () => {
    const rbacOptions = await UserHttp.getRBAC();

    setRbacOptions(rbacOptions);
  };

  const isEditing = role.name !== '';

  useEffect(() => {
    fetchRBAC();
  }, []);

  const [form, setForm] = useState<CreateRoleParams>({
    roleName: role.name,
    privileges: JSON.parse(JSON.stringify(role.privileges)),
  });

  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const classes = useStyles();

  const handleInputChange = (key: 'roleName', value: string) => {
    setForm(v => {
      const newFrom = { ...v, [key]: value };

      // update roleName
      newFrom.privileges.forEach(p => (p.roleName = value));

      return newFrom;
    });
  };

  const createConfigs: ITextfieldConfig[] = [
    {
      label: userTrans('role'),
      key: 'roleName',
      onChange: (value: string) => handleInputChange('roleName', value),
      variant: 'filled',
      className: classes.input,
      placeholder: userTrans('role'),
      fullWidth: true,
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: userTrans('role'),
          }),
        },
      ],
      defaultValue: form.roleName,
      disabled: isEditing,
    },
  ];

  const handleCreateRole = async () => {
    if (!isEditing) {
      await UserHttp.createRole(form);
    }

    await UserHttp.updateRolePrivileges(form);

    onUpdate({ data: form, isEditing: isEditing });
  };

  const onChange = (newSelection: any) => {
    setForm(v => ({ ...v, privileges: [...newSelection] }));
  };

  const optionGroups: PrivilegeOptionsProps[] = [
    {
      options: Object.values(rbacOptions.GlobalPrivileges) as string[],
      object: 'Global',
      title: userTrans('objectGlobal'),
      selection: form.privileges,
      roleName: form.roleName,
      onChange: onChange,
    },

    {
      options: Object.values(rbacOptions.CollectionPrivileges) as string[],
      title: userTrans('objectCollection'),
      object: 'Collection',
      selection: form.privileges,
      roleName: form.roleName,
      onChange: onChange,
    },

    {
      options: Object.values(rbacOptions.UserPrivileges) as string[],
      title: userTrans('objectUser'),
      object: 'User',
      selection: form.privileges,
      roleName: form.roleName,
      onChange: onChange,
    },
  ];

  return (
    <DialogTemplate
      title={userTrans(
        isEditing ? 'updateRolePrivilegeTitle' : 'createRoleTitle'
      )}
      handleClose={handleClose}
      confirmLabel={btnTrans(isEditing ? 'update' : 'create')}
      handleConfirm={handleCreateRole}
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

        {optionGroups.map(o => (
          <PrivilegeOptions
            key={o.object}
            title={o.title}
            object={o.object}
            options={o.options}
            selection={o.selection}
            roleName={o.roleName}
            onChange={o.onChange}
          />
        ))}
      </>
    </DialogTemplate>
  );
};

export default UpdateRoleDialog;

import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks/Form';
import { formatForm } from '@/utils/Form';
import { UserHttp } from '@/http/User';
import { CreateRoleProps, CreateRoleParams } from './Types';
import PrivilegeOptions from './PriviledgeOptions';

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

const CreateRoleDialog: FC<CreateRoleProps> = ({ onCreate, handleClose }) => {
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
    const roles = await UserHttp.getRoles();

    console.log(rbacOptions, roles);

    setRbacOptions(rbacOptions);
  };

  useEffect(() => {
    fetchRBAC();
  }, []);

  const [form, setForm] = useState<CreateRoleParams>({
    roleName: '',
    privileges: [],
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
    },
  ];

  const handleCreateRole = async () => {
    await UserHttp.createRole(form);
    await UserHttp.updateRolePrivileges(form);

    onCreate(form);
  };

  // prepare data
  const globalPriviledgeOptions = Object.values(
    rbacOptions.GlobalPrivileges
  ) as string[];
  const collectionPrivilegeOptions = Object.values(
    rbacOptions.CollectionPrivileges
  ) as string[];
  const userPrivilegeOptions = Object.values(
    rbacOptions.UserPrivileges
  ) as string[];

  return (
    <DialogTemplate
      title={userTrans('createRoleTitle')}
      handleClose={handleClose}
      confirmLabel={btnTrans('create')}
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

        <PrivilegeOptions
          title={userTrans('objectGlobal')}
          object="Global"
          options={globalPriviledgeOptions}
          selection={form.privileges}
          roleName={form.roleName}
          onChange={(newSelection: any) => {
            setForm(v => ({ ...v, privileges: [...newSelection] }));
          }}
        />

        <PrivilegeOptions
          title={userTrans('objectCollection')}
          object="Collection"
          options={collectionPrivilegeOptions}
          selection={form.privileges}
          roleName={form.roleName}
          onChange={(newSelection: any) => {
            setForm(v => ({ ...v, privileges: [...newSelection] }));
          }}
        />

        <PrivilegeOptions
          title={userTrans('objectUser')}
          object="User"
          options={userPrivilegeOptions}
          selection={form.privileges}
          roleName={form.roleName}
          onChange={(newSelection: any) => {
            setForm(v => ({ ...v, privileges: [...newSelection] }));
          }}
        />
      </>
    </DialogTemplate>
  );
};

export default CreateRoleDialog;

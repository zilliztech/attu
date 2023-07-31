import {
  makeStyles,
  Theme,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@material-ui/core';
import { FC, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks/Form';
import { formatForm } from '@/utils/Form';
import { UserHttp } from '@/http/User';
import { CreateRoleProps, CreateRoleParams, Privilege } from './Types';

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
  const { t: commonTrans } = useTranslation();
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
  const globalPriviledgeOptions = Object.values(rbacOptions.GlobalPrivileges);
  const collectionPrivilegeOptions = Object.values(
    rbacOptions.CollectionPrivileges
  );
  const userPrivilegeOptions = Object.values(rbacOptions.UserPrivileges);

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

        <Typography variant="h6" component="h6" className={classes.subTitle}>
          {userTrans('objectGlobal')}
        </Typography>

        <FormGroup row className={classes.formGrp}>
          {globalPriviledgeOptions.map((r: any, index: number) => (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    let newPivilegs = [...form.privileges];

                    if (!checked) {
                      newPivilegs = newPivilegs.filter(
                        (n: Privilege) => n.privilegeName !== r
                      );
                    } else {
                      newPivilegs.push({
                        privilegeName: r,
                        object: 'Global',
                        objectName: '*',
                        roleName: form.roleName,
                      });
                    }
                    console.log(newPivilegs);

                    setForm(v => ({ ...v, privileges: [...newPivilegs] }));
                  }}
                />
              }
              key={r}
              label={r}
              value={r}
              className={classes.checkBox}
            />
          ))}
        </FormGroup>

        <Typography variant="h6" component="h6" className={classes.subTitle}>
          {userTrans('objectCollection')}
        </Typography>

        <FormGroup row className={classes.formGrp}>
          {collectionPrivilegeOptions.map((r: any, index: number) => (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    let newPivilegs = [...form.privileges];

                    if (!checked) {
                      newPivilegs = newPivilegs.filter(
                        (n: Privilege) => n.privilegeName !== r
                      );
                    } else {
                      newPivilegs.push({
                        privilegeName: r,
                        object: 'Collection',
                        objectName: '*',
                        roleName: form.roleName,
                      });
                    }
                    console.log(newPivilegs);

                    setForm(v => ({ ...v, privileges: [...newPivilegs] }));
                  }}
                />
              }
              key={r}
              label={r}
              value={r}
              className={classes.checkBox}
            />
          ))}
        </FormGroup>

        <Typography variant="h6" component="h6" className={classes.subTitle}>
          {userTrans('objectUser')}
        </Typography>

        <FormGroup row className={classes.formGrp}>
          {userPrivilegeOptions.map((r: any, index: number) => (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    let newPivilegs = [...form.privileges];

                    if (!checked) {
                      newPivilegs = newPivilegs.filter(
                        (n: Privilege) => n.privilegeName !== r
                      );
                    } else {
                      newPivilegs.push({
                        privilegeName: r,
                        object: 'User',
                        objectName: '*',
                        roleName: form.roleName,
                      });
                    }

                    console.log(newPivilegs);

                    setForm(v => ({ ...v, privileges: [...newPivilegs] }));
                  }}
                />
              }
              key={r}
              label={r}
              value={r}
              className={classes.checkBox}
            />
          ))}
        </FormGroup>
      </>
    </DialogTemplate>
  );
};

export default CreateRoleDialog;

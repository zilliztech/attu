import { Theme } from '@mui/material';
import { FC, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { UserService, DatabaseService } from '@/http';
import { makeStyles } from '@mui/styles';
import DBCollectionSelector from './DBCollectionSelector';
import type { ITextfieldConfig } from '@/components/customInput/Types';
import type {
  CreateRoleProps,
  CreateRoleParams,
  RBACOptions,
  DBOption,
} from '../Types';
import type { DBCollectionsPrivileges } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: theme.spacing(1, 0, 0.5),
  },
  dialogWrapper: {
    width: '66vw',
    maxWidth: '66vw',
  },
  subTitle: {
    marginBottom: theme.spacing(0.5),
  },
}));

const DEFAULT_DB_Privileges: DBCollectionsPrivileges = {
  '*': {
    collections: {
      '*': {},
    },
  },
};

const UpdateRoleDialog: FC<CreateRoleProps> = props => {
  const {
    role = {
      roleName: '',
      privileges: DEFAULT_DB_Privileges,
    },
    handleClose,
    onUpdate,
  } = props;
  // i18n
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  // const
  const ALL_DB = { name: userTrans('allDatabases'), value: '*' };

  // UI states
  const [options, setOptions] = useState<{
    rbacOptions: RBACOptions; // Available RBAC options (privileges)
    dbOptions: DBOption[]; // Available databases
  }>({
    rbacOptions: {} as RBACOptions,
    dbOptions: [],
  });

  const [selected, setSelected] = useState<DBCollectionsPrivileges>(
    role.privileges
  );

  // Form state
  const [form, setForm] = useState<CreateRoleParams>({
    roleName: role.roleName,
    privileges: selected,
  });

  // update form if selected changes
  useEffect(() => {
    setForm(v => ({
      ...v,
      privileges: selected,
    }));
  }, [selected]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dbResponse, rbacResponse] = await Promise.all([
          DatabaseService.listDatabases(),
          UserService.getRBAC(),
        ]);

        const dbOptions = dbResponse.map(db => ({
          name: db.name,
          value: db.name,
        }));
        dbOptions.unshift(ALL_DB);

        setOptions({
          rbacOptions: rbacResponse,
          dbOptions,
        });
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  // Check if editing an existing role
  const isEditing = role.roleName !== '';

  // Form validation
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  // Handle input change
  const handleInputChange = (key: 'roleName', value: string) => {
    setForm(v => ({
      ...v,
      [key]: value,
    }));
  };

  // Handle create/update role
  const handleCreateRole = async () => {
    try {
      const res = await UserService.updateRolePrivileges(form);

      onUpdate({ data: form, isEditing });
    } catch (error) {
      console.error('Error creating/updating role:', error);
    }
  };

  // styles
  const classes = useStyles();

  // Input configurations
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

        <DBCollectionSelector
          selected={selected}
          setSelected={setSelected}
          options={options}
        />
      </>
    </DialogTemplate>
  );
};

export default UpdateRoleDialog;

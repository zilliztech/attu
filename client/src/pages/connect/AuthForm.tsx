import React, { useContext, useMemo, useState } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/customButton/CustomButton';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { MilvusService } from '@/http';
import { useNavigate } from 'react-router-dom';
import {
  rootContext,
  authContext,
  prometheusContext,
  dataContext,
} from '@/context';
import {
  MILVUS_CLIENT_ID,
  LOGIN_USERNAME,
  LAST_TIME_ADDRESS,
  MILVUS_URL,
  LAST_TIME_DATABASE,
  MILVUS_DATABASE,
} from '@/consts';
import { CustomRadio } from '@/components/customRadio/CustomRadio';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: theme.spacing(0, 3),
    position: 'relative',
  },
  titleWrapper: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    padding: theme.spacing(3, 0),
  },
  input: {
    margin: theme.spacing(0.5, 0, 0),
  },
  toggle: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-start',
  },
  star: {
    position: 'absolute',
    top: -48,
    right: -8,
    marginTop: theme.spacing(1),
    alignItems: 'center',
    height: '32px',
    lineHeight: '32px',
    color: '#333',
    background: '#f1f1f1',
    padding: theme.spacing(0.5, 0, 0.5, 1),
    fontSize: 13,
    display: 'block',
    width: '132px',
    textDecoration: 'none',
    marginRight: theme.spacing(1),
    fontWeight: 500,
    '&:hover': {
      fontWeight: 'bold',
    },
  },
  icon: {
    verticalAlign: '-5px',
    marginRight: theme.spacing(1),
  },
}));

export const AuthForm = (props: any) => {
  // styles
  const classes = useStyles();

  // context
  const { openSnackBar } = useContext(rootContext);
  const { setAddress, setUsername, setIsAuth, setClientId } =
    useContext(authContext);
  const { setDatabase } = useContext(dataContext);

  // i18n
  const { t: commonTrans } = useTranslation();
  const attuTrans = commonTrans('attu');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');
  // hooks
  const navigate = useNavigate();

  // UI states
  const [form, setForm] = useState({
    address: window.localStorage.getItem(LAST_TIME_ADDRESS) || MILVUS_URL,
    username: '',
    password: '',
    token: '',
    database:
      window.localStorage.getItem(LAST_TIME_DATABASE) || MILVUS_DATABASE,
  });
  const [withPass, setWithPass] = useState(false);

  // form validation
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid } = useFormValidation(checkedForm);

  // handle input change
  const handleInputChange = (
    key: 'address' | 'username' | 'password' | 'database' | 'token',
    value: string | boolean
  ) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  // const {
  //   withPrometheus,
  //   setWithPrometheus,
  //   prometheusAddress,
  //   prometheusInstance,
  //   prometheusNamespace,
  //   setPrometheusAddress,
  //   setPrometheusInstance,
  //   setPrometheusNamespace,
  // } = useContext(prometheusContext);

  // const prometheusConfigs: ITextfieldConfig[] = useMemo(
  //   () => [
  //     {
  //       label: `${attuTrans.prometheusAddress}`,
  //       key: 'prometheus_address',
  //       onChange: setPrometheusAddress,
  //       variant: 'filled',
  //       className: classes.input,
  //       placeholder: attuTrans.prometheusAddress,
  //       fullWidth: true,

  //       defaultValue: prometheusAddress,
  //     },
  //     {
  //       label: `${attuTrans.prometheusNamespace}`,
  //       key: 'prometheus_namespace',
  //       onChange: setPrometheusNamespace,
  //       variant: 'filled',
  //       className: classes.input,
  //       placeholder: attuTrans.prometheusNamespace,
  //       fullWidth: true,

  //       defaultValue: prometheusNamespace,
  //     },
  //     {
  //       label: `${attuTrans.prometheusInstance}`,
  //       key: 'prometheus_instance',
  //       onChange: setPrometheusInstance,
  //       variant: 'filled',
  //       className: classes.input,
  //       placeholder: attuTrans.prometheusInstance,
  //       fullWidth: true,

  //       defaultValue: prometheusInstance,
  //     },
  //   ],
  //   []
  // );

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('xx', form);

    const result = await MilvusService.connect(form);

    setIsAuth(true);
    setClientId(result.clientId);
    setAddress(form.address);
    setUsername(form.username);
    setDatabase(result.database);

    openSnackBar(successTrans('connect'));
    window.localStorage.setItem(MILVUS_CLIENT_ID, result.clientId);
    window.localStorage.setItem(LOGIN_USERNAME, form.username);
    // store address for next time using
    window.localStorage.setItem(LAST_TIME_ADDRESS, form.address);
    window.localStorage.setItem(LAST_TIME_DATABASE, result.database);

    // redirect to homepage
    navigate('/');
  };

  const btnDisabled = useMemo(() => {
    return form.address.trim().length === 0;
  }, [form.address]);

  const handleEnableAuth = (val: boolean) => {
    setWithPass(val);
  };

  return (
    <form onSubmit={handleConnect}>
      <section className={classes.wrapper}>
        <div className={classes.titleWrapper}>
          <Typography variant="h4" component="h4">
            {attuTrans.connectTitle}
          </Typography>
        </div>
        {/* address  */}
        <CustomInput
          type="text"
          textConfig={{
            label: attuTrans.address,
            key: 'address',
            onChange: (val: string) => handleInputChange('address', val),
            variant: 'filled',
            className: classes.input,
            placeholder: attuTrans.address,
            fullWidth: true,
            validations: [
              {
                rule: 'require',
                errorText: warningTrans('required', {
                  name: attuTrans.address,
                }),
              },
            ],
            defaultValue: form.address,
          }}
          checkValid={checkIsValid}
          validInfo={validation}
          key={attuTrans.address}
        />
        {/* db  */}
        <CustomInput
          type="text"
          textConfig={{
            label: `Milvus ${dbTrans('database')} ${attuTrans.optional}`,
            key: 'database',
            onChange: (value: string) => handleInputChange('database', value),
            variant: 'filled',
            className: classes.input,
            placeholder: dbTrans('database'),
            fullWidth: true,
            defaultValue: form.database,
          }}
          checkValid={checkIsValid}
          validInfo={validation}
          key={attuTrans.database}
        />

        {/* toggle auth */}
        <div className={classes.toggle}>
          <CustomRadio
            checked={withPass}
            label={attuTrans.authentication}
            handleChange={handleEnableAuth}
          />
        </div>

        {/* token  */}
        {withPass && (
          <>
            <CustomInput
              type="text"
              textConfig={{
                label: `${attuTrans.token} ${attuTrans.optional} `,
                key: 'token',
                onChange: (val: string) => handleInputChange('token', val),
                variant: 'filled',
                className: classes.input,
                placeholder: attuTrans.token,
                fullWidth: true,
                defaultValue: form.token,
              }}
              checkValid={checkIsValid}
              validInfo={validation}
              key={attuTrans.token}
            />

            {/* user  */}
            <CustomInput
              type="text"
              textConfig={{
                label: `${attuTrans.username} ${attuTrans.optional}`,
                key: 'username',
                onChange: (value: string) =>
                  handleInputChange('username', value),
                variant: 'filled',
                className: classes.input,
                placeholder: attuTrans.username,
                fullWidth: true,
                defaultValue: form.username,
              }}
              checkValid={checkIsValid}
              validInfo={validation}
              key={attuTrans.username}
            />

            {/* pass  */}
            <CustomInput
              type="text"
              textConfig={{
                label: `${attuTrans.password} ${attuTrans.optional}`,
                key: 'password',
                onChange: (value: string) =>
                  handleInputChange('password', value),
                variant: 'filled',
                className: classes.input,
                placeholder: attuTrans.password,
                fullWidth: true,
                type: 'password',

                defaultValue: form.username,
              }}
              checkValid={checkIsValid}
              validInfo={validation}
              key={attuTrans.password}
            />
          </>
        )}

        {/* <div className={classes.toggle}>
          <CustomRadio
            defaultChecked={withPrometheus}
            label={attuTrans.prometheus}
            handleChange={setWithPrometheus}
          />
        </div>
        {withPrometheus &&
          prometheusConfigs.map(v => (
            <CustomInput
              type="text"
              textConfig={v}
              checkValid={checkIsValid}
              validInfo={validation}
              key={v.label}
            />
          ))} */}

        <CustomButton type="submit" variant="contained" disabled={btnDisabled}>
          {btnTrans('connect')}
        </CustomButton>
      </section>
    </form>
  );
};

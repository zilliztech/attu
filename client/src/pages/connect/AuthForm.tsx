import React, { useContext, useMemo, useState } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/customButton/CustomButton';
import CustomInput from '@/components/customInput/CustomInput';
import icons from '@/components/icons/Icons';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { MilvusHttp } from '@/http';
import { useNavigate } from 'react-router-dom';
import { rootContext, authContext, prometheusContext } from '@/context';
import { MILVUS_ADDRESS, LAST_TIME_ADDRESS, MILVUS_URL } from '@/consts';
import { CustomRadio } from '@/components/customRadio/CustomRadio';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',

    padding: theme.spacing(0, 3),
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    margin: '0 auto',
    flexDirection: 'column',
    '& .title': {
      margin: 0,
      color: '#323232',
      fontWeight: 'bold',
    },
  },
  logo: {
    width: '42px',
    height: 'auto',
    marginBottom: theme.spacing(1),
    display: 'block',
  },
  input: {
    margin: theme.spacing(0.5, 0, 0),
  },
  sslWrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-start',
  },
}));
export const AuthForm = (props: any) => {
  const navigate = useNavigate();
  const classes = useStyles();

  const { openSnackBar } = useContext(rootContext);
  const { setAddress, setIsAuth } = useContext(authContext);

  const Logo = icons.zilliz;
  const { t: commonTrans } = useTranslation();
  const attuTrans = commonTrans('attu');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');

  const [form, setForm] = useState({
    address: window.localStorage.getItem(LAST_TIME_ADDRESS) || MILVUS_URL,
    username: '',
    password: '',
    database: '',
    ssl: false,
  });
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid } = useFormValidation(checkedForm);

  const handleInputChange = (
    key: 'address' | 'username' | 'password' | 'database' | 'ssl',
    value: string | boolean
  ) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const inputConfigs: ITextfieldConfig[] = useMemo(() => {
    const noAuthConfigs: ITextfieldConfig[] = [
      {
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
            errorText: warningTrans('required', { name: attuTrans.address }),
          },
        ],
        defaultValue: form.address,
      },
    ];
    return [
      ...noAuthConfigs,
      {
        label: `Milvus ${dbTrans('database')} ${attuTrans.optional}`,
        key: 'database',
        onChange: (value: string) => handleInputChange('database', value),
        variant: 'filled',
        className: classes.input,
        placeholder: dbTrans('database'),
        fullWidth: true,
        defaultValue: form.database,
      },
      {
        label: `Milvus ${attuTrans.username} ${attuTrans.optional}`,
        key: 'username',
        onChange: (value: string) => handleInputChange('username', value),
        variant: 'filled',
        className: classes.input,
        placeholder: attuTrans.username,
        fullWidth: true,
        defaultValue: form.username,
      },
      {
        label: `Milvus ${attuTrans.password} ${attuTrans.optional}`,
        key: 'password',
        onChange: (value: string) => handleInputChange('password', value),
        variant: 'filled',
        className: classes.input,
        placeholder: attuTrans.password,
        fullWidth: true,
        type: 'password',

        defaultValue: form.username,
      },
    ];
  }, [form, attuTrans, warningTrans, classes.input]);

  const {
    withPrometheus,
    setWithPrometheus,
    prometheusAddress,
    prometheusInstance,
    prometheusNamespace,
    setPrometheusAddress,
    setPrometheusInstance,
    setPrometheusNamespace,
  } = useContext(prometheusContext);

  const prometheusConfigs: ITextfieldConfig[] = useMemo(
    () => [
      {
        label: `${attuTrans.prometheusAddress}`,
        key: 'prometheus_address',
        onChange: setPrometheusAddress,
        variant: 'filled',
        className: classes.input,
        placeholder: attuTrans.prometheusAddress,
        fullWidth: true,

        defaultValue: prometheusAddress,
      },
      {
        label: `${attuTrans.prometheusNamespace}`,
        key: 'prometheus_namespace',
        onChange: setPrometheusNamespace,
        variant: 'filled',
        className: classes.input,
        placeholder: attuTrans.prometheusNamespace,
        fullWidth: true,

        defaultValue: prometheusNamespace,
      },
      {
        label: `${attuTrans.prometheusInstance}`,
        key: 'prometheus_instance',
        onChange: setPrometheusInstance,
        variant: 'filled',
        className: classes.input,
        placeholder: attuTrans.prometheusInstance,
        fullWidth: true,

        defaultValue: prometheusInstance,
      },
    ],
    []
  );

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();
    const address = form.address;
    const data = { ...form, address };
    const d = await MilvusHttp.connect(data);

    console.log(111, d, data)

    setIsAuth(true);
    setAddress(address);

    openSnackBar(successTrans('connect'));
    window.localStorage.setItem(MILVUS_ADDRESS, address);
    // store address for next time using
    window.localStorage.setItem(LAST_TIME_ADDRESS, address);
    navigate('/');
  };

  const btnDisabled = useMemo(() => {
    return form.address.trim().length === 0;
  }, [form.address]);

  return (
    <form onSubmit={handleConnect}>
      <section className={classes.wrapper}>
        <div className={classes.titleWrapper}>
          <Logo classes={{ root: classes.logo }} />
          <Typography variant="h2" className="title">
            {attuTrans.admin}
          </Typography>
        </div>
        {inputConfigs.map(v => (
          <CustomInput
            type="text"
            textConfig={v}
            checkValid={checkIsValid}
            validInfo={validation}
            key={v.label}
          />
        ))}
        <div className={classes.sslWrapper}>
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
          ))}
        <CustomButton type="submit" variant="contained" disabled={btnDisabled}>
          {btnTrans('connect')}
        </CustomButton>
      </section>
    </form>
  );
};

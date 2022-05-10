import React, { useContext, useMemo, useState } from 'react';

import { makeStyles, Theme, Typography } from '@material-ui/core';
import CustomButton from '../../components/customButton/CustomButton';
import CustomInput from '../../components/customInput/CustomInput';
import icons from '../../components/icons/Icons';
import { useTranslation } from 'react-i18next';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import { MilvusHttp } from '../../http/Milvus';
import { formatAddress } from '../../utils/Format';
import { useHistory } from 'react-router-dom';
import { rootContext } from '../../context/Root';
import { authContext } from '../../context/Auth';
import { MILVUS_ADDRESS } from '../../consts/Localstorage';
import { CODE_STATUS } from '../../consts/Http';
import { MILVUS_URL } from '../../consts/Milvus';
import { CustomRadio } from '../../components/customRadio/CustomRadio';

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

    '& .title': {
      margin: 0,
      color: '#323232',
      fontWeight: 'bold',
    },
  },
  logo: {
    width: '42px',
    height: 'auto',
  },
  input: {
    margin: theme.spacing(3, 0, 0.5),
  },
  sslWrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-start',
  },
}));
export const AuthForm = (props: any) => {
  const history = useHistory();
  const classes = useStyles();

  const { openSnackBar } = useContext(rootContext);
  const { setAddress, setIsAuth } = useContext(authContext);

  const Logo = icons.zilliz;
  const { t: commonTrans } = useTranslation();
  const attuTrans = commonTrans('attu');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { t: successTrans } = useTranslation('success');

  const [showAuthForm, setShowAuthForm] = useState(false);
  const [form, setForm] = useState({
    address: MILVUS_URL,
    username: '',
    password: '',
    ssl: false,
  });
  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const handleInputChange = (
    key: 'address' | 'username' | 'password' | 'ssl',
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
    return showAuthForm
      ? [
          ...noAuthConfigs,
          {
            label: attuTrans.username,
            key: 'username',
            onChange: (value: string) => handleInputChange('username', value),
            variant: 'filled',
            className: classes.input,
            placeholder: attuTrans.username,
            fullWidth: true,
            validations: [
              {
                rule: 'require',
                errorText: warningTrans('required', {
                  name: attuTrans.username,
                }),
              },
            ],
            defaultValue: form.username,
          },
          {
            label: attuTrans.password,
            key: 'password',
            onChange: (value: string) => handleInputChange('password', value),
            variant: 'filled',
            className: classes.input,
            placeholder: attuTrans.password,
            fullWidth: true,
            type: 'password',
            validations: [
              {
                rule: 'require',
                errorText: warningTrans('required', {
                  name: attuTrans.password,
                }),
              },
            ],
            defaultValue: form.username,
          },
        ]
      : noAuthConfigs;
  }, [form, attuTrans, warningTrans, classes.input, showAuthForm]);

  const handleConnect = async () => {
    const address = formatAddress(form.address);
    try {
      const data = showAuthForm ? { ...form, address } : { address };
      await MilvusHttp.connect(data);
      setIsAuth(true);
      setAddress(address);

      openSnackBar(successTrans('connect'));
      window.localStorage.setItem(MILVUS_ADDRESS, address);
      history.push('/');
    } catch (error: any) {
      if (error?.response?.status === CODE_STATUS.UNAUTHORIZED) {
        showAuthForm
          ? openSnackBar(attuTrans.unAuth, 'error')
          : setShowAuthForm(true);
      }
    }
  };

  const btnDisabled = useMemo(() => {
    return showAuthForm ? disabled : form.address.trim().length === 0;
  }, [showAuthForm, disabled, form.address]);

  return (
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
          label={attuTrans.ssl}
          handleChange={(val: boolean) => handleInputChange('ssl', val)}
        />
      </div>
      <CustomButton
        variant="contained"
        disabled={btnDisabled}
        onClick={handleConnect}
      >
        {btnTrans('connect')}
      </CustomButton>
    </section>
  );
};

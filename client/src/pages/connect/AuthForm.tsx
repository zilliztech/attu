import React, { useContext, useMemo, useState } from 'react';
import { makeStyles, Theme, Typography, Menu } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/customButton/CustomButton';
import CustomInput from '@/components/customInput/CustomInput';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { rootContext, authContext, dataContext } from '@/context';
import { MILVUS_CLIENT_ID } from '@/consts';
import { CustomRadio } from '@/components/customRadio/CustomRadio';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import ConnectHistory from './ConnectHistory';
import CustomIconButton from '@/components/customButton/CustomIconButton';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0, 3),
    position: 'relative',
  },
  titleWrapper: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    padding: theme.spacing(3, 0),
    '& svg': {
      fontSize: 15,
      marginLeft: theme.spacing(0.5),
    },
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
  menu: {
    '& ul': {
      padding: '0',
      maxHeight: '400px',
      overflowY: 'auto',
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
  const { authReq, setAuthReq, login } = useContext(authContext);
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
  const [withPass, setWithPass] = useState(authReq.username.length > 0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // form validation
  const checkedForm = useMemo(() => {
    return formatForm(authReq);
  }, [authReq]);
  const { validation, checkIsValid } = useFormValidation(checkedForm);

  // handle input change
  const handleInputChange = (
    key: 'address' | 'username' | 'password' | 'database' | 'token',
    value: string | boolean
  ) => {
    setAuthReq(v => ({ ...v, [key]: value }));
  };

  // UI handlers
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  //
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // handle auth toggle
  const handleEnableAuth = (val: boolean) => {
    setWithPass(val);
  };

  // connect
  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // login
      const result = await login(authReq);

      // set database
      setDatabase(authReq.database);
      // success message
      openSnackBar(successTrans('connect'));
      // save clientId to local storage
      window.localStorage.setItem(MILVUS_CLIENT_ID, result.clientId);

      // redirect to homepage
      navigate('/');
    } catch (error: any) {
      // if not authorized, show auth inputs
      if (error.response.data.message.includes('UNAUTHENTICATED')) {
        handleEnableAuth(true);
      }
    }
  };

  // connect history clicked
  const onConnectHistoryClicked = (connection: any) => {
    console.log('connection', connection);
    handleMenuClose();
  };

  // is button should be disabled
  const btnDisabled = useMemo(() => {
    return authReq.address.trim().length === 0;
  }, [authReq.address]);

  return (
    <form onSubmit={handleConnect}>
      <section className={classes.wrapper}>
        <div className={classes.titleWrapper}>
          <Typography variant="h4" component="h4">
            {attuTrans.connectTitle}
            <CustomToolTip title={attuTrans.connectionTip}>
              <Icons.info />
            </CustomToolTip>
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
            InputProps: {
              endAdornment: (
                <CustomIconButton onClick={handleClick}>
                  <Icons.dropdown />
                </CustomIconButton>
              ),
            },
            validations: [
              {
                rule: 'require',
                errorText: warningTrans('required', {
                  name: attuTrans.address,
                }),
              },
            ],
            defaultValue: authReq.address,
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
            defaultValue: authReq.database,
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
                defaultValue: authReq.token,
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
                defaultValue: authReq.username,
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
                defaultValue: authReq.password,
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

      <Menu
        anchorEl={anchorEl}
        keepMounted
        className={classes.menu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        getContentAnchorEl={null}
      >
        <ConnectHistory
          data={{
            url: 'http://102.232.234.234:19121',
            database: 'default',
            time: '2021-09-09 12:00:00',
          }}
          onClick={onConnectHistoryClicked}
        />
        <ConnectHistory
          data={{
            url: 'http://102.232.234.234:19121',
            database: 'default2',
            time: '2021-09-09 12:00:00',
          }}
          onClick={onConnectHistoryClicked}
        />
      </Menu>
    </form>
  );
};

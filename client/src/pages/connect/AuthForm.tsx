import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Typography, Menu } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/customButton/CustomButton';
import CustomInput from '@/components/customInput/CustomInput';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { rootContext, authContext, dataContext } from '@/context';
import { MILVUS_CLIENT_ID, ATTU_AUTH_HISTORY } from '@/consts';
import { CustomRadio } from '@/components/customRadio/CustomRadio';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import { useStyles } from './style';

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
  const [connections, setConnections] = useState<any[]>([]);

  // form validation
  const checkedForm = useMemo(() => {
    return formatForm(authReq);
  }, [authReq]);
  const { validation, checkIsValid } = useFormValidation(checkedForm);

  // UI handlers
  // handle input change
  const handleInputChange = (
    key: 'address' | 'username' | 'password' | 'database' | 'token',
    value: string | boolean
  ) => {
    setAuthReq(v => ({ ...v, [key]: value }));
  };
  // handle menu clicked
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // handle auth toggle
  const handleEnableAuth = (val: boolean) => {
    setWithPass(val);
  };

  // handle connect
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
      // save connection to local storage
      const history = JSON.parse(
        window.localStorage.getItem(ATTU_AUTH_HISTORY) || '[]'
      );

      // add new connection to history, filter out the same connection
      const newHistory = [
        ...history.filter(
          (item: any) =>
            item.url !== authReq.address || item.database !== authReq.database
        ),
        {
          url: authReq.address,
          database: authReq.database,
          time: new Date().toLocaleString(),
        },
      ];

      // save to local storage
      window.localStorage.setItem(
        ATTU_AUTH_HISTORY,
        JSON.stringify(newHistory)
      );

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

  // load connection from localstorage
  useEffect(() => {
    const connections = JSON.parse(
      window.localStorage.getItem(ATTU_AUTH_HISTORY) ||
        '[{"url":"http://127.0.0.1:19530","database":"default","time":"--"}]'
    );
    setConnections(connections);
  }, []);

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
                <CustomIconButton onClick={handleMenuClick}>
                  <Icons.link />
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
        {connections.map((connection, index) => (
          <li
            key={index}
            className={classes.connection}
            onClick={() => {
              onConnectHistoryClicked(connection);
            }}
          >
            <div className="url">
              <Icons.link className="icon"></Icons.link>
              <div className="text">
                {connection.url}/{connection.database}
              </div>
            </div>
            <div className="time">{connection.time}</div>
          </li>
        ))}
      </Menu>
    </form>
  );
};

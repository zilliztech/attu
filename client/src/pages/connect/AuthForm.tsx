import React, { useContext, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Checkbox from '@mui/material/Checkbox';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/customButton/CustomButton';
import CustomInput from '@/components/customInput/CustomInput';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { rootContext, authContext, dataContext } from '@/context';
import { ATTU_AUTH_HISTORY, MILVUS_DATABASE, MILVUS_URL } from '@/consts';
import { CustomRadio } from '@/components/customRadio/CustomRadio';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import type { AuthReq } from '@server/types';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material';

// Add Connection type definition back
type Connection = AuthReq & {
  time: number;
};

const DEFAULT_CONNECTION = {
  address: MILVUS_URL || '127.0.0.1:19530',
  database: MILVUS_DATABASE,
  token: '',
  username: '',
  password: '',
  ssl: false,
  checkHealth: true,
  time: -1,
  clientId: '',
};

export const AuthForm = () => {
  // styles
  // const classes = useStyles(); // Removed useStyles

  // context
  const { openSnackBar } = useContext(rootContext);
  const { authReq, setAuthReq, login } = useContext(authContext);
  const { setDatabase } = useContext(dataContext);

  // i18n
  const { t: commonTrans } = useTranslation();
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');
  // hooks
  const navigate = useNavigate();

  // UI states
  const [withPass, setWithPass] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // form validation
  const checkedForm = useMemo(() => {
    return formatForm(authReq);
  }, [authReq]);
  const { validation, checkIsValid, resetValidation } =
    useFormValidation(checkedForm);

  // UI handlers
  // handle input change
  const handleInputChange = (
    key:
      | 'address'
      | 'username'
      | 'password'
      | 'ssl'
      | 'database'
      | 'token'
      | 'checkHealth',
    value: string | boolean
  ) => {
    // set database to default if empty
    // if (key === 'database' && value === '') {
    //   value = MILVUS_DATABASE;
    // }
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

    // set connecting
    setIsConnecting(true);

    try {
      // login
      const loginParams = { ...authReq };

      if (!withPass) {
        loginParams.username = '';
        loginParams.password = '';
        loginParams.token = '';
      }
      await login(loginParams);

      // set database
      setDatabase(authReq.database);
      // success message
      openSnackBar(successTrans('connect'));

      // get connection history
      const history = JSON.parse(
        window.localStorage.getItem(ATTU_AUTH_HISTORY) || '[]'
      );

      // add new connection to history, filter out the same connection
      const newHistory = [
        ...history.filter(
          (item: any) =>
            item.address !== authReq.address ||
            item.database !== authReq.database
        ),
        {
          address: authReq.address,
          database: authReq.database,
          username: authReq.username,
          password: authReq.password,
          token: authReq.token,
          time: Date.now(),
          checkHealth: authReq.checkHealth,
        },
      ];

      // if the count of history connections are more than 16, remove the first one, but it should keep the default one
      if (newHistory.length > 16) {
        newHistory.shift();
      }

      // save to local storage
      window.localStorage.setItem(
        ATTU_AUTH_HISTORY,
        JSON.stringify(newHistory)
      );

      // set title
      document.title = authReq.address ? `${authReq.address} - Attu` : 'Attu';

      // redirect to homepage
      navigate('/');
    } catch (error: any) {
      // if not authorized, show auth inputs
      if (error.response.data.message.includes('UNAUTHENTICATED')) {
        handleEnableAuth(true);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // connect history clicked
  const handleClickOnHisotry = (connection: Connection) => {
    // set auth request
    setAuthReq(connection);
    // close menu
    handleMenuClose();
  };

  const handleDeleteConnection = (connection: Connection) => {
    const history = JSON.parse(
      window.localStorage.getItem(ATTU_AUTH_HISTORY) || '[]'
    ) as Connection[];

    const newHistory = history.filter(
      item =>
        item.address !== connection.address ||
        item.database !== connection.database
    );

    if (newHistory.length === 0) {
      newHistory.push(DEFAULT_CONNECTION);
    }

    // save to local storage
    window.localStorage.setItem(ATTU_AUTH_HISTORY, JSON.stringify(newHistory));
    // sort by time
    newHistory.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
    setConnections(newHistory);
  };

  // is button should be disabled
  const btnDisabled = authReq.address.trim().length === 0 || isConnecting;

  // load connection from local storage
  useEffect(() => {
    const connections: Connection[] = JSON.parse(
      window.localStorage.getItem(ATTU_AUTH_HISTORY) || '[]'
    );

    if (connections.length === 0) {
      connections.push(DEFAULT_CONNECTION);
    }

    // sort by time
    connections.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    setConnections(connections);
  }, []);

  // UI effect
  useEffect(() => {
    // if address contains zilliz, or username or password is not empty
    //  set withpass to true
    const withPass =
      (authReq.address.length > 0 && authReq.address.includes('zilliz')) ||
      authReq.username.length > 0 ||
      authReq.password.length > 0;

    // set with pass
    setWithPass(withPass);
    // reset form
    resetValidation(formatForm(authReq));
  }, [authReq.address, authReq.username, authReq.password]);

  return (
    <form onSubmit={handleConnect}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: (theme: Theme) => theme.spacing(0, 3),
          position: 'relative',
        }}
      >
        <Box
          sx={{
            textAlign: 'left',
            alignSelf: 'flex-start',
            padding: (theme: Theme) => theme.spacing(3, 0),
            '& svg': {
              fontSize: 15,
              marginLeft: (theme: Theme) => theme.spacing(0.5),
            },
          }}
        >
          <Typography variant="h4" component="h4">
            {commonTrans('attu.connectTitle')}
            <CustomToolTip title={commonTrans('attu.connectionTip')}>
              <Icons.info />
            </CustomToolTip>
          </Typography>
        </Box>

        {/* address  */}
        <CustomInput
          type="text"
          textConfig={{
            label: commonTrans('attu.address'),
            key: 'address',
            onChange: (val: string) =>
              handleInputChange('address', String(val)),
            variant: 'filled',
            sx: {
              margin: (theme: Theme) => theme.spacing(0.5, 0, 0),
              '& .MuiFilledInput-adornedEnd': {
                paddingRight: 0,
              },
            },
            placeholder: commonTrans('attu.address'),
            fullWidth: true,
            InputProps: {
              endAdornment: (
                <CustomIconButton
                  sx={{
                    display: 'flex',
                    paddingLeft: 1,
                    paddingRight: 1,
                    fontSize: 14,
                    '& button': {
                      width: 36,
                      height: 36,
                    },
                  }}
                  onClick={handleMenuClick}
                >
                  <Icons.link />
                </CustomIconButton>
              ),
            },
            validations: [
              {
                rule: 'require',
                errorText: warningTrans('required', {
                  name: commonTrans('attu.address'),
                }),
              },
            ],
            value: authReq.address,
          }}
          checkValid={checkIsValid}
          validInfo={validation}
          key={commonTrans('attu.address')}
        />

        {/* db  */}
        <CustomInput
          type="text"
          textConfig={{
            label: `Milvus ${dbTrans('database')} ${commonTrans('attu.optional')}`,
            key: 'database',
            onChange: (value: string) => handleInputChange('database', value),
            variant: 'filled',
            sx: {
              margin: (theme: Theme) => theme.spacing(0.5, 0, 0),
              '& .MuiFilledInput-adornedEnd': {
                paddingRight: 0,
              },
            },
            placeholder: dbTrans('database'),
            fullWidth: true,
            value: authReq.database,
          }}
          checkValid={checkIsValid}
          validInfo={validation}
          key={commonTrans('attu.database')}
        />

        {/* toggle auth */}
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-start',
          }}
        >
          <CustomRadio
            checked={withPass}
            label={commonTrans('attu.authentication')}
            handleChange={handleEnableAuth}
          />
        </Box>

        {/* token  */}
        {withPass && (
          <>
            <CustomInput
              type="text"
              textConfig={{
                label: `${commonTrans('attu.token')} ${commonTrans('attu.optional')} `,
                key: 'token',
                onChange: (val: string) => handleInputChange('token', val),
                variant: 'filled',
                sx: {
                  margin: (theme: Theme) => theme.spacing(0.5, 0, 0),
                  '& .MuiFilledInput-adornedEnd': {
                    paddingRight: 0,
                  },
                },
                placeholder: commonTrans('attu.token'),
                fullWidth: true,
                value: authReq.token,
              }}
              checkValid={checkIsValid}
              validInfo={validation}
              key={commonTrans('attu.token')}
            />
            {/* user  */}
            <CustomInput
              type="text"
              textConfig={{
                label: `${commonTrans('attu.username')} ${commonTrans('attu.optional')}`,
                key: 'username',
                onChange: (value: string) =>
                  handleInputChange('username', value),
                variant: 'filled',
                sx: {
                  margin: (theme: Theme) => theme.spacing(0.5, 0, 0),
                  '& .MuiFilledInput-adornedEnd': {
                    paddingRight: 0,
                  },
                },
                placeholder: commonTrans('attu.username'),
                fullWidth: true,
                value: authReq.username,
              }}
              checkValid={checkIsValid}
              validInfo={validation}
              key={commonTrans('attu.username')}
            />
            {/* pass  */}
            <CustomInput
              type="text"
              textConfig={{
                label: `${commonTrans('attu.password')} ${commonTrans('attu.optional')}`,
                key: 'password',
                onChange: (value: string) =>
                  handleInputChange('password', value),
                variant: 'filled',
                sx: {
                  margin: (theme: Theme) => theme.spacing(0.5, 0, 0),
                  '& .MuiFilledInput-adornedEnd': {
                    paddingRight: 0,
                  },
                },
                placeholder: commonTrans('attu.password'),
                fullWidth: true,
                type: 'password',
                value: authReq.password,
              }}
              checkValid={checkIsValid}
              validInfo={validation}
              key={commonTrans('attu.password')}
            />
          </>
        )}

        {/* SSL toggle */}
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-start',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={authReq.ssl}
                onChange={e => handleInputChange('ssl', e.target.checked)}
              />
            }
            label={commonTrans('attu.ssl')}
          />
        </Box>

        <CustomButton type="submit" variant="contained" disabled={btnDisabled}>
          {btnTrans(isConnecting ? 'connecting' : 'connect')}
        </CustomButton>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 4,
            '& .MuiCheckbox-root': {
              margin: 0,
              padding: '8px 4px 8px 0',
            },
            '& span': {
              cursor: 'pointer',
              fontSize: 12,
              fontStyle: 'italic',
            },
          }}
        >
          <label>
            <Checkbox
              size="small"
              checked={authReq.checkHealth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleInputChange('checkHealth', e.target.checked);
              }}
            />
            <Typography component="span">
              {commonTrans('attu.checkHealth')}
            </Typography>
          </label>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        sx={{
          // Added sx prop
          '& ul': {
            padding: 0,
            maxHeight: '400px',
            overflowY: 'auto',
          },
        }}
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
      >
        {connections.map((connection, index) => (
          <Box
            component="li"
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              width: 380,
              padding: `0 8px`,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: (theme: Theme) => theme.palette.action.hover,
              },
              '& .address': {
                display: 'grid',
                gridTemplateColumns: '24px 1fr',
                gap: 4,
                color: (theme: Theme) => theme.palette.text.primary,
                fontSize: '14px',
                padding: '12px 0',
                '& .text': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: 200,
                  wordWrap: 'break-word',
                },
              },
              '& .icon': {
                verticalAlign: '-3px',
                marginRight: 8,
                fontSize: '14px',
              },
              '& .time': {
                color: (theme: Theme) => theme.palette.text.secondary,
                fontSize: 11,
                lineHeight: 1.5,
                padding: '12px 0',
                width: 130,
                fontStyle: 'italic',
              },
              '& .deleteIconBtn': {
                padding: '8px 0',
                '& svg': {
                  fontSize: '14px',
                },
                height: 16,
                lineHeight: '16px',
                margin: 0,
              },
            }}
            onClick={() => {
              handleClickOnHisotry(connection);
            }}
          >
            <div className="address">
              <Icons.link
                // className="icon" // Removed className
                sx={{
                  // Added sx prop
                  verticalAlign: '-5px',
                  marginRight: (theme: Theme) => theme.spacing(1),
                }}
              ></Icons.link>
              <div className="text">
                {connection.address}/{connection.database}
              </div>
            </div>
            <div className="time">
              {connection.time !== -1
                ? new Date(connection.time).toLocaleString()
                : '--'}
            </div>

            <div>
              {connection.time !== -1 && (
                <CustomIconButton
                  className="deleteIconBtn"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteConnection(connection);
                  }}
                >
                  <Icons.cross></Icons.cross>
                </CustomIconButton>
              )}
            </div>
          </Box>
        ))}
      </Menu>
    </form>
  );
};

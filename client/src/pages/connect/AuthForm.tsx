import React, { useContext, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

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
  // context
  const { openSnackBar } = useContext(rootContext);
  const { authReq, setAuthReq, login } = useContext(authContext);
  const { setDatabase } = useContext(dataContext);

  // i18n
  const { t: commonTrans } = useTranslation();
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');

  // hooks
  const navigate = useNavigate();

  // UI states
  const [withPass, setWithPass] = useState(false);
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
    if (key === 'address' && typeof value === 'string') {
      // Check if address contains database name (format: address/database)
      const parts = value.split('/');
      if (parts.length === 2) {
        setAuthReq(v => ({
          ...v,
          address: parts[0],
          database: parts[1],
        }));
        return;
      }
    }
    setAuthReq(v => ({ ...v, [key]: value }));
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
          height: '100%',
        }}
      >
        <Box
          sx={{
            textAlign: 'left',
            alignSelf: 'flex-start',
            padding: (theme: Theme) => theme.spacing(2, 0, 1.5),
            '& svg': {
              fontSize: 16,
              marginLeft: (theme: Theme) => theme.spacing(0.5),
              color: 'primary.main',
            },
          }}
        >
          <Typography
            variant="h4"
            component="h4"
            sx={{
              fontSize: 20,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {commonTrans('attu.connectTitle')}
            <CustomToolTip title={commonTrans('attu.connectionTip')}>
              <Icons.info />
            </CustomToolTip>
          </Typography>
        </Box>

        {/* Replace address input with Autocomplete */}
        <Autocomplete
          freeSolo
          options={connections}
          getOptionLabel={option =>
            typeof option === 'string'
              ? option
              : `${option.address}/${option.database}`
          }
          value={authReq.address}
          onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
              handleInputChange('address', newValue);
            } else if (newValue) {
              handleClickOnHisotry(newValue);
            }
          }}
          onInputChange={(event, newInputValue) => {
            handleInputChange('address', newInputValue);
          }}
          renderInput={params => (
            <TextField
              {...params}
              label={commonTrans('attu.address')}
              variant="filled"
              required
              error={validation.address?.result}
              helperText={validation.address?.errText}
              sx={{
                margin: (theme: Theme) => theme.spacing(0.5, 0),
                '& .MuiFilledInput-root': {
                  backgroundColor: 'background.default',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'background.default',
                  },
                },
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: (theme: Theme) => theme.palette.action.hover,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.link sx={{ fontSize: 16 }} />
                <Typography>
                  {option.address}/{option.database}
                </Typography>
              </Box>
              {option.time !== -1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                    }}
                  >
                    {new Date(option.time).toLocaleString()}
                  </Typography>
                  <CustomIconButton
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteConnection(option);
                    }}
                    sx={{ padding: '4px' }}
                  >
                    <Icons.cross sx={{ fontSize: 14 }} />
                  </CustomIconButton>
                </Box>
              )}
            </Box>
          )}
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
              margin: (theme: Theme) => theme.spacing(0.5, 0),
              '& .MuiFilledInput-root': {
                backgroundColor: 'background.default',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&.Mui-focused': {
                  backgroundColor: 'background.default',
                },
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
            marginTop: (theme: Theme) => theme.spacing(1),
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
                  margin: (theme: Theme) => theme.spacing(0.5, 0),
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'background.default',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.default',
                    },
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
                  margin: (theme: Theme) => theme.spacing(0.5, 0),
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'background.default',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.default',
                    },
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
                  margin: (theme: Theme) => theme.spacing(0.5, 0),
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'background.default',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.default',
                    },
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

        <Box
          sx={{
            marginTop: 'auto',
            padding: (theme: Theme) => theme.spacing(2, 0),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: (theme: Theme) => theme.spacing(2),
            }}
          >
            <CustomButton
              type="submit"
              variant="contained"
              disabled={btnDisabled}
              sx={{
                height: 36,
                fontSize: 14,
                fontWeight: 500,
                flex: 1,
              }}
            >
              {btnTrans(isConnecting ? 'connecting' : 'connect')}
            </CustomButton>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: (theme: Theme) => theme.spacing(1),
                borderLeft: (theme: Theme) =>
                  `1px solid ${theme.palette.divider}`,
                paddingLeft: (theme: Theme) => theme.spacing(2),
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={authReq.ssl}
                    onChange={e => handleInputChange('ssl', e.target.checked)}
                    sx={{
                      padding: '4px',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: 'text.secondary',
                    }}
                  >
                    {commonTrans('attu.ssl')}
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={authReq.checkHealth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleInputChange('checkHealth', e.target.checked);
                    }}
                    sx={{
                      padding: '4px',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: 'text.secondary',
                    }}
                  >
                    {commonTrans('attu.checkHealth')}
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

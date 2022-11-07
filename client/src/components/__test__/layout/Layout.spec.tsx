import { render } from '@testing-library/react';
import Layout from '../../layout/Layout';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { theme } from '../../../styles/theme';
import { vi } from 'vitest';

vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (key: any) => key,
    }),
  };
});

vi.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: vi.fn(),
    }),
    useLocation: () => ({
      hash: '',
      pathname: '/use-location-mock',
      search: '',
      state: undefined,
    }),
  };
});

vi.mock('../../layout/GlobalEffect', () => {
  return {
    default: () => {
      return <div role="global">{}</div>;
    },
  };
});

describe('Test Layout', () => {
  it('Test Render', () => {
    const res = render(
      <MuiThemeProvider theme={theme}>
        <Layout />
      </MuiThemeProvider>
    );
    expect(res.getAllByRole('global').length).toEqual(1);
  });
});

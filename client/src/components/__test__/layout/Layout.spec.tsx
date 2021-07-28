import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Layout from '../../layout/Layout';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { theme } from '../../../styles/theme';

let container: any = null;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: any) => key,
  }),
}));

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
  useLocation: () => ({
    hash: '',
    pathname: '/use-location-mock',
    search: '',
    state: undefined,
  }),
}));

jest.mock('../../layout/GlobalEffect', () => {
  return () => {
    return <div id="global">{ }</div>;
  };
});

describe('Test Layout', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test Render', () => {
    act(() => {
      render(<MuiThemeProvider theme={theme}><Layout /></MuiThemeProvider>, container);
    });

    expect(container.querySelectorAll('#global').length).toEqual(1);
  });
});

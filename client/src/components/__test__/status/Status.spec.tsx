import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Status from '../../status/Status';
import { StatusEnum } from '../../status/Types';

let container: any = null;

jest.mock('react-i18next', () => {
  return {
    useTranslation: () => {
      return {
        t: name => {
          return {
            creating: 'creating',
            running: 'running',
            error: 'error',
          };
        },
      };
    },
  };
});

jest.mock('@material-ui/core/Typography', () => {
  return props => {
    return <div className="label">{props.children}</div>;
  };
});

describe('Test Status', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test props status', () => {
    act(() => {
      render(<Status status={StatusEnum.creating} />, container);
    });

    expect(container.querySelector('.label').textContent).toEqual('creating');

    act(() => {
      render(<Status status={StatusEnum.running} />, container);
    });

    expect(container.querySelector('.label').textContent).toEqual('running');
  });
});

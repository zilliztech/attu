import { ReactNode } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Status from '../../status/Status';
import { StatusEnum } from '../../status/Types';

let container: any = null;

jest.mock('@material-ui/core/styles/makeStyles', () => {
  return () => () => ({});
});

jest.mock('react-i18next', () => {
  return {
    useTranslation: () => {
      return {
        t: () => {
          return {
            loaded: 'loaded',
            unloaded: 'unloaded',
            error: 'error',
          };
        },
      };
    },
  };
});

jest.mock('@material-ui/core/Typography', () => {
  return (props: { children: ReactNode }) => {
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
      render(<Status status={StatusEnum.loaded} />, container);
    });

    expect(container.querySelector('.label').textContent).toEqual('loaded');

    act(() => {
      render(<Status status={StatusEnum.unloaded} />, container);
    });

    expect(container.querySelector('.label').textContent).toEqual('unloaded');
  });
});

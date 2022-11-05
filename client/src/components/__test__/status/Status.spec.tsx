import { ReactNode } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Status from '../../status/Status';
import { LOADING_STATE } from '../../../consts/Milvus';
import { vi } from 'vitest';

let container: any = null;

vi.mock('@material-ui/core/styles/makeStyles', () => {
  return () => () => ({});
});

vi.mock('react-i18next', () => {
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

vi.mock('@material-ui/core/Typography', () => {
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
      render(<Status status={LOADING_STATE.LOADED} />, container);
    });

    expect(container.querySelector('.label').textContent).toEqual('loaded');

    act(() => {
      render(<Status status={LOADING_STATE.UNLOADED} />, container);
    });

    expect(container.querySelector('.label').textContent).toEqual('unloaded');
  });
});

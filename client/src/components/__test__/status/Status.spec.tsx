import Status from '../../status/Status';
import { LOADING_STATE } from '@/consts';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

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

describe('Test Status', () => {
  it('Test props status', () => {
    render(<Status status={LOADING_STATE.LOADED} />);
    expect(screen.queryByText('loaded')?.textContent).toEqual('loaded');
    render(<Status status={LOADING_STATE.UNLOADED} />);
    expect(screen.queryByText('unloaded')?.textContent).toEqual('unloaded');
  });
});

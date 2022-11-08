import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ActionBar from '../../grid/ActionBar';
import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

let container: any = null;

describe('Test Table Head', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test No Button', () => {
    act(() => {
      render(<ActionBar configs={[]} row={{ a: 1 }} />, container);
    });

    expect(container.querySelectorAll('.icon-btn').length).toEqual(0);
  });

  it('Test Delete Icon Button', () => {
    const deleteSpy = vi.fn();
    const showDialogSpy = vi.fn();

    act(() => {
      render(
        <ActionBar
          row={{ a: 1 }}
          configs={[
            { onClick: deleteSpy, icon: 'delete', label: 'delete' },
            { onClick: showDialogSpy, icon: 'list', label: 'dialog' },
          ]}
        />,
        container
      );
    });

    expect(container.querySelectorAll('button').length).toEqual(2);
    expect(deleteSpy).toBeCalledTimes(0);

    fireEvent.click(container.querySelector('button[aria-label="delete"]'));
    expect(deleteSpy).toBeCalledTimes(1);

    fireEvent.click(container.querySelector('button[aria-label="dialog"]'));
    expect(showDialogSpy).toBeCalledTimes(1);
  });
});

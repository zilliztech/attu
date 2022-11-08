import { render, screen } from '@testing-library/react';
import Toolbar from '../../grid/ToolBar';
import { ToolBarConfig } from '../../grid/Types';
import { vi } from 'vitest';

const cb = vi.fn().mockImplementation(resolve => resolve('a'));

let toolbarConfig: ToolBarConfig[] = [
  {
    label: 'collection',
    icon: 'delete',
    onClick: cb,
    disabled: selected => selected.length > 1,
  },
];

describe('Test ToolBar', () => {
  it('Test only one config', () => {
    const res = render(
      <Toolbar
        selected={[]}
        setSelected={() => {}}
        toolbarConfigs={toolbarConfig}
      />
    );

    const button = res.getByRole('button');
    expect(res.getAllByRole('button').length).toBe(1);
    expect(button.className.includes('disabled')).toBeFalsy();
  });

  it('Test Search Config', () => {
    toolbarConfig.push({
      label: 'collection',
      icon: 'search',
      onClick: cb,
      onSearch: cb,
    });
    const res = render(
      <Toolbar
        selected={[]}
        setSelected={() => {}}
        toolbarConfigs={toolbarConfig}
      ></Toolbar>
    );
    expect(res.getAllByPlaceholderText('search').length).toBe(1);
  });
});

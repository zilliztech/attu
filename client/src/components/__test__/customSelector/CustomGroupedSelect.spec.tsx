import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { fireEvent } from '@testing-library/react';
import CustomGroupedSelect from '../../customSelector/CustomGroupedSelect';
import { GroupOption } from '../../customSelector/Types';
import { vi } from 'vitest';

let container: any = null;

vi.mock('@material-ui/core/FormControl', () => {
  return (props: any) => {
    const { children } = props;
    return <div className="form-control">{children}</div>;
  };
});

vi.mock('@material-ui/core/Select', () => {
  return (props: any) => {
    const { children, onChange } = props;
    return (
      <select className="group-select" onChange={onChange}>
        {children}
      </select>
    );
  };
});

vi.mock('@material-ui/core/ListSubheader', () => {
  return (props: any) => {
    const { children } = props;
    return <option className="group-header">{children}</option>;
  };
});

vi.mock('@material-ui/core/MenuItem', () => {
  return (props: any) => {
    const { children, value } = props;
    return (
      <option className="group-item" value={value}>
        {children}
      </option>
    );
  };
});

describe('Test CustomGroupedSelect', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test('test group select props', () => {
    const mockOptions: GroupOption[] = [
      {
        label: 'Group 1',
        children: [
          {
            label: 'group text 1',
            value: 'group text 1',
          },
          {
            label: 'group text 2',
            value: 'group text 2',
          },
          {
            label: 'group text 3',
            value: 'group text 3',
          },
        ],
      },
      {
        label: 'Group 2',
        children: [
          {
            label: 'group text 11',
            value: 'group text 11',
          },
          {
            label: 'group text 22',
            value: 'group text 22',
          },
          {
            label: 'group text 33',
            value: 'group text 33',
          },
        ],
      },
    ];
    const handleChange = vi.fn();

    act(() => {
      render(
        <CustomGroupedSelect
          options={mockOptions}
          value={''}
          onChange={handleChange}
        />,
        container
      );
    });

    expect(container.querySelectorAll('.form-control').length).toBe(1);
    expect(container.querySelectorAll('.group-header').length).toBe(2);
    expect(container.querySelectorAll('.group-item').length).toBe(6);

    const select = container.querySelector('.group-select');

    fireEvent.change(select, {
      target: {
        value: 'group text 2',
      },
    });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select.value).toBe('group text 2');
  });
});

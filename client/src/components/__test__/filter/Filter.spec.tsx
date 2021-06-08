import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Filter from '../../filter/Filter';
import { fireEvent } from '@testing-library/react';

let container: any = null;

// jest.mock('../../customButton/CustomButton', () => {
//   return props => {
//     <button>{props.children}</button>;
//   };
// });

jest.mock('@material-ui/core/styles/makeStyles', () => {
  return () => () => ({});
});

describe('Test Filter', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test('test filter props', () => {
    const options = [
      { label: 'a', value: 1 },
      { label: 'b', value: 2 },
    ];
    const filterSpy = jest.fn();
    act(() => {
      render(
        <Filter
          filterOptions={options}
          filterTitle="test"
          onFilter={filterSpy}
        />,
        container
      );
    });
    fireEvent.click(container.querySelector('button'));
    expect(container.querySelector('p').textContent).toEqual('test');
  });
});

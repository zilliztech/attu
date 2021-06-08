import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import CustomToolTip from '../../customToolTip/CustomToolTip';

let container: any = null;

jest.mock('@material-ui/core/Tooltip', () => {
  return props => {
    return (
      <div id="tooltip">
        <div id="title">{props.title}</div>
        <div id="placement">{props.placement}</div>
        {props.children}
      </div>
    );
  };
});

describe('Test Tool Tip', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('Test props ', () => {
    act(() => {
      render(
        <CustomToolTip title="test" placement="right-end">
          <div id="children">child</div>
        </CustomToolTip>,
        container
      );
    });

    expect(container.querySelector('#title').textContent).toEqual('test');
    expect(container.querySelector('#placement').textContent).toEqual(
      'right-end'
    );

    expect(container.querySelector('#children').textContent).toEqual('child');
  });
});

import { render, screen } from '@testing-library/react';
import SimpleMenu from '../../menu/SimpleMenu';

describe('Test Simple Menu', () => {
  it('Test props ', () => {
    const items = [
      {
        label: 'a',
        callback: () => {},
      },
      {
        label: 'Logout',
        callback: () => {
          console.log('logout');
        },
      },
    ];
    const res = render(<SimpleMenu label="test" menuItems={items} />);

    expect(res.getByRole('button').textContent).toEqual('test');
  });
});

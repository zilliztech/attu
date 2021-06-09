import { formatForm } from '../Form';

describe('Test form utils', () => {
  test('test formatForm function', () => {
    const mockUserInfo = {
      name: 'user1',
      age: 20,
      isMale: true,
    };

    const form = formatForm(mockUserInfo);
    const nameInfo = form.find(item => item.key === 'name');
    expect(form.length).toBe(3);
    expect(nameInfo?.value).toBe('user1');
    expect(nameInfo?.needCheck).toBeTruthy();
  });
});

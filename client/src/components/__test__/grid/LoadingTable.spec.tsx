import { render } from '@testing-library/react';
import LoadingTable from '../../grid/LoadingTable';

describe('Test Table', () => {
  it('Test Table Loading status', () => {
    const res = render(<LoadingTable count={2} />);
    expect(res.getAllByRole('skeleton').length).toBe(2);
  });
});

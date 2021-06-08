import {
  descendingComparator,
  getComparator,
  stableSort,
} from '../../grid/Utils';

describe('Test Gird Utils', () => {
  it('Test descendingComparator', () => {
    const a = {
      order: 2,
    };

    const b = {
      order: 11,
    };
    expect(descendingComparator(a, b, 'order')).toEqual(1);
  });

  it('Test getComparator', () => {
    const a = {
      order: 2,
    };

    const b = {
      order: 11,
    };
    expect(getComparator('desc', 'order')(a, b)).toEqual(1);
    expect(getComparator('asc', 'order')(a, b)).toEqual(-1);
  });

  it('Test stableSort', () => {
    const arr = [
      {
        order: 2,
      },
      {
        order: 11,
      },
    ];

    const comparator = getComparator('desc', 'order');
    expect(stableSort(JSON.parse(JSON.stringify(arr)), comparator)).toEqual(
      JSON.parse(JSON.stringify(arr)).reverse()
    );

    const ascComparator = getComparator('asc', 'order');
    expect(stableSort(JSON.parse(JSON.stringify(arr)), ascComparator)).toEqual(
      arr
    );
  });
});

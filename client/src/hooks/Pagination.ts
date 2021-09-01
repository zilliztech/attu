import { useMemo, useState } from 'react';
import { stableSort, getComparator } from '../utils/Sort';

export const usePaginationHook = (
  list: any[],
  orderBy?: string,
  order?: 'asc' | 'desc'
) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const total = list.length;
  const { data, offset } = useMemo(() => {
    const offset = pageSize * currentPage;
    // only when user click sort, orderBy will have value
    const sortList = orderBy
      ? stableSort(list, getComparator(order || 'asc', orderBy))
      : list;
    const data = sortList.slice(offset, offset + pageSize);
    return {
      offset,
      data,
    };
  }, [pageSize, currentPage, orderBy, list, order]);

  const handleCurrentPage = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
  };

  return {
    offset,
    currentPage,
    pageSize,
    handlePageSize,
    handleCurrentPage,
    total,
    data,
  };
};

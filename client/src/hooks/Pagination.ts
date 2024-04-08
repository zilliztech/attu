import { useMemo, useState } from 'react';
import { stableSort, getComparator } from '../utils/Sort';
import { ColDefinitionsType } from '../components/grid/Types';

export const usePaginationHook = (list: any[]) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const total = list.length;
  const { data, offset } = useMemo(() => {
    console.log('data', list);
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
  const handleGridSort = (
    e: any,
    property: string,
    col?: ColDefinitionsType
  ) => {
    console.log('sort', col);
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return {
    offset,
    currentPage,
    pageSize,
    handlePageSize,
    handleCurrentPage,
    total,
    data,
    handleGridSort,
    orderBy,
    order,
  };
};

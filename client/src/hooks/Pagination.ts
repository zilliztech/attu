import { useMemo, useState } from 'react';
import { stableSort, getComparator } from '../utils/Sort';
import { ColDefinitionsType, SortType } from '../components/grid/Types';

export const usePaginationHook = (list: any[]) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [sortType, setSortType] = useState<SortType>('number');

  const total = list.length;
  const { data, offset } = useMemo(() => {
    const offset = pageSize * currentPage;
    // only when user click sort, orderBy will have value
    const sortList = orderBy
      ? stableSort(list, getComparator(order || 'asc', orderBy, sortType))
      : list;
    const data = sortList.slice(offset, offset + pageSize);
    return {
      offset,
      data,
    };
  }, [pageSize, currentPage, orderBy, list, order, sortType]);

  const handleCurrentPage = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
  };
  const handleGridSort = (
    e: any,
    property: string,
    col: ColDefinitionsType = {} as ColDefinitionsType
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setSortType(col!.sortType || 'number');
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

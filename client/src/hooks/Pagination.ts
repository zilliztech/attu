import { useMemo, useState } from 'react';

const PAGE_SIZE = 10;
export const usePaginationHook = (list: any[]) => {
  const [currentPage, setCurrentPage] = useState(0);

  const offset = useMemo(() => PAGE_SIZE * currentPage, [currentPage]);
  const total = list.length;
  const data = useMemo(() => {
    const offset = PAGE_SIZE * currentPage;
    const test = list.slice(offset, offset + PAGE_SIZE);
    return test;
  }, [list, currentPage]);

  const handleCurrentPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    offset,
    currentPage,
    pageSize: PAGE_SIZE,
    handleCurrentPage,
    total,
    data,
  };
};

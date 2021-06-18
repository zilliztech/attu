import { useMemo, useState } from 'react';

const PAGE_SIZE = 10;
export const usePaginationHook = (list: any[]) => {
  const [currentPage, setCurrentPage] = useState(0);

  const total = list.length;
  const { data, offset } = useMemo(() => {
    const offset = PAGE_SIZE * currentPage;
    return {
      offset,
      data: list.slice(offset, offset + PAGE_SIZE),
    };
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

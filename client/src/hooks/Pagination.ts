import { useMemo, useState } from 'react';

export const usePaginationHook = (list: any[]) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const total = list.length;
  const { data, offset } = useMemo(() => {
    const offset = pageSize * currentPage;
    const data = list.slice(offset, offset + pageSize);
    return {
      offset,
      data,
    };
  }, [list, currentPage, pageSize]);

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

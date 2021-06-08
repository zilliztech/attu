import { useState } from 'react';

const PAGE_SIZE = 15;
export const usePaginationHook = () => {
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);

  const handleCurrentPage = (page: number) => {
    setCurrentPage(page);
    setOffset(PAGE_SIZE * page);
  };

  return {
    offset,
    currentPage,
    pageSize: PAGE_SIZE,
    handleCurrentPage,
    total,
    setTotal,
  };
};

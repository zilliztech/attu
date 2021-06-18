import { useEffect, useState } from 'react';

const PAGE_SIZE = 15;
export const usePaginationHook = (list: any[]) => {
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (list.length > 0) {
      setTotal(list.length);
      setData(list.slice(0, PAGE_SIZE));
    }
  }, [list]);

  const handleCurrentPage = (page: number) => {
    setCurrentPage(page);
    const offset = PAGE_SIZE * page;
    setOffset(offset);

    const data = list.slice(offset, offset + PAGE_SIZE);
    setData(data);
  };

  return {
    offset,
    currentPage,
    pageSize: PAGE_SIZE,
    handleCurrentPage,
    total,
    setTotal,
    data,
  };
};

export type FilterType = {
  filterOptions?: { label: string; value: any }[];
  onFilter?: (selected: any[]) => void;
  filterTitle?: string;
};

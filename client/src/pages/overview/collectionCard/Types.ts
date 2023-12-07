import { Collection } from '@/http';

export interface CollectionCardProps {
  data: Collection;
  onRelease: () => void;
  wrapperClass?: string;
}

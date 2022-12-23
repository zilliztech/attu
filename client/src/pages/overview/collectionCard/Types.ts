import { CollectionData } from '../../collections/Types';

export interface CollectionCardProps {
  data: CollectionData;
  onRelease: () => void;
  wrapperClass?: string;
}

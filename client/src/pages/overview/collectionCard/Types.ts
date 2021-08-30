import { CollectionData } from '../../collections/Types';

export interface CollectionCardProps {
  data: CollectionData;
  handleRelease: (data: CollectionData) => void;
  wrapperClass?: string;
}

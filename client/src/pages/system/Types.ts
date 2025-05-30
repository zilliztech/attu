import { ReactNode } from 'react';

export interface Node {
  infos: {
    hardware_infos: any;
    system_info: any;
    name: string;
    created_time: string;
    updated_time: string;
    system_configurations: any;
    type: string;
  };
  connected: {
    connected_identifier: number;
    target_type: string;
    type: string;
  }[];
  identifier: number;
}

export interface ProgressProps {
  percent: number;
  color: string;
}

export interface BaseCardProps {
  children?: ReactNode;
  title: string;
  content?: string;
  desc?: string;
}

export interface DataProgressProps {
  percent: number;
  desc?: string;
}

export interface DataSectionProps {
  titles: string[];
  contents: { label: string; value: string }[];
}

export interface DataCardProps {
  node?: Node;
  extend?: boolean;
}

type SetCord = (arg1: Node | null) => void;

export interface MiniTopoProps {
  selectedCord: Node;
  selectedChildNode: Node | undefined;
  setCord: SetCord;
  setShowChildView: (arg1: boolean) => void;
}

export interface NodeListViewProps {
  selectedCord: Node;
  childNodes: Node[];
  setCord: SetCord;
  setShowChildView: (arg1: boolean) => void;
}

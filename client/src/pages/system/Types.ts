import { ReactNode } from "react";

export interface Node {
  infos: {
    hardware_infos: any,
    system_info: any,
    name: string,
  },
  connected: {
    connected_identifier: number,
  }[],
  identifier: number,
}

export interface ProgressProps {
  percent: number,
  color: string,
}

export interface ProgressCardProps {
  title: string,
  total: number,
  usage: number,
}

export interface BaseCardProps {
  children?: ReactNode,
  title: string,
  content?: string,
  desc?: string,
}

export interface LineChartCardProps {
  title: string,
  value: number,
}

export interface DataProgressProps {
  percent: number,
  desc?: string,
}

export interface DataSectionProps {
  titles: string[],
  contents: { label: string, value: string }[],
}

export interface DataCardProps {
  node?: Node,
  extend?: boolean
}

export interface LinceChartNode {
  percent: number,
  value: number,
  timestamp: number,
}

type SetCord = (arg1: Node | null) => void;

export interface MiniTopoProps {
  selectedCord: Node,
  selectedChildNode: Node | undefined,
  setCord: SetCord,
}

export interface NodeListViewProps {
  selectedCord: Node,
  childNodes: Node[],
  setCord: SetCord,
}
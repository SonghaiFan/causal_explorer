export interface NodeData {
  key: string;
  label: string;
  tag: string;
  URL: string;
  cluster: string;
  x: number;
  y: number;
}

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
  clusterTextContent: string[];
}

export interface Tag {
  key: string;
  color: string;
  image: string;
}

export interface Label {
  key: string;
  color: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: [string, string][];
  clusters: Cluster[];
  tags: Tag[];
  labels: Label[];
}

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
  labels: Record<string, boolean>;
}

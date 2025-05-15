export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  size: number;
  isEraser?: boolean;
}

export interface Polygon {
  points: Point[];
  closed: boolean;
  color: string;
}

export interface ROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MaskTile {
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LoadedROI {
  bbox: { x: number; y: number; w: number; h: number };
  tiles?: MaskTile[];
  points?: { x: number; y: number }[];
  label?: string;
  color?: string;
  cells?: Polygon[];
}

export type RenderItem =
  | { type: 'stroke'; stroke: Stroke }
  | { type: 'polygon'; polygon: Polygon };

export type RenderSnapshot = {
  renderQueue: RenderItem[];
  strokes: Stroke[];
  polygons: Polygon[];
};

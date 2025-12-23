
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  box_2d: BoundingBox;
}

export type PlayerSource = {
  type: 'youtube' | 'file';
  url: string;
  file?: File;
};

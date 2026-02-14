export type Lie =
  | "TEE"
  | "FAIRWAY"
  | "ROUGH"
  | "BUNKER"
  | "RECOVERY"
  | "GREEN"
  | "FRINGE";

export type Shot = {
  holeNumber: number;
  shotNumber: number;

  startLie: Lie;
  startDistance: number;

  endLie: Lie;
  endDistance: number;

  penaltyStrokes: number;
  putts?: number;
};

export type Round = {
  id: string;
  createdAt: number;
  courseName?: string;
  holes: number;
  targetHoles: 9 | 18;
  endedAt?: number;
  shots: Shot[];
};

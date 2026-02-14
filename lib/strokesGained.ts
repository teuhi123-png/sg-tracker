import type { Shot } from "../types/golf";
import { getExpectedStrokes } from "./expectedStrokes";

type ShotCategory = "OTT" | "APP" | "ARG" | "PUTT";

export function categorizeShot(shot: Shot): ShotCategory {
  if (shot.startLie === "TEE") return "OTT";
  if (shot.startLie === "GREEN") return "PUTT";
  if (shot.startLie === "FRINGE") return "ARG";
  if (shot.startLie === "BUNKER" || shot.startLie === "RECOVERY") return "ARG";
  return shot.startDistance <= 30 ? "ARG" : "APP";
}

export function calculateStrokesGained(shot: Shot): {
  sg: number | null;
  category: ShotCategory;
  isValid: boolean;
} {
  const expectedStart = getExpectedStrokes(shot.startLie, shot.startDistance);
  const isHoled =
    (shot.endLie === "GREEN" && shot.endDistance === 0) ||
    (shot.startLie === "GREEN" && typeof shot.putts === "number");
  const expectedEnd = isHoled ? 0 : getExpectedStrokes(shot.endLie, shot.endDistance);

  if (expectedStart === null || expectedEnd === null) {
    return { sg: null, category: "APP", isValid: false };
  }

  const strokesUsed =
    shot.startLie === "GREEN" && typeof shot.putts === "number"
      ? shot.putts + shot.penaltyStrokes
      : 1 + shot.penaltyStrokes;

  const raw = expectedStart - expectedEnd - strokesUsed;
  const sg = Math.round(raw * 1000) / 1000;

  return { sg, category: categorizeShot(shot), isValid: true };
}

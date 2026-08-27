export function advancePipelineStep(currentStep: number, totalSteps: number): number {
  return Math.min(currentStep + 1, Math.max(0, totalSteps - 1));
}

export function clampNumber(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function shiftPan(point: { x: number; y: number }, axis: "x" | "y", delta: number, limit = 72): { x: number; y: number } {
  return { ...point, [axis]: clampNumber(point[axis] + delta, -limit, limit) };
}

/** Exact critically damped spring step; retargeting preserves position/velocity. */
export type SpringState = { position: number; velocity: number };
export function stepDisclosureSpring(state: SpringState, target: number, seconds: number, omega = 22): SpringState {
  const dt = Math.max(0, Math.min(seconds, .064));
  const offset = state.position - target, coefficient = state.velocity + omega * offset, decay = Math.exp(-omega * dt);
  return { position: target + (offset + coefficient * dt) * decay, velocity: (state.velocity - omega * coefficient * dt) * decay };
}

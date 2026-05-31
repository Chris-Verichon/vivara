// Minimal external scroll store. React Three Fiber renders in its own reconciler
// root and does not bridge parent React context into the canvas, so scenes read
// scroll progress from this singleton inside useFrame instead of via context.

export interface ScrollState {
  /** Normalized page scroll progress, 0 (top) → 1 (bottom). */
  progress: number
  /** Raw scroll offset in pixels. */
  scrollY: number
  /** Pointer position in normalized device coords (-1..1), for parallax. */
  pointerX: number
  pointerY: number
}

export const scrollState: ScrollState = {
  progress: 0,
  scrollY: 0,
  pointerX: 0,
  pointerY: 0,
}

export function setScroll(progress: number, scrollY: number) {
  scrollState.progress = progress
  scrollState.scrollY = scrollY
}

export function setPointer(x: number, y: number) {
  scrollState.pointerX = x
  scrollState.pointerY = y
}

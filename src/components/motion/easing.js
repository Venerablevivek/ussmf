// The design's two curves, as cubic-bezier arrays for Framer Motion.
export const SPRING = [0.34, 1.56, 0.64, 1]; // --spring
export const EASE = [0.22, 1, 0.36, 1]; // --ease
export const easeOutQuart = (p) => 1 - Math.pow(1 - p, 4);

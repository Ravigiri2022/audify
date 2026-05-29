import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const scaleIn: Variants = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 },
}

export const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.06 } },
}

export const slideInRight: Variants = {
  initial: { x: 24, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -24, opacity: 0 },
}

export const spring = { type: 'spring', stiffness: 300, damping: 30 } as const
export const easeOut = { duration: 0.3, ease: [0.16, 1, 0.3, 1] } as const

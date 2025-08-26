"use client"

import { motion, AnimatePresence, MotionProps } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"

// Export motion components with proper typing
export const Motion = {
  div: motion.div,
  button: motion.button,
  section: motion.section,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  img: motion.img,
  nav: motion.nav,
  footer: motion.footer,
  header: motion.header,
  ul: motion.ul,
  li: motion.li,
  a: motion.a,
}

// Export AnimatePresence
export { AnimatePresence }

// Export types
export type { MotionProps, HTMLMotionProps }

// Export common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0
  }
}

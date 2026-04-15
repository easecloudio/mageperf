/**
 * Comprehensive Animation System
 * Provides consistent animations, transitions, and easing functions
 * Optimized for 60fps performance across all devices
 */

import { Variants, Transition } from 'framer-motion'

// ============================================================================
// EASING FUNCTIONS - Custom cubic-bezier curves for professional feel
// ============================================================================

export const easings = {
  // Standard Material Design easings
  easeInOut: [0.4, 0.0, 0.2, 1],
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  
  // Custom easing for different use cases
  spring: [0.25, 0.46, 0.45, 0.94],
  bouncy: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.4, 0.0, 0.6, 1],
  
  // Performance-optimized for mobile
  mobileOptimized: [0.25, 0.1, 0.25, 1],
  
  // Branded easing for key interactions
  brand: [0.23, 1, 0.32, 1]
} as const

// ============================================================================
// DURATION CONSTANTS - Consistent timing across the app
// ============================================================================

export const durations = {
  // Micro-interactions (button clicks, hovers)
  instant: 0.1,
  fast: 0.15,
  quick: 0.2,
  
  // Standard transitions
  normal: 0.3,
  smooth: 0.4,
  relaxed: 0.5,
  
  // Page/modal transitions
  pageTransition: 0.6,
  modalTransition: 0.4,
  
  // Loading states
  skeleton: 1.5,
  
  // Complex animations
  complex: 0.8,
  elaborate: 1.0
} as const

// ============================================================================
// TRANSITION PRESETS - Reusable transition configurations
// ============================================================================

export const transitions = {
  default: {
    type: 'tween',
    duration: durations.normal,
    ease: easings.easeInOut
  },
  
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 1
  },
  
  springBouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    mass: 0.8
  },
  
  snappy: {
    type: 'tween',
    duration: durations.quick,
    ease: easings.snappy
  },
  
  smooth: {
    type: 'tween',
    duration: durations.smooth,
    ease: easings.smooth
  },
  
  page: {
    type: 'tween',
    duration: durations.pageTransition,
    ease: easings.easeInOut
  },
  
  modal: {
    type: 'tween',
    duration: durations.modalTransition,
    ease: easings.easeOut
  }
} as const

// ============================================================================
// PAGE TRANSITIONS - Route change animations
// ============================================================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.page
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: { ...transitions.page, duration: durations.normal }
  }
}

// Slide transitions for mobile
export const slideVariants: Variants = {
  initial: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? -100 : 100,
    opacity: 0
  }),
  enter: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth
  },
  exit: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? 100 : -100,
    opacity: 0,
    transition: transitions.smooth
  })
}

// Modal transitions
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.modal
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { ...transitions.modal, duration: durations.quick }
  }
}

// ============================================================================
// COMPONENT ANIMATIONS - Specific component enter/exit animations
// ============================================================================

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth
  }
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -30
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth
  }
}

export const fadeInScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring
  }
}

export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -50
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth
  }
}

export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 50
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth
  }
}

// ============================================================================
// LIST ANIMATIONS - Staggered animations for lists and grids
// ============================================================================

export const staggerContainer: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth
  }
}

export const staggerGrid: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

export const staggerGridItem: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring
  }
}

// ============================================================================
// HOVER ANIMATIONS - Interactive element animations
// ============================================================================

export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: transitions.snappy
  },
  tap: {
    scale: 0.95,
    transition: { duration: durations.instant }
  }
}

export const hoverLift: Variants = {
  initial: { 
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  },
  hover: {
    y: -2,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: transitions.snappy
  }
}

export const hoverGlow: Variants = {
  initial: { 
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)'
  },
  hover: {
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
    transition: transitions.snappy
  }
}

// ============================================================================
// LOADING ANIMATIONS - States for async operations
// ============================================================================

export const loadingPulse: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export const loadingBounce: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export const loadingSpin: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

// ============================================================================
// SKELETON ANIMATIONS - Loading placeholders
// ============================================================================

export const skeletonShimmer: Variants = {
  initial: { 
    backgroundPosition: '-200% 0' 
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

// ============================================================================
// SUCCESS/ERROR ANIMATIONS - Feedback states
// ============================================================================

export const successCheckmark: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: easings.easeOut },
      opacity: { duration: 0.2 }
    }
  }
}

export const errorShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS - Animation helpers
// ============================================================================

/**
 * Create custom stagger animation with specified delay
 */
export const createStagger = (staggerDelay: number = 0.1, delayChildren: number = 0.1): Variants => ({
  initial: {},
  enter: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren
    }
  }
})

/**
 * Create custom fade in animation with specified direction and distance
 */
export const createFadeIn = (direction: 'up' | 'down' | 'left' | 'right' = 'up', distance: number = 30): Variants => {
  const initial = {
    opacity: 0,
    ...(direction === 'up' && { y: distance }),
    ...(direction === 'down' && { y: -distance }),
    ...(direction === 'left' && { x: -distance }),
    ...(direction === 'right' && { x: distance })
  }
  
  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
    transition: transitions.smooth
  }
  
  return {
    initial,
    enter: animate
  }
}

/**
 * Get transition based on performance setting
 */
export const getOptimizedTransition = (reducedMotion: boolean = false): Transition => {
  if (reducedMotion) {
    return {
      type: 'tween',
      duration: durations.instant,
      ease: 'linear'
    }
  }
  return transitions.default
}

/**
 * Respect user's motion preferences
 */
export const respectMotionPreference = (animation: Variants): Variants => {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
  if (prefersReducedMotion) {
    // Return immediate transitions for reduced motion
    return Object.keys(animation).reduce((acc, key) => {
      acc[key] = {
        ...animation[key],
        transition: { duration: 0 }
      }
      return acc
    }, {} as Variants)
  }
  
  return animation
}

// ============================================================================
// PERFORMANCE MONITORING - Animation performance helpers
// ============================================================================

/**
 * Monitor animation performance (development only)
 */
export const monitorAnimationPerformance = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        if (fps < 55) {
          console.warn(`Low animation FPS detected: ${fps}fps`)
        }
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    requestAnimationFrame(measureFPS)
  }
}

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  monitorAnimationPerformance()
}
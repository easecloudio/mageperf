/**
 * Page Transition Component
 * Handles smooth transitions between routes with mobile-optimized animations
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageVariants, slideVariants, modalVariants, respectMotionPreference } from '@/lib/animations'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  variant?: 'fade' | 'slide' | 'modal' | 'instant'
  direction?: 'left' | 'right'
}

export const PageTransition = ({ 
  children, 
  className,
  variant = 'fade',
  direction = 'right'
}: PageTransitionProps) => {
  const pathname = usePathname()
  
  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return respectMotionPreference(slideVariants)
      case 'modal':
        return respectMotionPreference(modalVariants)
      case 'instant':
        return {
          initial: { opacity: 0 },
          enter: { opacity: 1, transition: { duration: 0.1 } },
          exit: { opacity: 0, transition: { duration: 0.1 } }
        }
      default:
        return respectMotionPreference(pageVariants)
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        variants={getVariants()}
        initial="initial"
        animate="enter"
        exit="exit"
        custom={direction}
        style={{
          // Optimize for mobile performance
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)' // Force GPU acceleration
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Specialized mobile transition for swipe navigation
export const MobilePageTransition = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => {
  const pathname = usePathname()
  
  // Determine swipe direction based on route depth
  const getDirection = (path: string): 'left' | 'right' => {
    const depth = path.split('/').length
    const isDeepNavigation = depth > 3
    return isDeepNavigation ? 'left' : 'right'
  }

  const mobileSlideVariants = respectMotionPreference({
    initial: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? '100%' : '-100%',
      opacity: 0
    }),
    enter: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? '-100%' : '100%',
      opacity: 0,
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    })
  })

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        variants={mobileSlideVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        custom={getDirection(pathname)}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Loading transition for async operations
export const LoadingTransition = ({ 
  loading, 
  children, 
  fallback 
}: { 
  loading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode 
}) => {
  const loadingVariants = respectMotionPreference({
    initial: { opacity: 0, scale: 0.95 },
    enter: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  })

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          variants={loadingVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {fallback}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={loadingVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Staggered content reveal for complex pages
export const StaggeredReveal = ({ 
  children, 
  className,
  delay = 0.1 
}: { 
  children: React.ReactNode[]
  className?: string
  delay?: number 
}) => {
  const containerVariants = respectMotionPreference({
    initial: {},
    enter: {
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1
      }
    }
  })

  const itemVariants = respectMotionPreference({
    initial: {
      opacity: 0,
      y: 20
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }
  })

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="enter"
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

// Modal/drawer transition
export const ModalTransition = ({ 
  isOpen, 
  children, 
  onClose 
}: { 
  isOpen: boolean
  children: React.ReactNode
  onClose?: () => void 
}) => {
  const backdropVariants = respectMotionPreference({
    initial: { opacity: 0 },
    enter: { opacity: 1 },
    exit: { opacity: 0 }
  })

  const contentVariants = respectMotionPreference({
    initial: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    enter: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={backdropVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Content */}
          <motion.div
            className="relative max-h-[90vh] overflow-auto"
            variants={contentVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Tab transition for tab panels
export const TabTransition = ({ 
  activeTab, 
  children 
}: { 
  activeTab: string | number
  children: React.ReactNode 
}) => {
  const tabVariants = respectMotionPreference({
    initial: { opacity: 0, x: 20 },
    enter: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={tabVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Performance-optimized list item animations
export const ListItemTransition = ({ 
  children, 
  index = 0,
  appear = true 
}: { 
  children: React.ReactNode
  index?: number
  appear?: boolean 
}) => {
  const itemVariants = respectMotionPreference({
    initial: appear ? { opacity: 0, y: 20 } : {},
    enter: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: Math.min(index * 0.1, 0.5), // Cap delay at 500ms
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  })

  return (
    <motion.div
      variants={itemVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      layout // Enable layout animations for reordering
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </motion.div>
  )
}
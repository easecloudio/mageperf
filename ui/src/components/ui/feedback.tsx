/**
 * Visual Feedback System
 * Instant visual feedback components for all user interactions
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  successCheckmark, 
  errorShake, 
  loadingPulse, 
  hoverScale, 
  hoverLift,
  respectMotionPreference,
  transitions
} from '@/lib/animations'
import { Check, X, Loader2, AlertCircle, Info, CheckCircle } from 'lucide-react'

// ============================================================================
// FEEDBACK PROVIDER CONTEXT
// ============================================================================

interface FeedbackContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
  showProgress: (message: string) => { close: () => void }
  showConfirmation: (message: string, onConfirm: () => void) => void
}

const FeedbackContext = React.createContext<FeedbackContextType | null>(null)

export const useFeedback = () => {
  const context = React.useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [progressItems, setProgressItems] = useState<Array<{ id: string; message: string }>>([])
  const idCounter = useRef(0)

  const generateId = useCallback(() => {
    // Use a stable base timestamp to avoid SSR/client hydration mismatches
    const baseTimestamp = new Date('2024-01-15T00:00:00.000Z').getTime()
    const offset = ++idCounter.current
    return `feedback-${baseTimestamp + offset}-${offset}`
  }, [])

  const showToast = useCallback((message: string, type: Toast['type'], duration = 5000) => {
    const id = generateId()
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)
  }, [generateId])

  const showProgress = useCallback((message: string) => {
    const id = generateId()
    setProgressItems(prev => [...prev, { id, message }])

    return {
      close: () => {
        setProgressItems(prev => prev.filter(item => item.id !== id))
      }
    }
  }, [generateId])

  const showConfirmation = useCallback((message: string, onConfirm: () => void) => {
    // For now, use browser confirm - can be enhanced with custom modal
    if (window.confirm(message)) {
      onConfirm()
    }
  }, [])

  const contextValue: FeedbackContextType = {
    showToast,
    showProgress,
    showConfirmation
  }

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} />
      <ProgressContainer items={progressItems} />
    </FeedbackContext.Provider>
  )
}

// ============================================================================
// TOAST COMPONENTS
// ============================================================================

const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastNotification key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const ToastNotification: React.FC<{ toast: Toast }> = ({ toast }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }

  const Icon = icons[toast.type]

  const toastVariants = respectMotionPreference({
    initial: { 
      opacity: 0, 
      x: 100, 
      scale: 0.8 
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: transitions.spring
    },
    exit: { 
      opacity: 0, 
      x: 100, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  })

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "flex items-center space-x-3 p-4 rounded-lg border shadow-lg min-w-80 max-w-md",
        colors[toast.type]
      )}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden'
      }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
    </motion.div>
  )
}

// ============================================================================
// PROGRESS INDICATORS
// ============================================================================

const ProgressContainer: React.FC<{ items: Array<{ id: string; message: string }> }> = ({ items }) => {
  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {items.map(item => (
          <ProgressItem key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const ProgressItem: React.FC<{ item: { id: string; message: string } }> = ({ item }) => {
  const progressVariants = respectMotionPreference({
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  })

  return (
    <motion.div
      variants={progressVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white border shadow-lg rounded-lg p-4 flex items-center space-x-3 min-w-64"
    >
      <motion.div
        variants={respectMotionPreference(loadingPulse)}
        animate="animate"
      >
        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      </motion.div>
      <p className="text-sm font-medium text-gray-900">{item.message}</p>
    </motion.div>
  )
}

// ============================================================================
// INTERACTIVE FEEDBACK COMPONENTS
// ============================================================================

interface FeedbackButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  loading?: boolean
  success?: boolean
  error?: boolean
  children: React.ReactNode
  feedbackDuration?: number
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  loading = false,
  success = false,
  error = false,
  children,
  feedbackDuration = 2000,
  className,
  onClick,
  disabled,
  ...props 
}) => {
  const [showFeedback, setShowFeedback] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
      
      if (success || error) {
        setShowFeedback(true)
        setTimeout(() => setShowFeedback(false), feedbackDuration)
      }
    }
  }, [onClick, success, error, feedbackDuration])

  const getVariants = () => {
    if (error) return respectMotionPreference(errorShake)
    return respectMotionPreference(hoverScale)
  }

  const getIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (success && showFeedback) return <Check className="h-4 w-4" />
    if (error && showFeedback) return <X className="h-4 w-4" />
    return null
  }

  const getBackgroundColor = () => {
    if (success && showFeedback) return 'bg-green-600 hover:bg-green-700'
    if (error && showFeedback) return 'bg-red-600 hover:bg-red-700'
    return ''
  }

  return (
    <motion.button
      variants={getVariants()}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={error && showFeedback ? "animate" : "initial"}
      className={cn(
        "button-press flex items-center justify-center space-x-2",
        getBackgroundColor(),
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        willChange: 'transform, background-color'
      }}
      {...props}
    >
      {getIcon()}
      <span>{children}</span>
    </motion.button>
  )
}

// ============================================================================
// INTERACTIVE CARDS
// ============================================================================

interface FeedbackCardProps {
  children: React.ReactNode
  clickable?: boolean
  hoverable?: boolean
  className?: string
  onClick?: () => void
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ 
  children,
  clickable = false,
  hoverable = true,
  className,
  onClick
}) => {
  const cardVariants = respectMotionPreference(hoverable ? hoverLift : {})

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover={hoverable ? "hover" : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      className={cn(
        "hover-lift transition-all duration-200",
        clickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={{
        willChange: 'transform, box-shadow'
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// LOADING STATES WITH FEEDBACK
// ============================================================================

interface LoadingStateProps {
  loading: boolean
  success?: boolean
  error?: boolean
  children: React.ReactNode
  loadingText?: string
  successText?: string
  errorText?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  success = false,
  error = false,
  children,
  loadingText = "Loading...",
  successText = "Success!",
  errorText = "Error occurred"
}) => {
  if (loading) {
    return (
      <motion.div
        variants={respectMotionPreference(loadingPulse)}
        animate="animate"
        className="flex items-center justify-center space-x-2 py-4"
      >
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm text-gray-600">{loadingText}</span>
      </motion.div>
    )
  }

  if (success) {
    return (
      <motion.div
        variants={respectMotionPreference(successCheckmark)}
        animate="animate"
        className="flex items-center justify-center space-x-2 py-4 text-green-600"
      >
        <Check className="h-5 w-5" />
        <span className="text-sm font-medium">{successText}</span>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        variants={respectMotionPreference(errorShake)}
        animate="animate"
        className="flex items-center justify-center space-x-2 py-4 text-red-600"
      >
        <X className="h-5 w-5" />
        <span className="text-sm font-medium">{errorText}</span>
      </motion.div>
    )
  }

  return <>{children}</>
}

// ============================================================================
// RIPPLE EFFECT FOR TOUCH FEEDBACK
// ============================================================================

interface RippleEffectProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const RippleEffect: React.FC<RippleEffectProps> = ({ 
  children, 
  className,
  disabled = false 
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: string }>>([])
  const idCounter = useRef(0)

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = `ripple-${Date.now()}-${++idCounter.current}`

    setRipples(prev => [...prev, { x, y, id }])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)
  }, [disabled])

  return (
    <div 
      className={cn("relative overflow-hidden", className)} 
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute bg-current rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
              color: 'rgba(255, 255, 255, 0.3)'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// HAPTIC FEEDBACK (for supported devices)
// ============================================================================

export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(50),
    success: () => vibrate([10, 50, 10]),
    error: () => vibrate([50, 50, 50])
  }
}
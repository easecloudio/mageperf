/**
 * Skeleton Loading Components
 * Professional loading states for all major UI components
 */

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { skeletonShimmer } from '@/lib/animations'

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
  animate?: boolean
  variant?: 'shimmer' | 'pulse' | 'wave'
}

export const Skeleton = ({ 
  className, 
  children, 
  animate = true,
  variant = 'shimmer',
  ...props 
}: SkeletonProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'>) => {
  const baseClasses = cn(
    "bg-gray-200 rounded-md",
    animate && variant === 'shimmer' && "bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
    animate && variant === 'pulse' && "animate-pulse",
    animate && variant === 'wave' && "animate-[wave_2s_ease-in-out_infinite]",
    className
  )

  if (!animate) {
    return <div className={baseClasses} {...props}>{children}</div>
  }

  return (
    <motion.div
      className={baseClasses}
      variants={variant === 'shimmer' ? skeletonShimmer : undefined}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// TEXT SKELETONS
// ============================================================================

export const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          "h-4",
          i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
        )}
      />
    ))}
  </div>
)

export const SkeletonHeading = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-8 w-1/2", className)} />
)

export const SkeletonTitle = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-6 w-2/3", className)} />
)

export const SkeletonCaption = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-3 w-1/4", className)} />
)

// ============================================================================
// BUTTON SKELETONS
// ============================================================================

export const SkeletonButton = ({ 
  size = 'default',
  className 
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string 
}) => {
  const sizeClasses = {
    sm: "h-8 w-20",
    default: "h-10 w-24",
    lg: "h-12 w-32"
  }
  
  return (
    <Skeleton className={cn("rounded-md", sizeClasses[size], className)} />
  )
}

// ============================================================================
// CARD SKELETONS
// ============================================================================

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("p-6 space-y-4 bg-white border rounded-lg", className)}>
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonTitle />
        <SkeletonCaption />
      </div>
    </div>
    <SkeletonText lines={2} />
    <div className="flex justify-between items-center">
      <SkeletonButton size="sm" />
      <Skeleton className="w-16 h-4" />
    </div>
  </div>
)

// ============================================================================
// WIDGET SKELETONS
// ============================================================================

export const SkeletonKPIWidget = ({ className }: { className?: string }) => (
  <div className={cn("p-6 bg-white border rounded-lg space-y-4", className)}>
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <SkeletonCaption />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="w-8 h-8 rounded" />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
)

export const SkeletonChartWidget = ({ className }: { className?: string }) => (
  <div className={cn("p-6 bg-white border rounded-lg space-y-4", className)}>
    <div className="flex justify-between items-center">
      <SkeletonTitle />
      <Skeleton className="w-20 h-8" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-full h-40" />
      <div className="flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-8 h-3" />
        ))}
      </div>
    </div>
  </div>
)

export const SkeletonMetricWidget = ({ className }: { className?: string }) => (
  <div className={cn("p-6 bg-white border rounded-lg", className)}>
    <div className="flex items-center justify-between mb-4">
      <SkeletonTitle className="w-32" />
      <Skeleton className="w-6 h-6 rounded-full" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  </div>
)

// ============================================================================
// TABLE SKELETON
// ============================================================================

export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) => (
  <div className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-5 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            className={cn(
              "h-4 flex-1",
              colIndex === 0 && "w-8 h-8 rounded-full flex-none" // First column as avatar
            )} 
          />
        ))}
      </div>
    ))}
  </div>
)

// ============================================================================
// FORM SKELETONS
// ============================================================================

export const SkeletonForm = ({ className }: { className?: string }) => (
  <div className={cn("space-y-6", className)}>
    {/* Form fields */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    
    {/* Form actions */}
    <div className="flex justify-end space-x-3 pt-4">
      <SkeletonButton />
      <SkeletonButton className="bg-gray-300" />
    </div>
  </div>
)

// ============================================================================
// NAVIGATION SKELETONS
// ============================================================================

export const SkeletonNavigation = ({ className }: { className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
)

// ============================================================================
// REPORT-SPECIFIC SKELETONS
// ============================================================================

export const SkeletonScoreCard = ({ className }: { className?: string }) => (
  <div className={cn("p-6 bg-white border rounded-lg", className)}>
    <div className="flex items-center justify-between mb-4">
      <SkeletonTitle />
      <Skeleton className="w-16 h-16 rounded-full" />
    </div>
    <SkeletonText lines={2} />
    <div className="mt-4 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 flex-1 mx-3" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonRecommendation = ({ className }: { className?: string }) => (
  <div className={cn("p-4 border rounded-lg space-y-3", className)}>
    <div className="flex items-start space-x-3">
      <Skeleton className="w-6 h-6 rounded flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <SkeletonTitle />
        <SkeletonText lines={2} />
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const SkeletonAnalysisPage = ({ className }: { className?: string }) => (
  <div className={cn("space-y-8", className)}>
    {/* Header */}
    <div className="space-y-4">
      <SkeletonHeading />
      <SkeletonText lines={2} />
    </div>
    
    {/* Score cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonScoreCard key={i} />
      ))}
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <SkeletonChartWidget />
      <SkeletonMetricWidget />
    </div>
    
    {/* Recommendations */}
    <div className="space-y-4">
      <SkeletonTitle />
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonRecommendation key={i} />
      ))}
    </div>
  </div>
)


// ============================================================================
// MOBILE-OPTIMIZED SKELETONS
// ============================================================================


// ============================================================================
// LIST SKELETONS WITH STAGGER ANIMATION
// ============================================================================

export const SkeletonList = ({ 
  items = 5,
  className,
  stagger = true
}: { 
  items?: number
  className?: string
  stagger?: boolean
}) => {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: stagger ? 0.1 : 0
      }
    }
  }
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
  
  return (
    <motion.div 
      className={cn("space-y-4", className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {Array.from({ length: items }).map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <SkeletonCard />
        </motion.div>
      ))}
    </motion.div>
  )
}

// ============================================================================
// LOADING STATES WRAPPER
// ============================================================================

export const SkeletonWrapper = ({ 
  loading = false,
  children,
  skeleton,
  className
}: {
  loading?: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  className?: string
}) => (
  <div className={className}>
    {loading ? skeleton : children}
  </div>
)
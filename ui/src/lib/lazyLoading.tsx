/**
 * Lazy Loading Utilities
 * Provides component lazy loading with loading states and error boundaries
 */

import React, { Suspense, lazy, ComponentType } from 'react'
import { LoadingTransition } from '@/components/layout/PageTransition'
import { 
  SkeletonAnalysisPage, 
  SkeletonChartWidget, 
  SkeletonCard,
  SkeletonWrapper
} from '@/components/ui/skeletons'

// ============================================================================
// ERROR BOUNDARY FOR LAZY LOADED COMPONENTS
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class LazyLoadErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

// Default error fallback component
const DefaultErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Failed to Load Component
      </h3>
      <p className="text-sm text-red-600 mb-4">
        {error.message || 'An unexpected error occurred while loading this component.'}
      </p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
)

// ============================================================================
// LAZY LOADING WRAPPER FACTORY
// ============================================================================

interface LazyWrapperOptions {
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  preload?: boolean
  retryAttempts?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyComponent = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: LazyWrapperOptions = {}
) => {
  const {
    fallback = <SkeletonCard />,
    errorFallback,
    preload = false,
    retryAttempts = 3
  } = options

  const LazyComponent = lazy(() => {
    let attempts = 0
    
    const loadWithRetry = async (): Promise<{ default: T }> => {
      try {
        return await componentImport()
      } catch (error) {
        attempts++
        if (attempts < retryAttempts) {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
          return loadWithRetry()
        }
        throw error
      }
    }

    return loadWithRetry()
  })

  const WrappedComponent = (props: React.ComponentPropsWithRef<T>) => {
    return (
      <LazyLoadErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyLoadErrorBoundary>
    )
  }

  // Preload component if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      componentImport().catch(console.error)
    }, 1000)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WrappedComponent.displayName = `LazyWrapper(${(LazyComponent as any).displayName || 'Component'})`
  return WrappedComponent
}

// ============================================================================
// INTERSECTION OBSERVER LAZY LOADING
// ============================================================================

interface IntersectionLazyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
}

export const IntersectionLazy: React.FC<IntersectionLazyProps> = ({
  children,
  fallback = <SkeletonCard />,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  className
}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  )
}

// ============================================================================
// PROGRESSIVE LOADING COMPONENT
// ============================================================================

interface ProgressiveLoadProps {
  loading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  error?: Error | null
  retry?: () => void
  className?: string
  animateTransition?: boolean
}

export const ProgressiveLoad: React.FC<ProgressiveLoadProps> = ({
  loading,
  children,
  skeleton,
  error,
  retry,
  className,
  animateTransition = true
}) => {
  if (error) {
    return (
      <div className={className}>
        <DefaultErrorFallback error={error} retry={retry || (() => {})} />
      </div>
    )
  }

  if (animateTransition) {
    return (
      <LoadingTransition
        loading={loading}
        fallback={<div className={className}>{skeleton}</div>}
      >
        <div className={className}>{children}</div>
      </LoadingTransition>
    )
  }

  return (
    <div className={className}>
      {loading ? skeleton : children}
    </div>
  )
}

// ============================================================================
// HOOK FOR MANAGING LOADING STATES
// ============================================================================

interface LoadingState {
  loading: boolean
  error: Error | null
  data: unknown
}

export const useAsyncLoad = <T,>(
  asyncFunction: () => Promise<T>
): LoadingState & { retry: () => void } => {
  const [state, setState] = React.useState<LoadingState>({
    loading: true,
    error: null,
    data: null
  })

  const execute = React.useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const data = await asyncFunction()
      setState({ loading: false, error: null, data })
    } catch (error) {
      setState({ loading: false, error: error as Error, data: null })
    }
  }, [asyncFunction])

  React.useEffect(() => {
    execute()
  }, [execute])

  return {
    ...state,
    retry: execute
  }
}

// ============================================================================
// LAZY LOADING WRAPPERS FOR SPECIFIC COMPONENT TYPES
// ============================================================================


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyReport = (componentImport: () => Promise<{ default: ComponentType<any> }>) =>
  createLazyComponent(componentImport, {
    fallback: <SkeletonAnalysisPage />,
    preload: false
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyChart = (componentImport: () => Promise<{ default: ComponentType<any> }>) =>
  createLazyComponent(componentImport, {
    fallback: <SkeletonChartWidget />,
    preload: false
  })

// ============================================================================
// BUNDLE SPLITTING UTILITIES
// ============================================================================

// Route-based code splitting helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyRoute = (componentImport: () => Promise<{ default: ComponentType<any> }>) =>
  createLazyComponent(componentImport, {
    fallback: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    preload: false,
    retryAttempts: 5
  })

// Feature-based code splitting helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyFeature = (componentImport: () => Promise<{ default: ComponentType<any> }>) =>
  createLazyComponent(componentImport, {
    fallback: <SkeletonWrapper loading={true} skeleton={<SkeletonCard />}>{null}</SkeletonWrapper>,
    preload: false,
    retryAttempts: 3
  })

// ============================================================================
// PERFORMANCE MONITORING FOR LAZY LOADING
// ============================================================================

export const measureLazyLoadPerformance = (componentName: string) => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return
  }

  const startTime = performance.now()
  
  return {
    end: () => {
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      if (loadTime > 1000) {
        console.warn(`Slow lazy load detected for ${componentName}: ${loadTime.toFixed(2)}ms`)
      } else {
        console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`)
      }
    }
  }
}

// ============================================================================
// PRELOADING STRATEGIES
// ============================================================================

// Preload components on user interaction
export const preloadOnHover = (componentImport: () => Promise<unknown>) => {
  let preloaded = false
  
  return {
    onMouseEnter: () => {
      if (!preloaded) {
        componentImport().catch(console.error)
        preloaded = true
      }
    },
    onFocus: () => {
      if (!preloaded) {
        componentImport().catch(console.error)
        preloaded = true
      }
    }
  }
}

// Preload components during idle time
export const preloadOnIdle = (componentImports: Array<() => Promise<unknown>>) => {
  if (typeof window === 'undefined') return

  const preloadNext = () => {
    if (componentImports.length === 0) return

    const nextImport = componentImports.shift()
    if (nextImport) {
      nextImport().catch(console.error).finally(() => {
        // Schedule next preload
        if ('requestIdleCallback' in window) {
          (window as Window & { requestIdleCallback: (callback: () => void) => void }).requestIdleCallback(preloadNext)
        } else {
          setTimeout(preloadNext, 100)
        }
      })
    }
  }

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (callback: () => void) => void }).requestIdleCallback(preloadNext)
  } else {
    setTimeout(preloadNext, 1000)
  }
}
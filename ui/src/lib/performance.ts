/**
 * Performance Monitoring Utilities
 * Tools for monitoring and optimizing application performance
 */

// ============================================================================
// CORE WEB VITALS MONITORING
// ============================================================================

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface WebVitalsData {
  CLS: PerformanceMetric | null
  FID: PerformanceMetric | null
  FCP: PerformanceMetric | null
  LCP: PerformanceMetric | null
  TTFB: PerformanceMetric | null
}

class PerformanceMonitor {
  private metrics: WebVitalsData = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null
  }

  private observers: PerformanceObserver[] = []
  private callbacks: Array<(metrics: WebVitalsData) => void> = []

  constructor() {
    this.initWebVitals()
  }

  private initWebVitals() {
    if (typeof window === 'undefined') return

    // Cumulative Layout Shift (CLS)
    this.observeCLS()
    
    // First Input Delay (FID)
    this.observeFID()
    
    // First Contentful Paint (FCP)
    this.observeFCP()
    
    // Largest Contentful Paint (LCP)  
    this.observeLCP()
    
    // Time to First Byte (TTFB)
    this.observeTTFB()
  }

  private observeCLS() {
    let clsValue = 0
    const clsEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value: number })[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          clsEntries.push(entry)
        }
      }
      
      this.updateMetric('CLS', clsValue)
    })

    try {
      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(observer)
    } catch {
      console.warn('CLS observation not supported')
    }
  }

  private observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & { processingStart: number; startTime: number })[]
      const fidEntry = entries[0]
      if (fidEntry) {
        this.updateMetric('FID', fidEntry.processingStart - fidEntry.startTime)
      }
    })

    try {
      observer.observe({ type: 'first-input', buffered: true })
      this.observers.push(observer)
    } catch {
      console.warn('FID observation not supported')
    }
  }

  private observeFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[]
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.updateMetric('FCP', fcpEntry.startTime)
      }
    })

    try {
      observer.observe({ type: 'paint', buffered: true })
      this.observers.push(observer)
    } catch {
      console.warn('FCP observation not supported')
    }
  }

  private observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[]
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.updateMetric('LCP', lastEntry.startTime)
      }
    })

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(observer)
    } catch {
      console.warn('LCP observation not supported')
    }
  }

  private observeTTFB() {
    if ('navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart
        this.updateMetric('TTFB', ttfb)
      }
    }
  }

  private updateMetric(name: keyof WebVitalsData, value: number) {
    const rating = this.getRating(name, value)
    
    this.metrics[name] = {
      name,
      value,
      rating,
      timestamp: Date.now()
    }

    // Notify callbacks
    this.callbacks.forEach(callback => callback(this.metrics))
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value.toFixed(2)}ms (${rating})`)
    }
  }

  private getRating(metric: keyof WebVitalsData, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[metric]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  public getMetrics(): WebVitalsData {
    return { ...this.metrics }
  }

  public onMetric(callback: (metrics: WebVitalsData) => void) {
    this.callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.callbacks = []
  }
}

// Global instance
export const performanceMonitor = typeof window !== 'undefined' ? new PerformanceMonitor() : null

// ============================================================================
// REACT HOOKS FOR PERFORMANCE MONITORING
// ============================================================================

import { useEffect, useState } from 'react'

export const useWebVitals = () => {
  const [metrics, setMetrics] = useState<WebVitalsData>({
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null
  })

  useEffect(() => {
    if (!performanceMonitor) return

    const unsubscribe = performanceMonitor.onMetric(setMetrics)
    return unsubscribe
  }, [])

  return metrics
}

// ============================================================================
// BUNDLE SIZE ANALYZER
// ============================================================================

interface BundleInfo {
  route: string
  size: number
  loadTime: number
  timestamp: number
}

class BundleAnalyzer {
  private bundles: BundleInfo[] = []

  public measureRoute(route: string) {
    if (typeof window === 'undefined') return

    const startTime = performance.now()
    
    return {
      end: () => {
        const endTime = performance.now()
        const loadTime = endTime - startTime
        
        // Estimate size based on resource timing
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        const routeResources = resources.filter(resource => 
          resource.name.includes(route) && resource.responseEnd > startTime
        )
        
        const size = routeResources.reduce((total, resource) => {
          return total + (resource.transferSize || 0)
        }, 0)

        this.bundles.push({
          route,
          size,
          loadTime,
          timestamp: Date.now()
        })

        if (process.env.NODE_ENV === 'development') {
          console.log(`Route ${route}: ${(size / 1024).toFixed(2)}KB in ${loadTime.toFixed(2)}ms`)
        }

        return { size, loadTime }
      }
    }
  }

  public getBundles(): BundleInfo[] {
    return [...this.bundles]
  }

  public clear() {
    this.bundles = []
  }
}

export const bundleAnalyzer = new BundleAnalyzer()

// ============================================================================
// MEMORY MONITORING
// ============================================================================

interface MemoryInfo {
  used: number
  total: number
  limit: number
  timestamp: number
}

export const getMemoryUsage = (): MemoryInfo | null => {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null
  }

  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
  if (!memory) return null
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
    timestamp: Date.now()
  }
}

export const useMemoryUsage = (interval = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null)

  useEffect(() => {
    const updateMemory = () => {
      setMemoryInfo(getMemoryUsage())
    }

    updateMemory()
    const timer = setInterval(updateMemory, interval)

    return () => clearInterval(timer)
  }, [interval])

  return memoryInfo
}

// ============================================================================
// ANIMATION PERFORMANCE MONITORING
// ============================================================================

class AnimationMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60
  private isMonitoring = false
  private rafId: number | null = null

  public start() {
    if (this.isMonitoring || typeof window === 'undefined') return

    this.isMonitoring = true
    this.frameCount = 0
    this.lastTime = performance.now()
    
    this.measureFrame()
  }

  private measureFrame = () => {
    this.frameCount++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      
      if (this.fps < 50 && process.env.NODE_ENV === 'development') {
        console.warn(`Low FPS detected: ${this.fps}fps`)
      }
      
      this.frameCount = 0
      this.lastTime = currentTime
    }
    
    if (this.isMonitoring) {
      this.rafId = requestAnimationFrame(this.measureFrame)
    }
  }

  public stop() {
    this.isMonitoring = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  public getFPS(): number {
    return this.fps
  }
}

export const animationMonitor = new AnimationMonitor()

export const useFPS = () => {
  const [fps, setFPS] = useState(60)

  useEffect(() => {
    animationMonitor.start()

    const interval = setInterval(() => {
      setFPS(animationMonitor.getFPS())
    }, 1000)

    return () => {
      clearInterval(interval)
      animationMonitor.stop()
    }
  }, [])

  return fps
}

// ============================================================================
// LONG TASK DETECTION
// ============================================================================

interface LongTask {
  duration: number
  startTime: number
  attribution: string[]
}

export const useLongTaskDetection = () => {
  const [longTasks, setLongTasks] = useState<LongTask[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & { attribution?: { name: string }[] })[]
      const tasks = entries.map(entry => ({
        duration: entry.duration,
        startTime: entry.startTime,
        attribution: entry.attribution ? entry.attribution.map((attr: { name: string }) => attr.name) : []
      }))

      setLongTasks(prev => [...prev, ...tasks])

      // Log long tasks in development
      if (process.env.NODE_ENV === 'development') {
        tasks.forEach(task => {
          console.warn(`Long task detected: ${task.duration.toFixed(2)}ms`, task)
        })
      }
    })

    try {
      observer.observe({ entryTypes: ['longtask'] })
      return () => observer.disconnect()
    } catch {
      console.warn('Long task observation not supported')
    }
  }, [])

  return longTasks
}

// ============================================================================
// PERFORMANCE BUDGET MONITORING
// ============================================================================

interface PerformanceBudget {
  bundleSize: number // KB
  loadTime: number // ms
  fps: number
  memoryUsage: number // MB
}

const defaultBudget: PerformanceBudget = {
  bundleSize: 500, // 500KB
  loadTime: 3000, // 3 seconds
  fps: 50, // minimum FPS
  memoryUsage: 50 // 50MB
}

export const checkPerformanceBudget = (budget: Partial<PerformanceBudget> = {}): Promise<boolean> => {
  return new Promise((resolve) => {
    const finalBudget = { ...defaultBudget, ...budget }
    const violations: string[] = []

    // Check bundle size
    const bundles = bundleAnalyzer.getBundles()
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0) / 1024
    if (totalSize > finalBudget.bundleSize) {
      violations.push(`Bundle size: ${totalSize.toFixed(2)}KB exceeds ${finalBudget.bundleSize}KB`)
    }

    // Check load time
    const avgLoadTime = bundles.reduce((sum, bundle) => sum + bundle.loadTime, 0) / bundles.length
    if (avgLoadTime > finalBudget.loadTime) {
      violations.push(`Load time: ${avgLoadTime.toFixed(2)}ms exceeds ${finalBudget.loadTime}ms`)
    }

    // Check FPS
    const fps = animationMonitor.getFPS()
    if (fps < finalBudget.fps) {
      violations.push(`FPS: ${fps} below minimum ${finalBudget.fps}`)
    }

    // Check memory usage
    const memory = getMemoryUsage()
    if (memory) {
      const memoryMB = memory.used / (1024 * 1024)
      if (memoryMB > finalBudget.memoryUsage) {
        violations.push(`Memory: ${memoryMB.toFixed(2)}MB exceeds ${finalBudget.memoryUsage}MB`)
      }
    }

    if (violations.length > 0) {
      console.warn('Performance budget violations:', violations)
      resolve(false)
    } else {
      console.log('Performance budget: All checks passed')
      resolve(true)
    }
  })
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

export const measureAsyncOperation = async <T>(
  operation: () => Promise<T>,
  name: string
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - startTime
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${duration.toFixed(2)}ms`)
    }
    
    return { result, duration }
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout | null = null
  
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('Performance monitoring initialized')
  animationMonitor.start()
}
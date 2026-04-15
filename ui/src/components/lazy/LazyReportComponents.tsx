/**
 * Lazy-loaded Report Components
 * Performance-optimized report components with proper loading states
 */

'use client'

import { createLazyReport, createLazyChart } from '@/lib/lazyLoading'
// Unused skeleton imports removed

// ============================================================================
// CORE WEB VITALS COMPONENTS
// ============================================================================

export const LazyCoreWebVitals = createLazyReport(() =>
  import('@/components/report/CoreWebVitals').then(module => ({
    default: module.CoreWebVitals
  }))
)

// ============================================================================
// PERFORMANCE METRICS COMPONENTS  
// ============================================================================

export const LazyPerformanceMetrics = createLazyReport(() =>
  import('@/components/report/PerformanceMetrics').then(module => ({
    default: module.PerformanceMetrics
  }))
)

export const LazyScoreCard = createLazyChart(() =>
  import('@/components/report/ScoreCard').then(module => ({
    default: module.ScoreCard
  }))
)

// ============================================================================
// RECOMMENDATIONS COMPONENTS
// ============================================================================

export const LazyRecommendations = createLazyReport(() =>
  import('@/components/report/Recommendations').then(module => ({
    default: module.Recommendations
  }))
)

// ============================================================================
// TECHNICAL ANALYSIS COMPONENTS
// ============================================================================

export const LazyTechnicalAnalysis = createLazyReport(() =>
  import('@/components/report/TechnicalAnalysis').then(module => ({
    default: module.TechnicalAnalysis
  }))
)

// ============================================================================
// OPTIMIZATION ROADMAP COMPONENTS
// ============================================================================

export const LazyOptimizationRoadmap = createLazyReport(() =>
  import('@/components/report/OptimizationRoadmap').then(module => ({
    default: module.OptimizationRoadmap
  }))
)

// ============================================================================
// PERFORMANCE COMPARISON COMPONENTS
// ============================================================================

export const LazyPerformanceComparisonCharts = createLazyChart(() =>
  import('@/components/performance/PerformanceComparisonCharts')
)

export const LazyBenchmarkComparison = createLazyChart(() =>
  import('@/components/performance/BenchmarkComparison')
)

export const LazyPerformanceGoalTracker = createLazyChart(() =>
  import('@/components/performance/PerformanceGoalTracker')
)

// ============================================================================
// MOBILE COMPONENTS
// ============================================================================

// ============================================================================
// ANALYSIS CARD COMPONENT
// ============================================================================

export const LazyAnalysisCard = createLazyChart(() =>
  import('@/components/analysis/AnalysisCard').then(module => ({
    default: module.AnalysisCard
  }))
)
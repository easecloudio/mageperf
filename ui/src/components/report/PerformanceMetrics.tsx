'use client'

import { TechTerm } from '@/components/ui/Tooltip'

// Define detailed interfaces for the metrics prop
interface VitalMetric {
  value: number;
  score: number;
  display_value: string;
  unit: string;
}

interface CoreWebVitals {
  largest_contentful_paint: VitalMetric;
  first_input_delay: VitalMetric;
  cumulative_layout_shift: VitalMetric;
}

interface PerformanceScore {
  performance_score: number;
  accessibility_score: number;
  best_practices_score: number;
  seo_score: number;
}

interface Metrics {
  core_web_vitals: CoreWebVitals;
  scores: {
    overall: number;
    performance: number;
    magento: number;
  };
  mobile_performance: PerformanceScore;
  desktop_performance: PerformanceScore;
  magento_confidence: number;
  magento_version: string | null;
}

interface PerformanceMetricsProps {
  metrics: Metrics;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const coreWebVitals = metrics.core_web_vitals || {}
  const scores = metrics.scores || {}
  const mobilePerformance = metrics.mobile_performance || {}
  const desktopPerformance = metrics.desktop_performance || {}

  const getMetricColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-orange-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h4 className="font-medium text-gray-900 mb-2">Overall Performance</h4>
            <div className={`text-3xl font-bold ${getScoreColor(scores.overall || 0)}`}>
              {scores.overall || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">/ 100</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h4 className="font-medium text-gray-900 mb-2">
              <TechTerm term="PageSpeed Score" explanation="Google's performance score ranging from 0-100. Scores of 90+ are considered good, 50-89 need improvement, and below 50 are poor.">
                Performance Score
              </TechTerm>
            </h4>
            <div className={`text-3xl font-bold ${getScoreColor(scores.performance || 0)}`}>
              {scores.performance || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">PageSpeed Insights</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h4 className="font-medium text-gray-900 mb-2">Magento Score</h4>
            <div className={`text-3xl font-bold ${getScoreColor(scores.magento || 0)}`}>
              {scores.magento || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Configuration & Optimization</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          <TechTerm term="Core Web Vitals" explanation="A set of real-world, user-centered metrics that quantify key aspects of user experience. They measure loading performance, interactivity, and visual stability.">
            Core Web Vitals
          </TechTerm>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">
                    <TechTerm term="LCP" explanation="Largest Contentful Paint - The time it takes for the largest content element (like an image or text block) to become visible within the viewport.">
                      LCP
                    </TechTerm>
                  </h5>
                  <p className="text-sm text-gray-600">Largest Contentful Paint</p>
                </div>
                <div className="text-2xl">🎨</div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-xl font-semibold ${getMetricColor(coreWebVitals.largest_contentful_paint?.score || 0)}`}>
                  {coreWebVitals.largest_contentful_paint?.display_value || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  Good: &le; 2.5s | Needs Improvement: &le; 4.0s | Poor: &gt; 4.0s
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">
                    <TechTerm term="FID" explanation="First Input Delay - The time from when a user first interacts with your page to when the browser responds to that interaction.">
                      FID
                    </TechTerm>
                  </h5>
                  <p className="text-sm text-gray-600">First Input Delay</p>
                </div>
                <div className="text-2xl">👆</div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-xl font-semibold ${getMetricColor(coreWebVitals.first_input_delay?.score || 0)}`}>
                  {coreWebVitals.first_input_delay?.display_value || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  Good: &le; 100ms | Needs Improvement: &le; 300ms | Poor: &gt; 300ms
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">
                    <TechTerm term="CLS" explanation="Cumulative Layout Shift - A measure of visual stability. It quantifies how much visible content shifts during the loading process.">
                      CLS
                    </TechTerm>
                  </h5>
                  <p className="text-sm text-gray-600">Cumulative Layout Shift</p>
                </div>
                <div className="text-2xl">📐</div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-xl font-semibold ${getMetricColor(coreWebVitals.cumulative_layout_shift?.score || 0)}`}>
                  {coreWebVitals.cumulative_layout_shift?.display_value || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  Good: &le; 0.1 | Needs Improvement: &le; 0.25 | Poor: &gt; 0.25
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(mobilePerformance.performance_score || desktopPerformance.performance_score) && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Mobile vs Desktop Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Desktop Performance</h5>
                  <div className="text-2xl">💻</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Performance</span>
                    <span className={`font-semibold ${getScoreColor(desktopPerformance.performance_score || 0)}`}>
                      {desktopPerformance.performance_score || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accessibility</span>
                    <span className={`font-semibold ${getScoreColor(desktopPerformance.accessibility_score || 0)}`}>
                      {desktopPerformance.accessibility_score || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best Practices</span>
                    <span className={`font-semibold ${getScoreColor(desktopPerformance.best_practices_score || 0)}`}>
                      {desktopPerformance.best_practices_score || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SEO</span>
                    <span className={`font-semibold ${getScoreColor(desktopPerformance.seo_score || 0)}`}>
                      {desktopPerformance.seo_score || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Mobile Performance</h5>
                  <div className="text-2xl">📱</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Performance</span>
                    <span className={`font-semibold ${getScoreColor(mobilePerformance.performance_score || 0)}`}>
                      {mobilePerformance.performance_score || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accessibility</span>
                    <span className={`font-semibold ${getScoreColor(mobilePerformance.accessibility_score || 0)}`}>
                      {mobilePerformance.accessibility_score || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best Practices</span>
                    <span className={`font-semibold ${getScoreColor(mobilePerformance.best_practices_score || 0)}`}>
                      {mobilePerformance.best_practices_score || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SEO</span>
                    <span className={`font-semibold ${getScoreColor(mobilePerformance.seo_score || 0)}`}>
                      {mobilePerformance.seo_score || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

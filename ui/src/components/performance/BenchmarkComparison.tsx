'use client';

import React, { useState, useMemo } from 'react';
// import { motion } from 'framer-motion'; // unused
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Globe,
  Award,
  Target,
  Zap,
  Search,
  Shield,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Download
} from 'lucide-react';

interface BenchmarkData {
  category: string;
  description: string;
  sampleSize: number;
  metrics: {
    performance: {
      median: number;
      p75: number;
      p90: number;
      topPerformers: number;
    };
    seo: {
      median: number;
      p75: number;
      p90: number;
      topPerformers: number;
    };
    security: {
      median: number;
      p75: number;
      p90: number;
      topPerformers: number;
    };
    accessibility: {
      median: number;
      p75: number;
      p90: number;
      topPerformers: number;
    };
    loadTime: {
      median: number;
      p75: number;
      p90: number;
      topPerformers: number;
    };
    firstContentfulPaint: {
      median: number;
      p75: number;
      p90: number;
      topPerformers: number;
    };
  };
  industryInsights: {
    commonIssues: string[];
    quickWins: string[];
    averageImprovementTime: string;
    investmentLevel: 'low' | 'medium' | 'high';
  };
}

interface CurrentSiteData {
  performance: number;
  seo: number;
  security: number;
  accessibility: number;
  loadTime: number;
  firstContentfulPaint: number;
}

interface BenchmarkComparisonProps {
  currentSiteData: CurrentSiteData;
  siteDomain?: string;
  siteCategory?: string;
  className?: string;
}

// Industry benchmark data
const industryBenchmarks: BenchmarkData[] = [
  {
    category: 'All E-commerce Sites',
    description: 'Global e-commerce sites across all platforms',
    sampleSize: 50000,
    metrics: {
      performance: { median: 72, p75: 80, p90: 88, topPerformers: 95 },
      seo: { median: 78, p75: 85, p90: 91, topPerformers: 96 },
      security: { median: 85, p75: 92, p90: 96, topPerformers: 99 },
      accessibility: { median: 71, p75: 79, p90: 86, topPerformers: 94 },
      loadTime: { median: 3200, p75: 2800, p90: 2200, topPerformers: 1500 },
      firstContentfulPaint: { median: 1800, p75: 1400, p90: 1100, topPerformers: 800 }
    },
    industryInsights: {
      commonIssues: ['Large JavaScript bundles', 'Unoptimized images', 'Third-party tracking scripts'],
      quickWins: ['Enable compression', 'Optimize images', 'Minimize CSS/JS'],
      averageImprovementTime: '2-4 weeks',
      investmentLevel: 'medium'
    }
  },
  {
    category: 'Magento 2 Stores',
    description: 'Stores specifically built on Magento 2 platform',
    sampleSize: 15000,
    metrics: {
      performance: { median: 65, p75: 74, p90: 82, topPerformers: 92 },
      seo: { median: 74, p75: 81, p90: 87, topPerformers: 94 },
      security: { median: 88, p75: 94, p90: 97, topPerformers: 99 },
      accessibility: { median: 69, p75: 76, p90: 83, topPerformers: 91 },
      loadTime: { median: 3800, p75: 3200, p90: 2600, topPerformers: 1800 },
      firstContentfulPaint: { median: 2100, p75: 1700, p90: 1300, topPerformers: 950 }
    },
    industryInsights: {
      commonIssues: ['Heavy admin panel', 'Module conflicts', 'Database query optimization'],
      quickWins: ['Enable built-in caching', 'CSS/JS merging', 'Image optimization'],
      averageImprovementTime: '3-6 weeks',
      investmentLevel: 'medium'
    }
  },
  {
    category: 'Enterprise E-commerce',
    description: 'Large-scale enterprise e-commerce platforms',
    sampleSize: 5000,
    metrics: {
      performance: { median: 78, p75: 85, p90: 91, topPerformers: 97 },
      seo: { median: 82, p75: 89, p90: 94, topPerformers: 98 },
      security: { median: 91, p75: 96, p90: 98, topPerformers: 99 },
      accessibility: { median: 79, p75: 86, p90: 91, topPerformers: 96 },
      loadTime: { median: 2800, p75: 2300, p90: 1900, topPerformers: 1200 },
      firstContentfulPaint: { median: 1500, p75: 1200, p90: 950, topPerformers: 650 }
    },
    industryInsights: {
      commonIssues: ['Complex integrations', 'Legacy system constraints', 'Multi-region complexity'],
      quickWins: ['CDN implementation', 'Advanced caching', 'Code splitting'],
      averageImprovementTime: '6-12 weeks',
      investmentLevel: 'high'
    }
  },
  {
    category: 'Top 1% Performers',
    description: 'Highest performing e-commerce sites globally',
    sampleSize: 500,
    metrics: {
      performance: { median: 94, p75: 96, p90: 98, topPerformers: 99 },
      seo: { median: 95, p75: 97, p90: 98, topPerformers: 99 },
      security: { median: 97, p75: 98, p90: 99, topPerformers: 100 },
      accessibility: { median: 92, p75: 95, p90: 97, topPerformers: 99 },
      loadTime: { median: 1400, p75: 1100, p90: 900, topPerformers: 600 },
      firstContentfulPaint: { median: 800, p75: 650, p90: 500, topPerformers: 350 }
    },
    industryInsights: {
      commonIssues: ['Marginal optimization opportunities', 'Advanced performance monitoring'],
      quickWins: ['HTTP/3 adoption', 'Service worker optimization', 'Edge computing'],
      averageImprovementTime: '3-6 months',
      investmentLevel: 'high'
    }
  }
];

// Comparison card component
const MetricComparisonCard: React.FC<{
  metricName: string;
  currentValue: number;
  benchmarks: BenchmarkData[];
  unit?: string;
  isLowerBetter?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ metricName, currentValue, benchmarks, unit = '', isLowerBetter = false, icon: Icon }) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState(0);
  
  const benchmark = benchmarks[selectedBenchmark];
  
  // Map metric names to correct keys
  const getMetricKey = (name: string): keyof BenchmarkData['metrics'] => {
    const keyMap: Record<string, keyof BenchmarkData['metrics']> = {
      'Performance Score': 'performance',
      'SEO Score': 'seo', 
      'Security Score': 'security',
      'Accessibility Score': 'accessibility',
      'Load Time': 'loadTime',
      'First Contentful Paint': 'firstContentfulPaint'
    };
    return keyMap[name] || 'performance';
  };
  
  const metricKey = getMetricKey(metricName);
  const metricData = benchmark.metrics[metricKey];
  
  // Safety check - return early if metricData is undefined
  if (!metricData) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-all">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Icon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Metric data not available for {metricName}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getPerformanceLevel = (value: number, benchmarkData: { median: number; p75: number; p90: number; topPerformers: number }) => {
    if (isLowerBetter) {
      if (value <= benchmarkData.topPerformers) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-50' };
      if (value <= benchmarkData.p90) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (value <= benchmarkData.p75) return { level: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { level: 'poor', color: 'text-red-600', bg: 'bg-red-50' };
    } else {
      if (value >= benchmarkData.topPerformers) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-50' };
      if (value >= benchmarkData.p90) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-50' };
      if (value >= benchmarkData.p75) return { level: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { level: 'poor', color: 'text-red-600', bg: 'bg-red-50' };
    }
  };
  
  const performance = getPerformanceLevel(currentValue, metricData);
  const percentile = calculatePercentile(currentValue, metricData, isLowerBetter);
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon className={`h-6 w-6 ${performance.color}`} />
            <h3 className="text-lg font-semibold text-gray-900">{metricName}</h3>
          </div>
          <Badge className={`${performance.color} ${performance.bg} border-0`} variant="outline">
            {performance.level}
          </Badge>
        </div>

        {/* Current value display */}
        <div className={`mb-6 p-4 rounded-lg ${performance.bg}`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${performance.color}`}>
              {currentValue}{unit}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {percentile}th percentile in {benchmark.category.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Benchmark selector */}
        <div className="mb-4">
          <select
            value={selectedBenchmark}
            onChange={(e) => setSelectedBenchmark(parseInt(e.target.value))}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            {benchmarks.map((b, index) => (
              <option key={index} value={index}>
                Compare to: {b.category}
              </option>
            ))}
          </select>
        </div>

        {/* Benchmark comparison */}
        <div className="space-y-3">
          {[
            { label: 'Top Performers', value: metricData.topPerformers, color: 'text-green-600' },
            { label: '90th Percentile', value: metricData.p90, color: 'text-blue-600' },
            { label: '75th Percentile', value: metricData.p75, color: 'text-yellow-600' },
            { label: 'Median', value: metricData.median, color: 'text-gray-600' }
          ].map((item) => {
            const diff = isLowerBetter ? item.value - currentValue : currentValue - item.value;
            const isCurrentBetter = isLowerBetter ? currentValue < item.value : currentValue > item.value;
            
            return (
              <div key={item.label} className="flex items-center justify-between">
                <span className={`text-sm ${item.color}`}>{item.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.value}{unit}</span>
                  <div className="flex items-center space-x-1">
                    {isCurrentBetter ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : diff === 0 ? (
                      <Minus className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${
                      isCurrentBetter ? 'text-green-600' : diff === 0 ? 'text-gray-400' : 'text-red-600'
                    }`}>
                      {Math.abs(diff).toFixed(0)}{unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Improvement potential */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Improvement Potential</div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm">
              Reach {metricData.p90}{unit} to join top 10% ({Math.abs(metricData.p90 - currentValue).toFixed(0)}{unit} improvement needed)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Industry insights component
const IndustryInsights: React.FC<{
  benchmarkData: BenchmarkData;
  currentData: CurrentSiteData;
}> = ({ benchmarkData }) => {
  return (
    <Card className="shadow-lg">
      <CardTitle className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6 text-purple-600" />
          <span className="text-xl">Industry Insights: {benchmarkData.category}</span>
        </div>
      </CardTitle>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common issues */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Common Issues</span>
            </h3>
            <ul className="space-y-2">
              {benchmarkData.industryInsights.commonIssues.map((issue, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick wins */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>Quick Wins</span>
            </h3>
            <ul className="space-y-2">
              {benchmarkData.industryInsights.quickWins.map((win, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{win}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvement timeline */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Average Timeline</div>
              <div className="text-xl font-bold text-blue-900">{benchmarkData.industryInsights.averageImprovementTime}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">Investment Level</div>
              <div className="text-xl font-bold text-purple-900 capitalize">{benchmarkData.industryInsights.investmentLevel}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Sample Size</div>
              <div className="text-xl font-bold text-green-900">{benchmarkData.sampleSize.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Utility function to calculate percentile
function calculatePercentile(value: number, benchmarkData: { median: number; p75: number; p90: number; topPerformers: number }, isLowerBetter: boolean): number {
  if (isLowerBetter) {
    if (value <= benchmarkData.topPerformers) return 99;
    if (value <= benchmarkData.p90) return 90;
    if (value <= benchmarkData.p75) return 75;
    if (value <= benchmarkData.median) return 50;
    return 25;
  } else {
    if (value >= benchmarkData.topPerformers) return 99;
    if (value >= benchmarkData.p90) return 90;
    if (value >= benchmarkData.p75) return 75;
    if (value >= benchmarkData.median) return 50;
    return 25;
  }
}

// Main component
const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  currentSiteData,
  siteDomain,
  className = ""
}) => {
  const [selectedCategory, setSelectedCategory] = useState(0);

  const metrics = [
    { name: 'Performance Score', key: 'performance', icon: Zap, unit: '' },
    { name: 'SEO Score', key: 'seo', icon: Search, unit: '' },
    { name: 'Security Score', key: 'security', icon: Shield, unit: '' },
    { name: 'Accessibility Score', key: 'accessibility', icon: Activity, unit: '' },
    { name: 'Load Time', key: 'loadTime', icon: BarChart3, unit: 'ms', isLowerBetter: true },
    { name: 'First Contentful Paint', key: 'firstContentfulPaint', icon: TrendingUp, unit: 'ms', isLowerBetter: true }
  ];

  const overallPerformance = useMemo(() => {
    const scores = [
      currentSiteData.performance,
      currentSiteData.seo,
      currentSiteData.security,
      currentSiteData.accessibility
    ];
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (average >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (average >= 80) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (average >= 70) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50' };
  }, [currentSiteData]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Industry Benchmark Comparison</h2>
          <p className="text-gray-600">Compare your performance against industry standards and competitors</p>
          {siteDomain && (
            <div className="flex items-center space-x-2 mt-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">{siteDomain}</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overall performance summary */}
      <Card className={`shadow-xl border-l-4 ${overallPerformance.color.replace('text-', 'border-')}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Overall Performance Rating</h3>
              <p className="text-gray-600">Based on key performance metrics across all categories</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${overallPerformance.color} mb-2`}>
                {Math.round((currentSiteData.performance + currentSiteData.seo + currentSiteData.security + currentSiteData.accessibility) / 4)}
              </div>
              <Badge className={`${overallPerformance.color} ${overallPerformance.bg} border-0 text-lg px-4 py-2`}>
                {overallPerformance.level}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">vs. All E-commerce</div>
              <div className="text-lg font-bold text-gray-900">
                {calculatePercentile(
                  Math.round((currentSiteData.performance + currentSiteData.seo + currentSiteData.security + currentSiteData.accessibility) / 4),
                  industryBenchmarks[0].metrics.performance,
                  false
                )}th percentile
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">vs. Magento Sites</div>
              <div className="text-lg font-bold text-blue-900">
                {calculatePercentile(
                  Math.round((currentSiteData.performance + currentSiteData.seo + currentSiteData.security + currentSiteData.accessibility) / 4),
                  industryBenchmarks[1].metrics.performance,
                  false
                )}th percentile
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600">vs. Enterprise</div>
              <div className="text-lg font-bold text-purple-900">
                {calculatePercentile(
                  Math.round((currentSiteData.performance + currentSiteData.seo + currentSiteData.security + currentSiteData.accessibility) / 4),
                  industryBenchmarks[2].metrics.performance,
                  false
                )}th percentile
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600">vs. Top Performers</div>
              <div className="text-lg font-bold text-green-900">
                {calculatePercentile(
                  Math.round((currentSiteData.performance + currentSiteData.seo + currentSiteData.security + currentSiteData.accessibility) / 4),
                  industryBenchmarks[3].metrics.performance,
                  false
                )}th percentile
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <MetricComparisonCard
            key={metric.key}
            metricName={metric.name}
            currentValue={currentSiteData[metric.key as keyof CurrentSiteData]}
            benchmarks={industryBenchmarks}
            unit={metric.unit}
            isLowerBetter={metric.isLowerBetter}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Industry insights */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-gray-900">Industry Insights & Recommendations</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            {industryBenchmarks.map((benchmark, index) => (
              <option key={index} value={index}>
                {benchmark.category}
              </option>
            ))}
          </select>
        </div>
        
        <IndustryInsights
          benchmarkData={industryBenchmarks[selectedCategory]}
          currentData={currentSiteData}
        />
      </div>
    </div>
  );
};

export default BenchmarkComparison;
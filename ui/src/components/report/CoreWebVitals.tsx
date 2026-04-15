'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ProgressiveDisclosure, DetailedInsight } from '@/components/ui/ProgressiveDisclosure';
import { Grid, Stack } from '@/components/layout/GridSystem';
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  Monitor,
  Smartphone,
  Info,
  Minus,
  Zap,
  Eye,
  MousePointer,
  Layers,
  Clock,
  Gauge,
} from 'lucide-react';

// Enhanced utility functions with sophisticated color schemes and metrics

const industryBenchmarks = {
  LCP: { good: 2.5, needsImprovement: 4.0 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1.8, needsImprovement: 3.0 },
  TTI: { good: 3.8, needsImprovement: 7.3 },
  SI: { good: 3.4, needsImprovement: 5.8 },
  TBT: { good: 200, needsImprovement: 600 }
};

function getStatusColor(score: number): string {
  if (score >= 0.9) return "text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200";
  if (score >= 0.5) return "text-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200";
  return "text-red-600 bg-gradient-to-br from-red-50 to-red-100 border-red-200";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
}

function getScoreBadgeColor(score: number): string {
  if (score >= 90) return "bg-gradient-to-r from-emerald-500 to-emerald-600";
  if (score >= 70) return "bg-gradient-to-r from-amber-500 to-amber-600";
  if (score >= 50) return "bg-gradient-to-r from-orange-500 to-orange-600";
  return "bg-gradient-to-r from-red-500 to-red-600";
}

function getCWVStatus(score: number): { 
  status: string; 
  color: string; 
  bgColor: string;
  icon: React.ComponentType<any>;
  gradient: string;
} {
  if (score >= 0.9) return { 
    status: "Good", 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-500",
    gradient: "from-emerald-400 to-emerald-600",
    icon: CheckCircle 
  };
  if (score >= 0.5) return { 
    status: "Needs Improvement", 
    color: "text-amber-600", 
    bgColor: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
    icon: AlertTriangle 
  };
  return { 
    status: "Poor", 
    color: "text-red-600", 
    bgColor: "bg-red-500",
    gradient: "from-red-400 to-red-600",
    icon: AlertCircle 
  };
}

function getMetricIcon(metricName: string): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
    LCP: Eye,
    FID: MousePointer,
    CLS: Layers,
    FCP: Zap,
    TTI: Clock,
    SI: Gauge,
    TBT: Minus
  };
  return iconMap[metricName] || Info;
}


// Custom gauge component for circular progress indicators
interface GaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  animated?: boolean;
}

function CircularGauge({ value, size = 120, strokeWidth = 8, className = "", showValue = true, animated = true }: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const status = getCWVStatus(value / 100);
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gauge-gradient-${value})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient id={`gauge-gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={`${status.color.replace('text-', 'stop-')}`} />
            <stop offset="100%" className={`${status.color.replace('text-', 'stop-').replace('600', '800')}`} />
          </linearGradient>
        </defs>
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={animated ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: animated ? 1 : 0 }}
          >
            <div className={`text-2xl font-bold ${status.color}`}>
              {Math.round(value)}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              /100
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface PerformanceData {
  performance_score?: number;
  accessibility_score?: number;
  best_practices_score?: number;
  seo_score?: number;
  core_web_vitals?: {
    largest_contentful_paint?: { display_value?: string; score?: number; value?: number; };
    first_input_delay?: { display_value?: string; score?: number; value?: number; };
    cumulative_layout_shift?: { display_value?: string; score?: number; value?: number; };
    first_contentful_paint?: { display_value?: string; score?: number; value?: number; };
    time_to_interactive?: { display_value?: string; score?: number; value?: number; };
    speed_index?: { display_value?: string; score?: number; value?: number; };
    total_blocking_time?: { display_value?: string; score?: number; value?: number; };
  };
}

interface MetricCardProps {
  name: string;
  fullName: string;
  value: string;
  score: number;
  numericValue?: number;
  description: string;
  isCore?: boolean;
}

interface ReportDataProps {
  reportData: {
    performance?: {
      raw_data?: {
        desktop_performance?: PerformanceData;
        mobile_performance?: PerformanceData;
      };
    };
  };
}

export function CoreWebVitals({ reportData }: ReportDataProps) {
  const [selectedDevice, setSelectedDevice] = useState<"desktop" | "mobile">("desktop");
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  const currentPerformanceData = useMemo(() => {
    return selectedDevice === "desktop"
      ? reportData.performance?.raw_data?.desktop_performance || {}
      : reportData.performance?.raw_data?.mobile_performance || {};
  }, [selectedDevice, reportData.performance]);


  const { coreWebVitalsData, additionalMetrics, overallScore } = useMemo(() => {
    const vitals = currentPerformanceData.core_web_vitals || {};
    
    const coreMetrics = [
      {
        name: "LCP",
        fullName: "Largest Contentful Paint",
        value: vitals.largest_contentful_paint?.display_value || "N/A",
        score: vitals.largest_contentful_paint?.score || 0,
        numericValue: vitals.largest_contentful_paint?.value,
        description: "Time to render the largest content element visible in the viewport",
        benchmark: industryBenchmarks.LCP,
        isCore: true,
      },
      {
        name: "FID",
        fullName: "First Input Delay",
        value: vitals.first_input_delay?.display_value || "N/A",
        score: vitals.first_input_delay?.score || 0,
        numericValue: vitals.first_input_delay?.value,
        description: "Time from when a user first interacts with your site to when the browser responds",
        benchmark: industryBenchmarks.FID,
        isCore: true,
      },
      {
        name: "CLS",
        fullName: "Cumulative Layout Shift",
        value: vitals.cumulative_layout_shift?.display_value || "N/A",
        score: vitals.cumulative_layout_shift?.score || 0,
        numericValue: vitals.cumulative_layout_shift?.value,
        description: "Sum of all individual layout shift scores for unexpected layout shifts",
        benchmark: industryBenchmarks.CLS,
        isCore: true,
      },
    ];

    const additional = [
      {
        name: "FCP",
        fullName: "First Contentful Paint",
        value: vitals.first_contentful_paint?.display_value || "N/A",
        score: vitals.first_contentful_paint?.score || 0,
        numericValue: vitals.first_contentful_paint?.value,
        description: "Time from navigation start to when the first pixel is rendered",
        benchmark: industryBenchmarks.FCP,
        isCore: false,
      },
      {
        name: "TTI",
        fullName: "Time to Interactive",
        value: vitals.time_to_interactive?.display_value || "N/A",
        score: vitals.time_to_interactive?.score || 0,
        numericValue: vitals.time_to_interactive?.value,
        description: "Time until the page is fully interactive and responds to user input",
        benchmark: industryBenchmarks.TTI,
        isCore: false,
      },
      {
        name: "SI",
        fullName: "Speed Index",
        value: vitals.speed_index?.display_value || "N/A",
        score: vitals.speed_index?.score || 0,
        numericValue: vitals.speed_index?.value,
        description: "How quickly the contents of a page are visibly populated",
        benchmark: industryBenchmarks.SI,
        isCore: false,
      },
      {
        name: "TBT",
        fullName: "Total Blocking Time",
        value: vitals.total_blocking_time?.display_value || "N/A",
        score: vitals.total_blocking_time?.score || 0,
        numericValue: vitals.total_blocking_time?.value,
        description: "Sum of all time periods between FCP and TTI when task length exceeded 50ms",
        benchmark: industryBenchmarks.TBT,
        isCore: false,
      },
    ];

    const overall = coreMetrics.reduce((acc, metric) => acc + (metric.score * 100), 0) / coreMetrics.length;
    
    return { coreWebVitalsData: coreMetrics, additionalMetrics: additional, overallScore: overall };
  }, [currentPerformanceData]);

  const chartData = useMemo(() => {
    const allMetrics = [...coreWebVitalsData, ...additionalMetrics];
    return allMetrics.map(metric => ({
      name: metric.name,
      score: metric.score * 100,
      status: getCWVStatus(metric.score).status,
      fill: getCWVStatus(metric.score).bgColor
    }));
  }, [coreWebVitalsData, additionalMetrics]);

  const performanceComparison = useMemo(() => {
    const desktop = reportData.performance?.raw_data?.desktop_performance || {};
    const mobile = reportData.performance?.raw_data?.mobile_performance || {};

    return {
      performance: { desktop: desktop.performance_score || 0, mobile: mobile.performance_score || 0 },
      accessibility: { desktop: desktop.accessibility_score || 0, mobile: mobile.accessibility_score || 0 },
      best_practices: { desktop: desktop.best_practices_score || 0, mobile: mobile.best_practices_score || 0 },
      seo: { desktop: desktop.seo_score || 0, mobile: mobile.seo_score || 0 },
    };
  }, [reportData.performance]);

  // Enhanced metric card component with React.memo for performance
  const MetricCard = React.memo(({ name, fullName, value, score, numericValue, description, isCore }: MetricCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const status = getCWVStatus(score);
    const MetricIcon = getMetricIcon(name);
    const scorePercentage = score * 100;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={`relative overflow-hidden ${
                isCore 
                  ? 'col-span-1' 
                  : 'col-span-1'
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className={`${getStatusColor(score)} border-2 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full ${
                isHovered ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
              }`}>
                <CardContent className="p-6 text-center relative">
                  {isCore && (
                    <div className="absolute top-2 right-2">
                      <Badge className="text-xs bg-blue-500 text-white border-0">
                        Core
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <CircularGauge 
                        value={scorePercentage} 
                        size={80} 
                        strokeWidth={6} 
                        animated={true}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <MetricIcon className={`h-4 w-4 ${status.color}`} />
                      <div className="font-semibold text-sm text-gray-700">{name}</div>
                    </div>
                    
                    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                    
                    <div className="text-xs text-gray-500 leading-tight px-2">
                      {description}
                    </div>
                    
                    <motion.div 
                      className="mt-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge 
                        className={`text-xs ${status.color} border-current`}
                        variant="outline"
                      >
                        {status.status}
                      </Badge>
                    </motion.div>
                  </div>
                  
                  {/* Hover overlay with benchmark comparison */}
                  <AnimatePresence>
                    {isHovered && numericValue && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white p-4 rounded"
                      >
                        <div className="text-center text-sm">
                          <div className="font-semibold mb-1">{fullName}</div>
                          <div className="text-xs opacity-90">
                            Current: {value}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold">{fullName}</div>
              <div className="text-sm opacity-90">{description}</div>
              <div className="text-xs mt-2 pt-2 border-t border-gray-300">
                <div>Score: {Math.round(scorePercentage)}/100</div>
                <div>Status: {status.status}</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  });
  
  MetricCard.displayName = 'MetricCard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Professional Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Gauge className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Core Web Vitals Analysis
                </h1>
                <p className="text-gray-600">
                  Real user experience metrics that impact search rankings and conversion rates
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedDevice === "desktop" ? "default" : "outline"}
                onClick={() => setSelectedDevice("desktop")}
                size="sm"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={selectedDevice === "mobile" ? "default" : "outline"}
                onClick={() => setSelectedDevice("mobile")}
                size="sm"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBenchmarks(!showBenchmarks)}
                size="sm"
              >
                <Info className="h-3 w-3 mr-1" />
                {showBenchmarks ? 'Hide' : 'Show'} Benchmarks
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Overall Score Display */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <Stack direction="row" justify="between" align="center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Overall Performance</h3>
                <p className="text-gray-600 text-sm">Combined Core Web Vitals score</p>
              </div>
              <div className="text-right">
                <Badge className={`${getScoreBadgeColor(overallScore)} text-white px-4 py-2 text-lg font-bold`}>
                  {Math.round(overallScore)}/100
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedDevice === 'desktop' ? 'Desktop' : 'Mobile'} Score
                </div>
              </div>
            </Stack>
          </div>
        </motion.div>

        {/* Core Web Vitals Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Core Web Vitals</h2>
            <p className="text-gray-600">Google&apos;s key user experience metrics that directly impact search rankings</p>
          </div>

          <Grid cols={3} gap="lg" className="mb-8">
            {coreWebVitalsData.map((vital, index) => (
              <motion.div
                key={vital.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="h-full"
              >
                <MetricCard {...vital} />
              </motion.div>
            ))}
          </Grid>

          {/* Core Web Vitals Guidance */}
          <div className="space-y-6">
            <ProgressiveDisclosure
              title="Understanding Core Web Vitals"
              subtitle="Learn what each metric means and why it matters for your business"
              badge="Essential Knowledge"
              badgeVariant="outline"
              icon={Info}
              className="bg-blue-50 border-blue-200"
            >
              <Grid cols={3} gap="md">
                {[
                  {
                    metric: "LCP",
                    name: "Largest Contentful Paint",
                    description: "Measures loading performance. The main content should render within 2.5 seconds.",
                    impact: "Directly affects bounce rate and user engagement",
                    goodThreshold: "< 2.5s",
                    currentValue: coreWebVitalsData.find(v => v.name === "LCP")?.value || "N/A"
                  },
                  {
                    metric: "FID",
                    name: "First Input Delay", 
                    description: "Measures interactivity. Pages should respond to user input within 100ms.",
                    impact: "Affects user frustration and task completion",
                    goodThreshold: "< 100ms",
                    currentValue: coreWebVitalsData.find(v => v.name === "FID")?.value || "N/A"
                  },
                  {
                    metric: "CLS",
                    name: "Cumulative Layout Shift",
                    description: "Measures visual stability. Pages should maintain layout stability.",
                    impact: "Prevents accidental clicks and improves UX",
                    goodThreshold: "< 0.1",
                    currentValue: coreWebVitalsData.find(v => v.name === "CLS")?.value || "N/A"
                  }
                ].map((info) => (
                  <div key={info.metric} className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getCWVStatus(coreWebVitalsData.find(v => v.name === info.metric)?.score || 0).bgColor
                      }`}>
                        <span className="text-white font-bold text-sm">{info.metric}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{info.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current:</span>
                        <span className="font-medium">{info.currentValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Target:</span>
                        <span className="font-medium text-green-600">{info.goodThreshold}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-gray-600">{info.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Grid>
            </ProgressiveDisclosure>
            
            {/* Performance Improvement Recommendations */}
            {coreWebVitalsData.some(vital => vital.score < 0.9) && (
              <DetailedInsight
                title="Core Web Vitals Optimization"
                description="Systematic approach to improving your Core Web Vitals scores"
                impact="high"
                timeToImplement="1-3 weeks"
                steps={[
                  "Optimize server response times (TTFB) to improve LCP",
                  "Implement image optimization and lazy loading",
                  "Minimize JavaScript execution time for better FID",
                  "Ensure proper image dimensions to reduce CLS",
                  "Use font-display: swap for web fonts",
                  "Implement critical CSS inlining"
                ]}
                relatedMetrics={coreWebVitalsData.map(vital => ({
                  name: vital.fullName,
                  value: vital.value,
                  improvement: vital.score < 0.9 ? "Needs optimization" : "Good"
                }))}
                technicalDetails={[
                  "# Optimize LCP",
                  "- Implement server-side rendering",
                  "- Use CDN for faster content delivery",
                  "- Optimize critical rendering path",
                  "",
                  "# Improve FID", 
                  "- Defer non-critical JavaScript",
                  "- Use web workers for heavy computations",
                  "- Optimize third-party scripts",
                  "",
                  "# Reduce CLS",
                  "- Set explicit dimensions for images/videos", 
                  "- Reserve space for dynamic content",
                  "- Avoid inserting content above existing content"
                ]}
              />
            )}
          </div>
        </motion.div>

        {/* Additional Performance Metrics */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Performance Metrics</h2>
            <p className="text-gray-600">Supporting metrics that provide deeper insights into page performance</p>
          </div>

          <Grid cols={4} gap="md">
            {additionalMetrics.map((vital, index) => (
              <motion.div
                key={vital.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="h-full"
              >
                <MetricCard {...vital} />
              </motion.div>
            ))}
          </Grid>
        </motion.div>

      {/* Performance Visualization Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardTitle className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span className="text-lg">Performance Score Breakdown</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {selectedDevice === 'desktop' ? 'Desktop' : 'Mobile'} View
            </Badge>
          </CardTitle>
          <CardContent className="p-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [
                      `${Math.round(value)}/100`,
                      'Score'
                    ]}
                    labelFormatter={(label) => {
                      const metric = [...coreWebVitalsData, ...additionalMetrics].find(m => m.name === label);
                      return metric ? metric.fullName : label;
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    radius={[4, 4, 0, 0]}
                    fill="url(#barGradient)"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-${entry.name})`}
                      />
                    ))}
                  </Bar>
                  <defs>
                    {chartData.map((entry) => {
                      const status = getCWVStatus(entry.score / 100);
                      return (
                        <linearGradient key={entry.name} id={`gradient-${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={status.bgColor.replace('bg-', '').replace('-500', '')} className={status.color.replace('text-', 'stop-color-')} />
                          <stop offset="100%" stopColor={status.bgColor.replace('bg-', '').replace('-500', '')} className={status.color.replace('text-', 'stop-color-').replace('600', '800')} stopOpacity={0.8} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Device Performance Comparison */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardTitle className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span className="text-lg">Desktop vs Mobile Performance</span>
            </div>
            <div className="text-sm text-gray-500">
              Cross-device comparison
            </div>
          </CardTitle>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {Object.entries(performanceComparison).map(([metric, scores], index) => (
                <motion.div 
                  key={metric} 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div className="text-sm font-bold text-gray-900 capitalize border-b pb-2">
                    {metric.replace("_", " ")}
                  </div>
                  <div className="space-y-4">
                    {/* Desktop Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700 font-medium">Desktop</span>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(scores.desktop)}`}>
                          {Math.round(scores.desktop)}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${getScoreBadgeColor(scores.desktop)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${scores.desktop}%` }}
                            transition={{ duration: 1, delay: 0.2 + (0.1 * index) }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700 font-medium">Mobile</span>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(scores.mobile)}`}>
                          {Math.round(scores.mobile)}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${getScoreBadgeColor(scores.mobile)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${scores.mobile}%` }}
                            transition={{ duration: 1, delay: 0.4 + (0.1 * index) }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Comparison Indicator */}
                    <div className="flex items-center justify-center pt-2">
                      {scores.desktop > scores.mobile + 5 ? (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Monitor className="h-3 w-3" />
                          <span>Better</span>
                        </div>
                      ) : scores.mobile > scores.desktop + 5 ? (
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <Smartphone className="h-3 w-3" />
                          <span>Better</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Minus className="h-3 w-3" />
                          <span>Similar</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Industry Benchmarks Panel */}
      <AnimatePresence>
        {showBenchmarks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center space-x-2 p-6 border-b">
                <Info className="h-5 w-5 text-blue-600" />
                <span className="text-lg text-blue-900">Industry Benchmarks</span>
              </CardTitle>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coreWebVitalsData.map((vital) => (
                    <div key={vital.name} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="font-semibold text-gray-900">{vital.name}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-emerald-600">Good:</span>
                          <span className="font-mono text-emerald-600">
                            {'<'} {vital.benchmark?.good}{vital.name === 'CLS' ? '' : vital.name === 'FID' ? 'ms' : 's'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-600">Needs Improvement:</span>
                          <span className="font-mono text-amber-600">
                            {'<'} {vital.benchmark?.needsImprovement}{vital.name === 'CLS' ? '' : vital.name === 'FID' ? 'ms' : 's'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Poor:</span>
                          <span className="font-mono text-red-600">
                            {'>='} {vital.benchmark?.needsImprovement}{vital.name === 'CLS' ? '' : vital.name === 'FID' ? 'ms' : 's'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
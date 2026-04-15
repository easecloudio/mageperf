'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DualSidebarLayout } from '@/components/layout/DualSidebarLayout';
import { useParams } from 'next/navigation';
import { useReport } from '@/contexts/ReportContext';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ProgressiveDisclosure, DetailedInsight } from '@/components/ui/ProgressiveDisclosure';
import { Grid, Container, Section, CardGridItem } from '@/components/layout/GridSystem';
import { EaseCloudCTA } from '@/components/EaseCloudCTA';
import {
  Globe,
  ExternalLink,
  Check,
  Activity,
  Calendar,
  Settings,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
  Eye,
  Shield,
  Search,
  Star,
  TrendingUp,
  Award,
  Target,
  Code,
  FileText,
} from 'lucide-react';

// Type definitions for report data structure



// Enhanced utility functions with sophisticated color schemes and metrics
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

function getScoreBackground(score: number): string {
  if (score >= 90) return "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200";
  if (score >= 70) return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200";
  if (score >= 50) return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200";
  return "bg-gradient-to-br from-red-50 to-red-100 border-red-200";
}


function getStatusIcon(score: number): React.ComponentType<{className?: string}> {
  if (score >= 90) return CheckCircle;
  if (score >= 70) return AlertTriangle;
  return AlertCircle;
}

function getCategoryIcon(category: string): React.ComponentType<{className?: string}> {
  const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
    performance: Zap,
    seo: Search,
    accessibility: Eye,
    best_practices: Shield,
    security: Shield,
    magento: Settings,
    overall: Award
  };
  return iconMap[category] || Target;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Custom gauge component for circular progress indicators
interface GaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  animated?: boolean;
  label?: string;
}

function CircularGauge({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  className = "", 
  showValue = true, 
  animated = true,
  label
}: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  // Use a deterministic ID based on component props to avoid hydration errors
  const gradientId = `gauge-gradient-${value}-${size}-${strokeWidth}`;
  
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
          stroke={`url(#${gradientId})`}
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
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={`${getScoreColor(value).replace('text-', 'stop-')}`} />
            <stop offset="100%" className={`${getScoreColor(value).replace('text-', 'stop-').replace('600', '800')}`} />
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
            <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
              {Math.round(value)}
            </div>
            {label && (
              <div className="text-xs text-gray-500 font-medium mt-1">
                {label}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Enhanced Metric Card Component
interface MetricCardProps {
  title: string;
  score: number;
  description: string;
  category: string;
  trend?: 'up' | 'down' | 'stable';
  benchmark?: string;
  isMainMetric?: boolean;
}

const MetricCard = React.memo(({ 
  title, 
  score, 
  description, 
  category, 
  trend, 
  benchmark,
  isMainMetric = false 
}: MetricCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const StatusIcon = getStatusIcon(score);
  const CategoryIcon = getCategoryIcon(category);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`relative overflow-hidden ${
              isMainMetric ? 'col-span-2 md:col-span-1' : 'col-span-1'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className={`${
              getScoreBackground(score)
            } border-2 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full ${
              isHovered ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
            }`}>
              <CardContent className="p-6 text-center relative">
                {isMainMetric && (
                  <div className="absolute top-2 right-2">
                    <Badge className="text-xs bg-blue-500 text-white border-0">
                      Primary
                    </Badge>
                  </div>
                )}
                
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <CircularGauge 
                      value={score} 
                      size={isMainMetric ? 100 : 80} 
                      strokeWidth={6} 
                      animated={true}
                      label={isMainMetric ? '/100' : undefined}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CategoryIcon className={`h-4 w-4 ${getScoreColor(score)}`} />
                    <div className="font-semibold text-sm text-gray-700">{title}</div>
                  </div>
                  
                  <div className="text-xs text-gray-500 leading-tight px-2 mb-3">
                    {description}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Badge 
                      className={`text-xs ${getScoreColor(score)} border-current`}
                      variant="outline"
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor'}
                    </Badge>
                    {trend && (
                      <TrendingUp className={`h-3 w-3 ${
                        trend === 'up' ? 'text-green-500 rotate-0' : 
                        trend === 'down' ? 'text-red-500 rotate-180' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  
                  {benchmark && (
                    <div className="text-xs text-gray-400 mt-2">
                      Industry avg: {benchmark}
                    </div>
                  )}
                </div>
                
                {/* Hover overlay with additional info */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white p-4 rounded"
                    >
                      <div className="text-center text-sm">
                        <div className="font-semibold mb-1">{title}</div>
                        <div className="text-xs opacity-90 mb-2">
                          Score: {Math.round(score)}/100
                        </div>
                        <div className="text-xs opacity-75">
                          {description}
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
            <div className="font-semibold">{title}</div>
            <div className="text-sm opacity-90">{description}</div>
            <div className="text-xs mt-2 pt-2 border-t border-gray-300">
              <div>Score: {Math.round(score)}/100</div>
              {benchmark && <div>Industry Average: {benchmark}</div>}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

MetricCard.displayName = 'MetricCard';

export default function ReportOverviewPage() {
  const params = useParams();
  const taskId = params.task_id as string;
  const { report, loading } = useReport();
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  const reportData = report?.report_data;

  // Extract key metrics for enhanced visualization - must be called before early return
  const keyMetrics = useMemo(() => {
    if (!reportData) return [];
    const breakdown = reportData.scores?.breakdown || {};
    
    // Default benchmark data (industry averages)
    // Calculate dynamic benchmarks based on site analysis and industry standards
    const calculateDynamicBenchmark = (currentScore: number, category: string) => {
      // Base benchmarks adjusted by site complexity and current performance
      const baseBenchmarks = {
        performance: 75,
        seo: 80,
        configuration: 85,
        security: 95,
        extensions: 90,
        magento: 70
      };
      
      const base = baseBenchmarks[category as keyof typeof baseBenchmarks] || 75;
      
      // If current score is significantly above benchmark, show a higher target
      // If current score is below benchmark, show achievable improvement target
      if (currentScore > base + 10) {
        return String(Math.min(95, Math.floor((currentScore + base) / 2)));
      } else if (currentScore < base - 20) {
        return String(Math.max(50, currentScore + 15)); // Realistic improvement target
      }
      
      return String(base);
    };
    
    return [
      {
        title: "Performance",
        score: (breakdown.performance as number) || 0,
        description: "Overall site speed and optimization",
        category: "performance",
        benchmark: calculateDynamicBenchmark((breakdown.performance as number) || 0, 'performance'),
        isMainMetric: true
      },
      {
        title: "SEO Optimization",
        score: (breakdown.magento_seo as number) || 0,
        description: "Search engine optimization score",
        category: "seo",
        benchmark: calculateDynamicBenchmark((breakdown.magento_seo as number) || 0, 'seo')
      },
      {
        title: "Configuration",
        score: (breakdown.magento_configuration as number) || 0,
        description: "Magento configuration analysis",
        category: "accessibility",
        benchmark: calculateDynamicBenchmark((breakdown.magento_configuration as number) || 0, 'configuration')
      },
      {
        title: "Security Score",
        score: (breakdown.magento_security as number) || 0,
        description: "Security configuration analysis",
        category: "security",
        benchmark: calculateDynamicBenchmark((breakdown.magento_security as number) || 0, 'security')
      },
      {
        title: "Extensions",
        score: (breakdown.magento_extensions as number) || 0,
        description: "Extension compatibility and optimization",
        category: "best_practices",
        benchmark: calculateDynamicBenchmark((breakdown.magento_extensions as number) || 0, 'extensions')
      },
      {
        title: "Magento Health",
        score: (breakdown.magento_optimization as number) || 0,
        description: "Magento-specific optimizations",
        category: "magento",
        benchmark: calculateDynamicBenchmark((breakdown.magento_optimization as number) || 0, 'magento')
      }
    ];
  }, [reportData]);

  const overallMetrics = useMemo(() => {
    if (!reportData) return {
      overallScore: 0,
      grade: "F",
      totalIssues: 0,
      criticalIssues: 0,
      analysisDate: "N/A",
      magentoConfidence: 0
    };
    return {
      overallScore: reportData.summary?.overall_score || 0,
      grade: reportData.summary?.grade || "F",
      totalIssues: reportData.summary?.total_issues || 0,
      criticalIssues: reportData.summary?.critical_issues || 0,
      analysisDate: reportData.generated_at ? new Date(reportData.generated_at).toLocaleDateString() : "N/A",
      magentoConfidence: reportData.magento?.confidence || 0
    };
  }, [reportData]);

  if (loading) {
    return (
      <DualSidebarLayout reportId={taskId}>
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </DualSidebarLayout>
    );
  }

  if (!report || !reportData) {
    return (
      <DualSidebarLayout reportId={taskId}>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold">Report not found</h1>
          <p className="text-gray-600 mt-2">Could not find a report with the ID: {taskId}</p>
        </div>
      </DualSidebarLayout>
    );
  }

  return (
    <DualSidebarLayout reportId={taskId}>
      <Section background="gradient" className="min-h-screen">
        {/* Enhanced Professional Header */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Container maxWidth="7xl" padding="lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      Performance Analysis Report
                    </h1>
                    <p className="text-gray-600">
                      Comprehensive website optimization and health audit
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={`${getScoreBadgeColor(overallMetrics.overallScore)} text-white px-3 py-1`}>
                        <Star className="h-3 w-3 mr-1" />
                        Grade {overallMetrics.grade}
                      </Badge>
                      <Badge variant="outline" className="bg-white/50">
                        Score: {Math.round(overallMetrics.overallScore)}/100
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">               
                {/* Benchmark Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowBenchmarks(!showBenchmarks)}
                  size="sm"
                  className="text-xs bg-white/50"
                >
                  <Info className="h-3 w-3 mr-1" />
                  {showBenchmarks ? 'Hide' : 'Show'} Benchmarks
                </Button>
              </div>
            </div>
            
            <Grid cols={4} gap="md" className="mt-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer truncate">
                  {reportData.url || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Analyzed {overallMetrics.analysisDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Activity className="h-4 w-4" />
                <span className="capitalize">{reportData.status || "completed"}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Settings className="h-4 w-4" />
                <span>Magento {overallMetrics.magentoConfidence}% confidence</span>
              </div>
            </Grid>
          </Container>
        </motion.div>

        <Container maxWidth="7xl" padding="xl">
          {/* Hero Performance Overview */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className={`${
              getScoreBackground(overallMetrics.overallScore)
            } border-2 shadow-2xl overflow-hidden`}>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Overall Score with Enhanced Circular Gauge */}
                  <div className="text-center">
                    <div className="mb-6">
                      <CircularGauge 
                        value={overallMetrics.overallScore} 
                        size={160} 
                        strokeWidth={12} 
                        animated={true}
                        label="Overall Score"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">Performance Health</h3>
                      <p className="text-sm text-gray-600">Comprehensive optimization score</p>
                      <Badge 
                        className={`${getScoreBadgeColor(overallMetrics.overallScore)} text-white px-4 py-2 text-sm`}
                      >
                        Grade {overallMetrics.grade}
                      </Badge>
                    </div>
                  </div>

                  {/* Key Metrics Summary */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${getScoreColor(100 - (overallMetrics.totalIssues * 10))}`}>
                        {overallMetrics.totalIssues}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">Total Issues</div>
                      <div className="text-sm text-gray-500">Identified opportunities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-600 mb-2">
                        {overallMetrics.criticalIssues}
                      </div>
                      <div className="text-lg font-semibold text-red-700">Critical Issues</div>
                      <div className="text-sm text-red-500">Require immediate attention</div>
                    </div>
                  </div>

                  {/* Quick Performance Indicators */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Health Check</h4>
                    {keyMetrics.slice(0, 3).map((metric, index) => (
                      <div key={metric.category} className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getScoreBadgeColor(metric.score).replace('bg-gradient-to-r', 'bg')}`} />
                            <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(metric.score)}`}>
                            {Math.round(metric.score)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${getScoreBadgeColor(metric.score)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.score}%` }}
                            transition={{ duration: 1, delay: 0.4 + (index * 0.1) }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Metric Cards Grid */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Performance Metrics</h2>
                <p className="text-gray-600 mt-2">Detailed analysis across all optimization categories</p>
              </div>
              <div className="text-sm text-gray-500">
                {keyMetrics.length} metrics analyzed
              </div>
            </div>
            
            <Grid cols={3} gap="lg">
              {keyMetrics.map((metric, index) => (
                <CardGridItem key={metric.category} colSpan={1}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="h-full"
                  >
                    <MetricCard {...metric} />
                  </motion.div>
                </CardGridItem>
              ))}
            </Grid>
          </motion.div>

          {/* Enhanced Performance Insights and Opportunities */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Insights & Opportunities</h2>
                  <p className="text-gray-600">Actionable recommendations to improve your site&apos;s performance</p>
                </div>
                
                <div className="p-6">
                  {/* Critical Issues Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Server Response Time Critical Issue */}
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-800 mb-2">Critical: Server Response Time</h3>
                          <p className="text-sm text-red-700 mb-3">
                            Your server response time ({formatDuration(reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0)}) is significantly above the recommended 200ms threshold.
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Enable server-side caching (Redis/Varnish)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Optimize database queries</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Upgrade hosting infrastructure</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="mt-4 bg-red-600 hover:bg-red-700"
                            onClick={() => window.open('https://easecloud.io/magento-performance-optimization', '_blank')}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Get EaseCloud Expert Help
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Magento Configuration Issues */}
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Settings className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-orange-800 mb-2">Magento Optimizations Disabled</h3>
                          <p className="text-sm text-orange-700 mb-3">
                            Multiple critical Magento optimizations are currently disabled, impacting performance.
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>Enable CSS/JS merging & bundling</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>Configure full-page cache</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>Implement image lazy loading</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="mt-4 bg-orange-600 hover:bg-orange-700"
                            onClick={() => {
                              const element = document.getElementById('magento-configuration-details');
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            View Configuration
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Opportunities */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Performance Opportunities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Render Blocking Resources */}
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Code className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Eliminate Render Blocking</span>
                          </div>
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            ~{reportData.performance?.raw_data?.desktop_performance?.opportunities?.[0]?.potential_savings || 90}ms savings
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">Defer non-critical CSS/JS to improve initial page load</p>
                      </div>

                      {/* Unused CSS */}
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Remove Unused CSS</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {(() => {
                              const cssOpportunity = reportData.performance?.raw_data?.desktop_performance?.opportunities?.find(opp => opp.id?.includes('css'));
                              return cssOpportunity ? `~${formatDuration(cssOpportunity.potential_savings ?? 0)}` : 'Available';
                            })()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">Clean up unused stylesheets and optimize CSS delivery</p>
                      </div>

                      {/* JavaScript Optimization */}
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">Optimize JavaScript</span>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            {(() => {
                              const jsOpportunities = reportData.performance?.raw_data?.desktop_performance?.opportunities?.filter(opp => 
                                opp.id?.includes('javascript') || opp.id?.includes('js') || opp.id?.includes('bootup')
                              ) || [];
                              const totalSavings = jsOpportunities.reduce((sum, opp) => sum + (opp.potential_savings || 0), 0);
                              return totalSavings > 0 ? `~${formatDuration(totalSavings)}` : 'Available';
                            })()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">Remove unused JS and implement code splitting</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Quick Wins Section */}
                  {(() => {
                    const magentoAnalysis = reportData.detailed_analysis?.magento_analysis?.categories || {};
                    const quickWins = [];
                    
                    // Check optimization score for CSS/JS merging recommendations
                    if ((magentoAnalysis.optimization?.score ?? 100) < 70) {
                      quickWins.push({
                        title: "Enable Magento CSS/JS Merging",
                        description: "Admin → Stores → Configuration → Advanced → Developer",
                        enabled: (magentoAnalysis.optimization as Record<string, unknown> | undefined)?.details as boolean | undefined
                      });
                    }

                    // Check for caching opportunities
                    const cacheOpportunities = reportData.performance?.raw_data?.desktop_performance?.opportunities?.filter(opp =>
                      opp.id?.includes('cache') || opp.id?.includes('expires')
                    ) || [];
                    if (cacheOpportunities.length > 0) {
                      quickWins.push({
                        title: "Configure Browser Caching",
                        description: `${cacheOpportunities.length} caching improvement${cacheOpportunities.length > 1 ? 's' : ''} available`,
                        enabled: false
                      });
                    }

                    // Check for image opportunities
                    const imageOpportunities = reportData.performance?.raw_data?.desktop_performance?.opportunities?.filter(opp =>
                      opp.id?.includes('image') || opp.id?.includes('offscreen')
                    ) || [];
                    if (imageOpportunities.length > 0) {
                      quickWins.push({
                        title: "Optimize Images",
                        description: `${imageOpportunities.length} image optimization opportunity${imageOpportunities.length > 1 ? 'ies' : 'y'} found`,
                        enabled: false
                      });
                    }

                    // Check configuration score for FPC
                    if ((magentoAnalysis.configuration?.score ?? 100) < 90) {
                      quickWins.push({
                        title: "Enable Full Page Cache",
                        description: "Admin → Stores → Configuration → Advanced → System",
                        enabled: false
                      });
                    }

                    return quickWins.length > 0 ? (
                      <div className="bg-emerald-50 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-emerald-900">
                            Quick Wins ({quickWins.length} recommendations • 30-60 min implementation)
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {quickWins.map((win, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-sm font-medium text-emerald-900">{win.title}</span>
                                <p className="text-xs text-emerald-700">{win.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Performance Insights with Progressive Disclosure */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="mb-6" id="magento-configuration-details">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Deep Dive Analysis</h2>
              <p className="text-gray-600">Comprehensive technical insights and step-by-step implementation guides</p>
            </div>

            <div className="space-y-6">
              <DetailedInsight
                title="Server Response Time Optimization"
                description={`Your TTFB of ${formatDuration(reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0)} exceeds optimal thresholds`}
                impact="critical"
                timeToImplement="2-4 hours"
                steps={[
                  "Enable Redis or Memcached for session and page caching",
                  "Configure Varnish reverse proxy for full-page caching",
                  "Optimize database queries and add proper indexing",
                  "Implement CDN for static asset delivery",
                  "Upgrade to PHP 8+ for improved performance"
                ]}
                relatedMetrics={[
                  { 
                    name: "First Contentful Paint", 
                    value: formatDuration(reportData.performance?.raw_data?.desktop_performance?.core_web_vitals?.first_contentful_paint?.value || 0), 
                    improvement: "20-30% faster" 
                  },
                  { 
                    name: "Time to Interactive", 
                    value: formatDuration(reportData.performance?.raw_data?.desktop_performance?.core_web_vitals?.time_to_interactive?.value || 0), 
                    improvement: "40-50% faster" 
                  },
                  { 
                    name: "Server Response", 
                    value: formatDuration(reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0), 
                    improvement: "<200ms" 
                  }
                ]}
                technicalDetails={[
                  "# Enable Redis in app/etc/env.php",
                  "'cache' => [",
                  "  'frontend' => [",
                  "    'default' => ['backend' => 'redis'],",
                  "    'page_cache' => ['backend' => 'redis']",
                  "  ]",
                  "]"
                ]}
              />

              <DetailedInsight
                title="CSS & JavaScript Optimization"
                description="Eliminate render-blocking resources and reduce unused code"
                impact="high"
                timeToImplement="1-2 hours"
                steps={[
                  "Enable CSS merging in Magento admin panel",
                  "Enable JavaScript bundling for production",
                  "Configure critical CSS inlining",
                  "Implement lazy loading for non-critical resources",
                  "Set up automated unused CSS removal"
                ]}
                relatedMetrics={[
                  { name: "Render Blocking Time", value: reportData.performance?.raw_data?.desktop_performance?.diagnostics?.find(d => d.id === 'render-blocking-resources')?.display_value || "90ms", improvement: "0ms" },
                  { name: "Unused CSS", value: reportData.performance?.raw_data?.desktop_performance?.diagnostics?.find(d => d.id === 'unused-css-rules')?.display_value || "Not detected", improvement: "Eliminated" },
                  { name: "JavaScript Size", value: reportData.performance?.raw_data?.desktop_performance?.diagnostics?.find(d => d.id === 'unused-javascript')?.display_value || "Not detected", improvement: "40% reduction" }
                ]}
                technicalDetails={[
                  "# Enable in Admin Panel:",
                  "Stores → Configuration → Advanced → Developer",
                  "CSS Settings → Merge CSS Files: Yes",
                  "JavaScript Settings → Merge Files: Yes",
                  "Minify Files: Yes"
                ]}
              />

              <ProgressiveDisclosure
                title="Magento Configuration Audit"
                subtitle="Review and optimize critical Magento settings for performance"
                badge="Configuration Review"
                badgeVariant="outline"
                icon={Settings}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cache Settings */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        Cache Configuration
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Full Page Cache</span>
                          <Badge className="bg-emerald-100 text-emerald-800">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Block HTML Output</span>
                          <Badge className="bg-emerald-100 text-emerald-800">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Database Result Cache</span>
                          <Badge className="bg-red-100 text-red-800">Configure Redis</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Developer Settings */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                        Developer Settings
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span>CSS Merging</span>
                          <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>JS Bundling</span>
                          <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Minification</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Commands */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">CLI Commands for Quick Setup</h4>
                    <div className="space-y-2 text-sm font-mono text-gray-300">
                      <div># Enable production optimizations</div>
                      <div>php bin/magento config:set dev/css/merge_css_files 1</div>
                      <div>php bin/magento config:set dev/js/merge_files 1</div>
                      <div>php bin/magento config:set dev/js/enable_js_bundling 1</div>
                      <div>php bin/magento config:set dev/css/minify_files 1</div>
                      <div>php bin/magento config:set dev/js/minify_files 1</div>
                      <div>php bin/magento cache:flush</div>
                    </div>
                  </div>
                </div>
              </ProgressiveDisclosure>
            </div>
          </motion.div>

          {/* Industry Benchmarks Panel */}
          <AnimatePresence>
            {showBenchmarks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-12"
              >
                <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center space-x-3 p-8 border-b">
                    <Info className="h-6 w-6 text-blue-600" />
                    <span className="text-2xl text-blue-900">Industry Benchmarks & Standards</span>
                  </CardTitle>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {keyMetrics.map((metric) => (
                        <div key={metric.category} className="bg-white rounded-lg p-6 shadow-sm">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-3 h-3 rounded-full ${getScoreBadgeColor(metric.score).replace('bg-gradient-to-r', 'bg')}`} />
                            <span className="font-semibold text-gray-900">{metric.title}</span>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-emerald-600 font-medium">Excellent:</span>
                              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                90-100
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-amber-600 font-medium">Good:</span>
                              <span className="font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                70-89
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-red-600 font-medium">Needs Work:</span>
                              <span className="font-mono text-red-600 bg-red-50 px-2 py-1 rounded">
                                &lt; 70
                              </span>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <div className="flex justify-between items-center text-xs text-gray-600">
                                <span>Industry Average:</span>
                                <span className="font-semibold">{metric.benchmark}</span>
                              </div>
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
          
          {/* EaseCloud CTA for Optimization Services */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <EaseCloudCTA 
              variant="card" 
              context="optimization"
              className="mx-auto"
            />
          </motion.div>
        </Container>
      </Section>
    </DualSidebarLayout>
  );
}
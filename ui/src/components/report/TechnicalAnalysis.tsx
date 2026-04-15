'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Shield, Server, FileText, HardDrive, Activity, BarChart3, ChevronDown, ChevronUp, Code, Cpu, ExternalLinkIcon, ImageIcon, Layers, Lightbulb, Monitor, Search, Settings, Smartphone, X, Zap, Info, Timer, Database, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { Container, Section, Stack } from '../layout/GridSystem';
import Link from 'next/link';

// Enhanced utility functions with sophisticated color schemes and metrics
function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
}

function getScoreBackground(score: number): string {
  if (score >= 90) return "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200";
  if (score >= 70) return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200";
  if (score >= 50) return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200";
  return "bg-gradient-to-br from-red-50 to-red-100 border-red-200";
}

function getScoreBadgeColor(score: number): string {
  if (score >= 90) return "bg-gradient-to-r from-emerald-500 to-emerald-600";
  if (score >= 70) return "bg-gradient-to-r from-amber-500 to-amber-600";
  if (score >= 50) return "bg-gradient-to-r from-orange-500 to-orange-600";
  return "bg-gradient-to-r from-red-500 to-red-600";
}

function getStatusIcon(score: number): React.ComponentType<{className?: string}> {
  if (score >= 90) return CheckCircle;
  if (score >= 70) return AlertTriangle;
  return AlertCircle;
}

function getTechnicalIcon(metricType: string): React.ComponentType<{className?: string}> {
  const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
    server_response: Timer,
    security: Shield,
    optimization: Zap,
    seo: Search,
    database: Database,
    performance: Activity
  };
  return iconMap[metricType] || Info;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
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
  
  const getGradientId = (score: number, index: number = 0) => `technical-gauge-gradient-${score}-${index}`;
  const gradientId = getGradientId(value);
  
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

// Enhanced Technical Metric Card Component
interface TechnicalMetricCardProps {
  title: string;
  value: string | number;
  score: number;
  description: string;
  metricType: string;
  status: string;
  targetValue?: string;
  isMainMetric?: boolean;
}

const TechnicalMetricCard = React.memo(({ 
  title, 
  value, 
  score, 
  description, 
  metricType,
  status,
  targetValue,
  isMainMetric = false 
}: TechnicalMetricCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const StatusIcon = getStatusIcon(score);
  const MetricIcon = getTechnicalIcon(metricType);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="relative overflow-hidden w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className={`${
              getScoreBackground(score)
            } border-2 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full min-h-[280px] sm:min-h-[320px] flex flex-col ${
              isHovered ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
            }`}>
              <CardContent className="p-6 text-center relative flex-1 flex flex-col justify-between">
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
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MetricIcon className={`h-4 w-4 ${getScoreColor(score)}`} />
                    <div className="font-semibold text-sm text-gray-700">{title}</div>
                  </div>
                  
                  <div className={`text-2xl font-bold ${getScoreColor(score)} mb-1`}>
                    {typeof value === 'number' ? Math.round(value) : value}
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
                      {status}
                    </Badge>
                  </div>
                  
                  {targetValue && (
                    <div className="text-xs text-gray-400 mt-2">
                      Target: {targetValue}
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
                        {targetValue && (
                          <div className="text-xs opacity-75 mt-2">
                            Target: {targetValue}
                          </div>
                        )}
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
              <div>Current: {typeof value === 'number' ? Math.round(value) : value}</div>
              <div>Score: {Math.round(score)}/100</div>
              {targetValue && <div>Target: {targetValue}</div>}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

TechnicalMetricCard.displayName = 'TechnicalMetricCard';

export function TechnicalAnalysis({ reportData }: { reportData: any }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["critical"]))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
      if (newExpanded.has(section)) {
        newExpanded.delete(section)
      } else {
        newExpanded.add(section)
      }
      setExpandedSections(newExpanded)
  }

  return (
    <Section background="gradient" className="min-h-screen">
      {/* Enhanced Professional Header */}
      <motion.div 
        className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Container maxWidth="7xl" padding="lg">
          <Stack direction="row" align="center" gap="md">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Technical Analysis Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive technical performance and optimization analysis
              </p>
            </div>
          </Stack>
        </Container>
      </motion.div>

      <Container maxWidth="7xl" padding="lg">
        {/* Comprehensive Technical Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="shadow-2xl mb-8 border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
              <CardTitle className="text-xl flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                <span>Detailed Technical Analysis</span>
              </CardTitle>
            </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 bg-gray-50 rounded-none">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger value="magento" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Magento</span>
                </TabsTrigger>
                <TabsTrigger value="assets" className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Assets</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4" />
                  <span>Technical</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  {/* Enhanced Overview Metrics Grid with Interactive Gauges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                      {
                        title: "Server Response",
                        value: formatDuration(reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0),
                        score: Math.max(0, Math.min(100, (200 - (reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0)) / 2)),
                        description: "Time to First Byte analysis",
                        metricType: "server_response",
                        status: (reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0) < 200 ? "Excellent" : "Needs Improvement",
                        targetValue: "<200ms",
                        isMainMetric: true
                      },
                      {
                        title: "Security Score",
                        value: (reportData.detailed_analysis?.magento_analysis?.categories?.security?.score || 0).toFixed(1),
                        score: reportData.detailed_analysis?.magento_analysis?.categories?.security?.score || 0,
                        description: "Magento security configuration",
                        metricType: "security", 
                        status: (reportData.detailed_analysis?.magento_analysis?.categories?.security?.score || 0) >= 95 
                          ? "Excellent" 
                          : (reportData.detailed_analysis?.magento_analysis?.categories?.security?.score || 0) >= 80 
                          ? "Good" 
                          : (reportData.detailed_analysis?.magento_analysis?.categories?.security?.score || 0) >= 50 
                          ? "Needs Improvement" 
                          : "Critical",
                        targetValue: ">95"
                      },
                      {
                        title: "Optimization",
                        value: (reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.score || 0).toFixed(1),
                        score: reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.score || 0,
                        description: "Magento optimization analysis",
                        metricType: "optimization",
                        status: (reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.score || 0) >= 80 
                          ? "Excellent" 
                          : (reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.score || 0) >= 60 
                          ? "Good" 
                          : (reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.score || 0) >= 30 
                          ? "Needs Improvement" 
                          : "Critical",
                        targetValue: ">80"
                      },
                      {
                        title: "SEO Score",
                        value: (reportData.detailed_analysis?.magento_analysis?.categories?.seo?.score || 0).toFixed(1),
                        score: reportData.detailed_analysis?.magento_analysis?.categories?.seo?.score || 0,
                        description: "Search engine optimization",
                        metricType: "seo",
                        status: (reportData.detailed_analysis?.magento_analysis?.categories?.seo?.score || 0) >= 85 
                          ? "Excellent" 
                          : (reportData.detailed_analysis?.magento_analysis?.categories?.seo?.score || 0) >= 70 
                          ? "Good" 
                          : (reportData.detailed_analysis?.magento_analysis?.categories?.seo?.score || 0) >= 40 
                          ? "Needs Improvement" 
                          : "Critical",
                        targetValue: ">85"
                      }
                    ].map((metric, index) => (
                      <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="h-full"
                      >
                        <TechnicalMetricCard {...metric} />
                      </motion.div>
                    ))}
                  </div>


                  {/* Magento Detection Details */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Magento Detection Analysis</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {reportData.magento?.confidence || 0}% confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Detection Indicators</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(reportData.magento?.indicators || []).map((indicator: any, index: number) => (
                              <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{indicator}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Platform Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm font-medium">Platform</span>
                              <Badge variant="secondary">Magento 2.x</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm font-medium">Detection Confidence</span>
                              <Badge className="bg-blue-500 text-white">
                                {reportData.magento?.confidence || 0}%
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm font-medium">Version</span>
                              <span className="text-sm text-gray-600">
                                {reportData.magento?.version || "Not detected"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm font-medium">Indicators Found</span>
                              <Badge variant="outline">{reportData.magento?.indicators?.length || 0}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="mt-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Performance Scores Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full"
                      >
                        <Card className="border-blue-200 h-full">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Monitor className="h-5 w-5 text-blue-600" />
                              <span>Desktop Performance</span>
                            </CardTitle>
                          </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              {
                                name: "Performance",
                                score:
                                  reportData.performance?.raw_data?.desktop_performance?.performance_score || 0,
                              },
                              {
                                name: "Accessibility",
                                score:
                                  reportData.performance?.raw_data?.desktop_performance?.accessibility_score || 0,
                              },
                              {
                                name: "Best Practices",
                                score:
                                  reportData.performance?.raw_data?.desktop_performance?.best_practices_score || 0,
                              },
                              {
                                name: "SEO",
                                score: reportData.performance?.raw_data?.desktop_performance?.seo_score || 0,
                              },
                            ].map((metric) => (
                              <div key={metric.name} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{metric.name}</span>
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${getScoreBadgeColor(metric.score)}`}
                                      style={{ width: `${metric.score}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold ${getScoreColor(metric.score)} w-8 text-right`}>
                                    {metric.score.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full"
                      >
                        <Card className="border-orange-200 h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Smartphone className="h-5 w-5 text-orange-600" />
                            <span>Mobile Performance</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              {
                                name: "Performance",
                                score: reportData.performance?.raw_data?.mobile_performance?.performance_score || 0,
                              },
                              {
                                name: "Accessibility",
                                score:
                                  reportData.performance?.raw_data?.mobile_performance?.accessibility_score || 0,
                              },
                              {
                                name: "Best Practices",
                                score:
                                  reportData.performance?.raw_data?.mobile_performance?.best_practices_score || 0,
                              },
                              {
                                name: "SEO",
                                score: reportData.performance?.raw_data?.mobile_performance?.seo_score || 0,
                              },
                            ].map((metric) => (
                              <div key={metric.name} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{metric.name}</span>
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${getScoreBadgeColor(metric.score)}`}
                                      style={{ width: `${metric.score}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold ${getScoreColor(metric.score)} w-8 text-right`}>
                                    {metric.score.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* TTFB Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Server className="h-5 w-5" />
                          <span>Time to First Byte (TTFB) Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-3xl font-bold text-red-600 mb-2">
                              {formatDuration(reportData.performance.raw_data.ttfb_analysis.ttfb_ms)}
                            </div>
                            <div className="text-sm text-gray-600">Time to First Byte</div>
                            <div className="text-xs text-red-600 mt-1">Target: &lt;200ms</div>
                          </div>
                          <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div className="text-3xl font-bold text-emerald-600 mb-2">
                              {reportData.performance.raw_data.ttfb_analysis.status_code}
                            </div>
                            <div className="text-sm text-gray-600">HTTP Status Code</div>
                            <div className="text-xs text-emerald-600 mt-1">Success</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {formatBytes(reportData.performance.raw_data.ttfb_analysis.response_size)}
                            </div>
                            <div className="text-sm text-gray-600">Response Size</div>
                            <div className="text-xs text-blue-600 mt-1">Initial HTML</div>
                          </div>
                          <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div className="text-3xl font-bold text-emerald-600 mb-2">
                              {reportData.performance.raw_data.ttfb_analysis.redirect_count}
                            </div>
                            <div className="text-sm text-gray-600">Redirects</div>
                            <div className="text-xs text-emerald-600 mt-1">Optimal</div>
                          </div>
                        </div>
                        <Alert className="mt-4 border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription>
                            <strong>Server Response Time Issue:</strong> Your TTFB of{" "}
                            {formatDuration(reportData.performance.raw_data.ttfb_analysis.ttfb_ms)} exceeds
                            the recommended 200ms threshold. This indicates server-side performance issues that should
                            be addressed immediately.
                          </AlertDescription>
                        </Alert>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="magento" className="mt-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Magento Categories Overview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="grid grid-cols-1 md:grid-cols-5 gap-4"
                    >
                      {Object.entries(reportData.detailed_analysis.magento_analysis.categories).map(
                        ([key, category]: [string, any]) => (
                          <Card
                            key={key}
                            className={`${getScoreBackground((category as any)?.score)} border-2 hover:shadow-lg transition-shadow`}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="mb-3">
                                {key === "configuration" && <Settings className="h-10 w-10 mx-auto text-gray-600" />}
                                {key === "security" && <Shield className="h-10 w-10 mx-auto text-gray-600" />}
                                {key === "optimization" && <Zap className="h-10 w-10 mx-auto text-gray-600" />}
                                {key === "extensions" && <Layers className="h-10 w-10 mx-auto text-gray-600" />}
                                {key === "seo" && <Search className="h-10 w-10 mx-auto text-gray-600" />}
                              </div>
                              <div className="text-sm font-medium text-gray-900 mb-2">{(category as any)?.category}</div>
                              <div className={`text-3xl font-bold ${getScoreColor((category as any)?.score)} mb-2`}>
                                {((category as any)?.score || 0).toFixed(2)}
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </motion.div>

                    {/* Detailed Category Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="space-y-6"
                    >
                      {Object.entries(reportData.detailed_analysis.magento_analysis.categories).map(
                        ([key, category]: [string, any]) => (
                          <Card key={key} className="shadow-lg">
                            <CardHeader>
                              <CardTitle
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection(`magento-${key}`)}
                              >
                                <div className="flex items-center space-x-3">
                                  <span>{(category as any)?.category} Analysis</span>
                                  <Badge className={`${getScoreColor((category as any)?.score)} bg-transparent border`}>
                                    Score: {((category as any)?.score || 0).toFixed(2)}
                                  </Badge>
                                </div>
                                {expandedSections.has(`magento-${key}`) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </CardTitle>
                            </CardHeader>
                            {expandedSections.has(`magento-${key}`) && (
                              <CardContent>
                                <div className="space-y-6">
                                  {/* Configuration Details */}
                                  {category.details && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-4">Configuration Details</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(category.details).map(([detailKey, detailValue]) => (
                                          <div
                                            key={detailKey}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                          >
                                            <span className="text-sm font-medium capitalize">
                                              {detailKey.replace(/_/g, " ").replace(/has-/g, "")}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                              {typeof detailValue === "boolean" ? (
                                                <>
                                                  {detailValue ? (
                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                  ) : (
                                                    <X className="h-5 w-5 text-red-600" />
                                                  )}
                                                  <span
                                                    className={`text-sm font-medium ${detailValue ? "text-emerald-600" : "text-red-600"}`}
                                                  >
                                                    {detailValue ? "Enabled" : "Disabled"}
                                                  </span>
                                                </>
                                              ) : Array.isArray(detailValue) ? (
                                                <Badge variant="outline" className="text-xs">
                                                  {detailValue.length} items
                                                </Badge>
                                              ) : (
                                                <span className="text-sm text-gray-600 font-mono">
                                                  {String(detailValue)}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Recommendations */}
                                  {category.recommendations && category.recommendations.length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-4">Recommendations</h4>
                                      <div className="space-y-3">
                                        {category.recommendations.map((rec: any, index: number) => (
                                          <div
                                            key={index}
                                            className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                                          >
                                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <span className="text-sm text-blue-800">{rec}</span>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                                              onClick={() => {
                                                const ctaSection = document.getElementById('contact-cta-section')
                                                ctaSection?.scrollIntoView({ behavior: 'smooth' })
                                              }}
                                            >
                                              <ExternalLinkIcon className="h-3 w-3 mr-1" />
                                              Guide
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ),
                      )}
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="assets" className="mt-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Asset Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full"
                      >
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Code className="h-5 w-5 text-blue-600" />
                            <span>CSS Assets</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                              {reportData.performance?.raw_data?.asset_analysis?.css_assets?.summary?.total_count || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">CSS files loaded</div>
                            <Badge className={`text-xs mb-2 ${
                              reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.css_merged 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-orange-100 text-orange-800"
                            }`}>
                              {reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.css_merged 
                                ? "Merged & Compressed" 
                                : "Not Merged"}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.css_merged 
                                ? "Optimized configuration" 
                                : "Merging disabled - potential optimization"}
                            </div>
                          </div>
                        </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full"
                      >
                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-orange-600" />
                            <span>JavaScript Assets</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">
                              {reportData.performance?.raw_data?.asset_analysis?.js_assets?.summary?.total_count || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">JS files loaded</div>
                            <Badge className={`text-xs mb-2 ${
                              reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.js_merged && 
                              reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.js_bundling
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-orange-100 text-orange-800"
                            }`}>
                              {formatBytes(reportData.performance?.raw_data?.desktop_performance?.page_stats?.total_byte_weight * 0.15 || 200000)} JS
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.js_merged && 
                               reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.js_bundling
                                ? "Merged & bundled" 
                                : "Merging & bundling disabled"}
                            </div>
                          </div>
                        </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="h-full"
                      >
                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <ImageIcon className="h-5 w-5 text-emerald-600" />
                            <span>Images</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-emerald-600 mb-2">
                              {
                                reportData.detailed_analysis.magento_analysis.categories.optimization
                                  .details.total_images
                              }
                            </div>
                            <div className="text-sm text-gray-600 mb-3">images loaded</div>
                            <Badge className={`text-xs mb-2 ${
                              reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.lazy_loaded_images > 0
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-orange-100 text-orange-800"
                            }`}>
                              {formatBytes(reportData.performance?.raw_data?.desktop_performance?.page_stats?.total_byte_weight * 0.4 || 500000)} images
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {reportData.detailed_analysis?.magento_analysis?.categories?.optimization?.details?.lazy_loaded_images > 0
                                ? "Lazy loading implemented" 
                                : "No lazy loading implemented"}
                            </div>
                          </div>
                        </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Asset Optimization Details */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Card>
                      <CardHeader>
                        <CardTitle>Asset Optimization Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">Current Status</h4>
                            <div className="space-y-3">
                              {[
                                {
                                  name: "CSS Merging",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.css_merged,
                                  impact: "High",
                                },
                                {
                                  name: "JS Merging",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.js_merged,
                                  impact: "High",
                                },
                                {
                                  name: "JS Bundling",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.js_bundling,
                                  impact: "High",
                                },
                                {
                                  name: "GZIP Compression",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.gzip_enabled,
                                  impact: "Medium",
                                },
                                {
                                  name: "Browser Caching",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.browser_caching,
                                  impact: "Medium",
                                },
                                {
                                  name: "CDN Usage",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.cdn_usage,
                                  impact: "High",
                                },
                              ].map((item) => (
                                <div
                                  key={item.name}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {item.impact} impact
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {item.enabled ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 font-medium">Enabled</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">Disabled</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">Image Optimization</h4>
                            <div className="space-y-3">
                              {[
                                {
                                  name: "Total Images",
                                  value:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.total_images,
                                },
                                {
                                  name: "Lazy Loaded",
                                  value:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.lazy_loaded_images,
                                },
                                {
                                  name: "Responsive Images",
                                  value:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.responsive_images,
                                },
                                {
                                  name: "Modern Format",
                                  value:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.modern_format_images,
                                },
                                {
                                  name: "Oversized Images",
                                  value:
                                    reportData.detailed_analysis.magento_analysis.categories.optimization
                                      .details.oversized_images,
                                },
                              ].map((item) => (
                                <div
                                  key={item.name}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <span className="text-sm font-medium">{item.name}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-gray-900">{item.value}</span>
                                    {item.name !== "Total Images" && item.value === 0 && (
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Alert className="mt-6 border-yellow-200 bg-yellow-50">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription>
                            <strong>Asset Optimization Opportunities:</strong> Multiple critical optimizations are
                            disabled including CSS/JS merging, bundling, and image lazy loading. Enabling these features
                            could significantly improve your site&apos;s performance.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Security Overview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-emerald-800">
                          <Shield className="h-6 w-6" />
                          <span>Security Status: Excellent</span>
                          <Badge className="bg-emerald-500 text-white">
                            {(reportData.detailed_analysis.magento_analysis.categories.security.score || 0).toFixed(2)}/100
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">Security Headers</h4>
                            <div className="space-y-3">
                              {[
                                {
                                  name: "X-Frame-Options",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.security
                                      .details["has_X-Frame-Options"],
                                },
                                {
                                  name: "X-Content-Type-Options",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.security
                                      .details["has_X-Content-Type-Options"],
                                },
                                {
                                  name: "X-XSS-Protection",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.security
                                      .details["has_X-XSS-Protection"],
                                },
                              ].map((header) => (
                                <div
                                  key={header.name}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200"
                                >
                                  <span className="text-sm font-medium">{header.name}</span>
                                  <div className="flex items-center space-x-2">
                                    {header.enabled ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 font-medium">Active</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">Missing</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">Application Security</h4>
                            <div className="space-y-3">
                              {[
                                {
                                  name: "Admin Path Security",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.security
                                      .details.admin_path_secure,
                                },
                                {
                                  name: "CSRF Protection",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.security
                                      .details.csrf_protection,
                                },
                                {
                                  name: "Secure Cookies",
                                  enabled:
                                    reportData.detailed_analysis.magento_analysis.categories.security
                                      .details.secure_cookies,
                                },
                              ].map((feature) => (
                                <div
                                  key={feature.name}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200"
                                >
                                  <span className="text-sm font-medium">{feature.name}</span>
                                  <div className="flex items-center space-x-2">
                                    {feature.enabled ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 font-medium">Enabled</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">Disabled</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Alert className="mt-6 border-emerald-200 bg-emerald-50">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <AlertDescription>
                            <strong>Excellent Security Configuration:</strong> Your Magento installation has all
                            critical security measures in place. All security headers are properly configured and
                            application-level protections are active.
                          </AlertDescription>
                        </Alert>

                        {/* Security Recommendations */}
                        {reportData.detailed_analysis.magento_analysis.categories.security.recommendations
                          .length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Additional Security Recommendations</h4>
                            <div className="space-y-2">
                              {reportData.detailed_analysis.magento_analysis.categories.security.recommendations.map(
                                (rec: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                  >
                                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-blue-800">{rec}</span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="technical" className="mt-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Server Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full"
                      >
                        <Card className="h-full">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Server className="h-5 w-5" />
                              <span>Server Information</span>
                            </CardTitle>
                          </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">Server</span>
                              <span className="font-medium">
                                {reportData.technical_insights?.server_info?.server || 
                                 reportData.detailed_analysis?.performance_analysis?.comprehensive?.categories?.server_configuration?.details?.server_header || 
                                 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">Content Type</span>
                              <span className="font-medium text-xs">
                                {reportData.technical_insights?.server_info?.content_type || 
                                 reportData.detailed_analysis?.performance_analysis?.comprehensive?.categories?.server_configuration?.details?.content_type || 
                                 'text/html; charset=UTF-8'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">Response Size</span>
                              <span className="font-medium">
                                {formatBytes(reportData.performance.raw_data.ttfb_analysis.response_size)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">Final URL</span>
                              <Link href={reportData.performance?.raw_data?.ttfb_analysis?.final_url} target="_blank" rel="noopener noreferrer" className="font-medium text-xs text-blue-600">
                                {reportData.performance?.raw_data?.ttfb_analysis?.final_url || reportData.url || 'N/A'}
                              </Link>
                            </div>
                          </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full"
                      >
                        <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Layers className="h-5 w-5" />
                            <span>Detected Technologies</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {reportData.technical_insights?.detected_technologies?.map((tech: string, index: number) => (
                                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                  {tech === "Magento 2.x" && <Settings className="h-3 w-3" />}
                                  {tech === "RequireJS" && <Code className="h-3 w-3" />}
                                  {tech === "Cloudflare" && <Server className="h-3 w-3" />}
                                  {!["Magento 2.x", "RequireJS", "Cloudflare"].includes(tech) && <Code className="h-3 w-3" />}
                                  <span>{tech}</span>
                                </Badge>
                              )) || (
                                // Fallback if technical_insights.detected_technologies is not available
                                <>
                                  <Badge variant="secondary" className="flex items-center space-x-1">
                                    <Settings className="h-3 w-3" />
                                    <span>Magento 2.x</span>
                                  </Badge>
                                  {reportData.magento?.indicators?.some((indicator: string) => indicator.includes("RequireJS") || indicator.includes("requirejs")) && (
                                    <Badge variant="secondary" className="flex items-center space-x-1">
                                      <Code className="h-3 w-3" />
                                      <span>RequireJS</span>
                                    </Badge>
                                  )}
                                  {(reportData.technical_insights?.server_info?.server?.toLowerCase().includes('cloudflare') || 
                                    reportData.detailed_analysis?.performance_analysis?.comprehensive?.categories?.server_configuration?.details?.server_header?.toLowerCase().includes('cloudflare')) && (
                                    <Badge variant="secondary" className="flex items-center space-x-1">
                                      <Server className="h-3 w-3" />
                                      <span>Cloudflare</span>
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Extension Analysis</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm text-gray-600">Detected Extensions</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge variant="outline" className="text-xs cursor-pointer">
                                        {
                                          reportData.detailed_analysis.magento_analysis
                                            .categories.extensions.details.detected_extensions_signatures
                                            .length
                                        }
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64">
                                      {reportData.detailed_analysis.magento_analysis.categories.extensions.details.detected_extensions_signatures.map(
                                        (ext: any, i: number) => (
                                          <DropdownMenuItem key={i} className="truncate">
                                            {ext}
                                          </DropdownMenuItem>
                                        )
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm text-gray-600">Performance Issues</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge className="bg-emerald-500 text-white text-xs cursor-pointer">
                                        {
                                          reportData.detailed_analysis.magento_analysis
                                            .categories.extensions.details.known_performance_offenders
                                            .length
                                        }
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64">
                                      {reportData.detailed_analysis.magento_analysis.categories.extensions.details.known_performance_offenders.map(
                                        (offender: any, i: number) => (
                                          <DropdownMenuItem key={i} className="truncate">
                                            {offender}
                                          </DropdownMenuItem>
                                        )
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Page Statistics */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Page Statistics</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {reportData.technical_insights?.page_stats?.desktop?.dom_size || 
                               reportData.performance?.raw_data?.desktop_performance?.page_stats?.dom_size || 
                               'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">DOM Elements</div>
                            <div className="text-xs text-gray-500 mt-1">Desktop</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-3xl font-bold text-orange-600 mb-2">
                              {reportData.technical_insights?.page_stats?.mobile?.dom_size || 
                               reportData.performance?.raw_data?.mobile_performance?.page_stats?.dom_size || 
                               'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">DOM Elements</div>
                            <div className="text-xs text-gray-500 mt-1">Mobile</div>
                          </div>
                          <div className="text-center p-4 bg-emerald-50 rounded-lg">
                            <div className="text-3xl font-bold text-emerald-600 mb-2">
                              {formatBytes(reportData.technical_insights?.page_stats?.desktop?.total_byte_weight || 
                                          reportData.performance?.raw_data?.desktop_performance?.page_stats?.total_byte_weight || 
                                          0)}
                            </div>
                            <div className="text-sm text-gray-600">Page Weight</div>
                            <div className="text-xs text-gray-500 mt-1">Desktop</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                              {formatBytes(reportData.technical_insights?.page_stats?.mobile?.total_byte_weight || 
                                          reportData.performance?.raw_data?.mobile_performance?.page_stats?.total_byte_weight || 
                                          0)}
                            </div>
                            <div className="text-sm text-gray-600">Page Weight</div>
                            <div className="text-xs text-gray-500 mt-1">Mobile</div>
                          </div>
                        </div>
                      </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        </motion.div>
      </Container>
    </Section>
  );
}
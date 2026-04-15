'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge'; // unused
import { Button } from '@/components/ui/button';
import {
  LineChart,
  // TrendingUp, // unused
  ArrowUp,
  ArrowDown,
  Minus,
  Activity
} from 'lucide-react';

interface PerformanceDataPoint {
  timestamp: number;
  date: string;
  performance: number;
  seo: number;
  security: number;
  accessibility: number;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

interface ComparisonPeriod {
  id: string;
  name: string;
  data: PerformanceDataPoint[];
  color: string;
  description: string;
}

interface PerformanceComparisonChartsProps {
  currentData: PerformanceDataPoint[];
  comparisonPeriods: ComparisonPeriod[];
  className?: string;
}

// Interactive line chart component
const InteractiveLineChart: React.FC<{
  data: ComparisonPeriod[];
  metric: keyof PerformanceDataPoint;
  title: string;
  unit?: string;
  target?: number;
  height?: number;
}> = ({ data, metric, title, unit = '', target, height = 300 }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<Set<number>>(new Set(data.map((_, i) => i)));

  const chartWidth = 600;
  const chartHeight = height;
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const chartInnerWidth = chartWidth - padding.left - padding.right;
  const chartInnerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const allValues = data.flatMap(period => 
    period.data.map(point => point[metric] as number).filter(v => typeof v === 'number')
  );
  const minValue = Math.min(...allValues, target || 0);
  const maxValue = Math.max(...allValues, target || 0);
  const valueRange = maxValue - minValue || 1;

  const createPath = (points: PerformanceDataPoint[], seriesIndex: number) => {
    if (!visibleSeries.has(seriesIndex)) return '';
    
    return points.map((point, index) => {
      const x = padding.left + (index / (points.length - 1)) * chartInnerWidth;
      const y = padding.top + ((maxValue - (point[metric] as number)) / valueRange) * chartInnerHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const toggleSeries = (index: number) => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(index)) {
      newVisible.delete(index);
    } else {
      newVisible.add(index);
    }
    setVisibleSeries(newVisible);
  };

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Compare performance across different time periods</p>
        </div>
        {target && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Target</div>
            <div className="text-lg font-semibold text-blue-600">{target}{unit}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {data.map((period, index) => (
          <button
            key={period.id}
            onClick={() => toggleSeries(index)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-all ${
              visibleSeries.has(index) 
                ? 'border-current bg-white shadow-sm' 
                : 'border-gray-200 bg-gray-50 opacity-50'
            }`}
            style={{ color: visibleSeries.has(index) ? period.color : '#6b7280' }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: period.color }}
            />
            <span className="text-sm font-medium">{period.name}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="min-w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const value = minValue + (valueRange * ratio);
            const y = padding.top + (1 - ratio) * chartInnerHeight;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {value.toFixed(0)}{unit}
                </text>
              </g>
            );
          })}

          {/* Target line */}
          {target && (
            <line
              x1={padding.left}
              y1={padding.top + ((maxValue - target) / valueRange) * chartInnerHeight}
              x2={chartWidth - padding.right}
              y2={padding.top + ((maxValue - target) / valueRange) * chartInnerHeight}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.7"
            />
          )}

          {/* Data series */}
          {data.map((period, seriesIndex) => {
            if (!visibleSeries.has(seriesIndex)) return null;
            
            const pathData = createPath(period.data, seriesIndex);
            
            return (
              <g key={period.id}>
                {/* Area under curve */}
                <defs>
                  <linearGradient id={`gradient-${period.id}-${metric.toString()}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={period.color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={period.color} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                
                {pathData && (
                  <path
                    d={`${pathData} L ${chartWidth - padding.right} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`}
                    fill={`url(#gradient-${period.id}-${metric.toString()})`}
                  />
                )}
                
                {/* Main line */}
                {pathData && (
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: seriesIndex * 0.2 }}
                    d={pathData}
                    fill="none"
                    stroke={period.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                
                {/* Data points */}
                {period.data.map((point, pointIndex) => {
                  const x = padding.left + (pointIndex / (period.data.length - 1)) * chartInnerWidth;
                  const y = padding.top + ((maxValue - (point[metric] as number)) / valueRange) * chartInnerHeight;
                  const isHovered = hoveredPoint?.seriesIndex === seriesIndex && hoveredPoint?.pointIndex === pointIndex;
                  
                  return (
                    <circle
                      key={pointIndex}
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 4}
                      fill={period.color}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all duration-200"
                      onMouseEnter={() => setHoveredPoint({ seriesIndex, pointIndex })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Hover tooltip */}
          {hoveredPoint && (
            <g>
              {(() => {
                const period = data[hoveredPoint.seriesIndex];
                const point = period.data[hoveredPoint.pointIndex];
                const x = padding.left + (hoveredPoint.pointIndex / (period.data.length - 1)) * chartInnerWidth;
                const y = padding.top + ((maxValue - (point[metric] as number)) / valueRange) * chartInnerHeight;
                
                return (
                  <g>
                    <rect
                      x={x + 10}
                      y={y - 25}
                      width="120"
                      height="40"
                      fill="rgba(0,0,0,0.8)"
                      rx="4"
                    />
                    <text
                      x={x + 70}
                      y={y - 12}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="bold"
                    >
                      {period.name}
                    </text>
                    <text
                      x={x + 70}
                      y={y - 2}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                    >
                      {(point[metric] as number).toFixed(1)}{unit}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* Performance insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.filter((_, index) => visibleSeries.has(index)).map((period) => {
          const values = period.data.map(point => point[metric] as number);
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          const trend = values[values.length - 1] - values[0];
          const improvement = ((values[values.length - 1] - values[0]) / values[0]) * 100;
          
          return (
            <div key={period.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: period.color }}
                />
                <span className="font-medium text-gray-900">{period.name}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{average.toFixed(1)}{unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trend:</span>
                  <div className="flex items-center space-x-1">
                    {trend > 0 && <ArrowUp className="h-3 w-3 text-green-500" />}
                    {trend < 0 && <ArrowDown className="h-3 w-3 text-red-500" />}
                    {trend === 0 && <Minus className="h-3 w-3 text-gray-400" />}
                    <span className={`font-medium ${
                      trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Performance heatmap for multiple metrics
const PerformanceHeatmap: React.FC<{
  data: ComparisonPeriod[];
  metrics: Array<{ key: keyof PerformanceDataPoint; name: string; good: number; poor: number; }>;
}> = ({ data, metrics }) => {
  const getHeatmapColor = (value: number, good: number, poor: number) => {
    const normalized = (value - poor) / (good - poor);
    const clamped = Math.max(0, Math.min(1, normalized));
    
    if (clamped >= 0.8) return 'bg-green-500';
    if (clamped >= 0.6) return 'bg-green-400';
    if (clamped >= 0.4) return 'bg-yellow-400';
    if (clamped >= 0.2) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getTextColor = (value: number, good: number, poor: number) => {
    const normalized = (value - poor) / (good - poor);
    const clamped = Math.max(0, Math.min(1, normalized));
    return clamped >= 0.4 ? 'text-white' : 'text-gray-900';
  };

  return (
    <Card className="shadow-xl border-0">
      <CardTitle className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-purple-600" />
          <span className="text-xl">Performance Heatmap</span>
        </div>
      </CardTitle>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header */}
            <div className="grid grid-cols-1 gap-4 mb-4" style={{ gridTemplateColumns: '200px repeat(' + data.length + ', 120px)' }}>
              <div className="font-semibold text-gray-900">Metric</div>
              {data.map((period) => (
                <div key={period.id} className="text-center">
                  <div className="font-semibold text-gray-900">{period.name}</div>
                  <div className="text-xs text-gray-500">{period.description}</div>
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {metrics.map((metric) => (
              <motion.div
                key={metric.key.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 gap-4 mb-2"
                style={{ gridTemplateColumns: '200px repeat(' + data.length + ', 120px)' }}
              >
                <div className="flex items-center font-medium text-gray-900">
                  {metric.name}
                </div>
                {data.map((period) => {
                  const values = period.data.map(point => point[metric.key] as number);
                  const average = values.reduce((a, b) => a + b, 0) / values.length;
                  const latest = values[values.length - 1];
                  const change = latest - values[0];
                  
                  return (
                    <div
                      key={period.id}
                      className={`relative p-3 rounded-lg text-center transition-all hover:scale-105 ${
                        getHeatmapColor(average, metric.good, metric.poor)
                      } ${getTextColor(average, metric.good, metric.poor)}`}
                    >
                      <div className="font-semibold text-lg">
                        {average.toFixed(1)}
                      </div>
                      <div className="text-xs opacity-90 flex items-center justify-center space-x-1">
                        {change > 0 && <ArrowUp className="h-3 w-3" />}
                        {change < 0 && <ArrowDown className="h-3 w-3" />}
                        {change === 0 && <Minus className="h-3 w-3" />}
                        <span>{change > 0 ? '+' : ''}{change.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Needs Improvement</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-sm text-gray-600">Fair</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Good</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
const PerformanceComparisonCharts: React.FC<PerformanceComparisonChartsProps> = ({
  comparisonPeriods,
  className = ""
}) => {
  const [activeView, setActiveView] = useState<'trends' | 'heatmap'>('trends');
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(['performance', 'loadTime', 'firstContentfulPaint', 'largestContentfulPaint'])
  );

  const availableMetrics = [
    { key: 'performance' as keyof PerformanceDataPoint, name: 'Performance Score', unit: '', good: 90, poor: 0 },
    { key: 'seo' as keyof PerformanceDataPoint, name: 'SEO Score', unit: '', good: 90, poor: 0 },
    { key: 'security' as keyof PerformanceDataPoint, name: 'Security Score', unit: '', good: 95, poor: 0 },
    { key: 'accessibility' as keyof PerformanceDataPoint, name: 'Accessibility Score', unit: '', good: 90, poor: 0 },
    { key: 'loadTime' as keyof PerformanceDataPoint, name: 'Load Time', unit: 'ms', good: 1000, poor: 5000 },
    { key: 'firstContentfulPaint' as keyof PerformanceDataPoint, name: 'First Contentful Paint', unit: 'ms', good: 1000, poor: 3000 },
    { key: 'largestContentfulPaint' as keyof PerformanceDataPoint, name: 'Largest Contentful Paint', unit: 'ms', good: 2000, poor: 4000 },
    { key: 'cumulativeLayoutShift' as keyof PerformanceDataPoint, name: 'Cumulative Layout Shift', unit: '', good: 0.1, poor: 0.25 }
  ];

  const toggleMetric = (metricKey: string) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(metricKey)) {
      newSelected.delete(metricKey);
    } else {
      newSelected.add(metricKey);
    }
    setSelectedMetrics(newSelected);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Comparison Analysis</h2>
          <p className="text-gray-600">Compare performance metrics across different time periods and identify trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-white rounded-lg border p-1">
            <Button
              size="sm"
              variant={activeView === 'trends' ? "default" : "ghost"}
              onClick={() => setActiveView('trends')}
              className="text-xs"
            >
              <LineChart className="h-4 w-4 mr-1" />
              Trends
            </Button>
            <Button
              size="sm"
              variant={activeView === 'heatmap' ? "default" : "ghost"}
              onClick={() => setActiveView('heatmap')}
              className="text-xs"
            >
              <Activity className="h-4 w-4 mr-1" />
              Heatmap
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Selection */}
      {activeView === 'trends' && (
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Select Metrics to Compare</h3>
          <div className="flex flex-wrap gap-2">
            {availableMetrics.map((metric) => (
              <button
                key={metric.key.toString()}
                onClick={() => toggleMetric(metric.key.toString())}
                className={`px-3 py-1 rounded-lg border text-sm transition-all ${
                  selectedMetrics.has(metric.key.toString())
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {metric.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <AnimatePresence mode="wait">
        {activeView === 'trends' ? (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {availableMetrics
              .filter(metric => selectedMetrics.has(metric.key.toString()))
              .map((metric) => (
                <InteractiveLineChart
                  key={metric.key.toString()}
                  data={comparisonPeriods}
                  metric={metric.key}
                  title={metric.name}
                  unit={metric.unit}
                  target={metric.key === 'performance' ? 90 : metric.key === 'loadTime' ? 2000 : undefined}
                />
              ))}
          </motion.div>
        ) : (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PerformanceHeatmap
              data={comparisonPeriods}
              metrics={availableMetrics}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceComparisonCharts;
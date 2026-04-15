'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Target,
  AlertTriangle,
  Star,
  TrendingUp,
  Zap,
  Clock,
  CheckCircle,
  Route,
  Calendar,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
}


// Enhanced Timeline Item Component
interface TimelineItemProps {
  title: string;
  description?: string;
  impact: string;
  time: string;
  priority: 'critical' | 'high' | 'medium';
  status: 'pending' | 'in-progress' | 'completed';
  phase: 'immediate' | 'short-term' | 'long-term';
  isLast?: boolean;
}

const TimelineItem = React.memo(({ title, description, impact, time, priority, status, phase, isLast = false }: TimelineItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const phaseColors = {
    immediate: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', accent: 'bg-red-500', icon: AlertTriangle },
    'short-term': { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', accent: 'bg-orange-500', icon: Zap },
    'long-term': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', accent: 'bg-blue-500', icon: TrendingUp }
  };
  
  const statusIcons = {
    pending: Clock,
    'in-progress': TrendingUp,
    completed: CheckCircle
  };
  
  const phaseConfig = phaseColors[phase];
  const StatusIcon = statusIcons[status];
  const PhaseIcon = phaseConfig.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02, x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Timeline connector */}
            {!isLast && (
              <div className="absolute left-6 top-12 w-px h-16 bg-gray-300" />
            )}
            
            {/* Timeline item */}
            <div className={`relative flex items-start space-x-4 p-4 rounded-lg border-2 ${phaseConfig.bg} transition-all duration-300 ${
              isHovered ? 'shadow-lg ring-2 ring-blue-400 ring-opacity-50' : 'shadow-sm'
            }`}>
              {/* Timeline dot */}
              <div className={`relative z-10 w-12 h-12 ${phaseConfig.accent} rounded-full flex items-center justify-center shadow-lg`}>
                <PhaseIcon className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-semibold ${phaseConfig.text} pr-4`}>{title}</h4>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <StatusIcon className={`h-4 w-4 ${
                      status === 'completed' ? 'text-green-600' : status === 'in-progress' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <Badge 
                      className={`text-xs ${
                        priority === 'critical' ? 'bg-red-100 text-red-800' : 
                        priority === 'high' ? 'bg-orange-100 text-orange-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}
                      variant="outline"
                    >
                      {priority}
                    </Badge>
                  </div>
                </div>
                
                {description && (
                  <p className="text-sm text-gray-600 mb-3">{description}</p>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-700 font-medium">{impact}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">{time}</span>
                  </div>
                </div>
                
                {/* Hover overlay with additional details */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-3 p-3 bg-white/90 rounded-md border border-gray-200 backdrop-blur-sm"
                    >
                      <div className="text-xs text-gray-700">
                        <strong>Status:</strong> {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        <br />
                        <strong>Priority:</strong> {priority.replace(/\b\w/g, l => l.toUpperCase())}
                        <br />
                        <strong>Expected Impact:</strong> {impact}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">{title}</div>
            {description && <div className="text-sm opacity-90">{description}</div>}
            <div className="text-xs mt-2 pt-2 border-t border-gray-300">
              <div>Impact: {impact}</div>
              <div>Timeline: {time}</div>
              <div>Status: {status.replace('-', ' ')}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

TimelineItem.displayName = 'TimelineItem';

export function OptimizationRoadmap({ reportData }: { reportData: any }) {
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'immediate' | 'short-term' | 'long-term'>('all');
  
  // Filter state for SearchFilter component
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('relevance');
  
  // Generate roadmap items dynamically from report data
  const generateRoadmapItems = useMemo(() => {
    const items: any[] = [];
    
    // Get performance opportunities from the report
    const desktopOpportunities = reportData.performance?.raw_data?.desktop_performance?.opportunities || [];
    const mobileOpportunities = reportData.performance?.raw_data?.mobile_performance?.opportunities || [];
    
    // Get Magento analysis details
    const magentoAnalysis = reportData.detailed_analysis?.magento_analysis?.categories || {};
    
    // Server Response Time - Critical if TTFB is high
    const ttfb = reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0;
    if (ttfb > 300) {
      items.push({
        title: "Reduce Server Response Time",
        description: `Current TTFB: ${formatDuration(ttfb)}. Critical infrastructure optimization needed.`,
        impact: `Save ${formatDuration(ttfb - 200)}${ttfb > 1000 ? ' (Critical)' : ''}`,
        time: ttfb > 1000 ? "3-5 days" : "1-3 days",
        priority: 'critical' as const,
        status: 'pending' as const,
        phase: 'immediate' as const
      });
    }
    
    // CSS/JS Optimization - Based on optimization analysis
    const optimization = magentoAnalysis.optimization;
    if (optimization && optimization.score < 50) {
      if (!optimization.details?.css_merged) {
        items.push({
          title: "Enable CSS/JS Merging",
          description: "Combine multiple CSS and JavaScript files to reduce HTTP requests and improve loading speed.",
          impact: "+8-15 performance score",
          time: "1-2 days",
          priority: 'high' as const,
          status: 'pending' as const,
          phase: 'short-term' as const
        });
      }
      
      if (!optimization.details?.js_bundling) {
        items.push({
          title: "Implement JS Bundling",
          description: "Bundle JavaScript modules and enable code splitting for optimal resource loading.",
          impact: "+12-18 performance score", 
          time: "3-5 days",
          priority: 'high' as const,
          status: 'pending' as const,
          phase: 'short-term' as const
        });
      }
    }
    
    // SEO Fixes - Based on SEO score and recommendations
    const seoScore = magentoAnalysis.seo?.score || 0;
    const seoRecommendations = magentoAnalysis.seo?.recommendations || [];
    if (seoScore < 70) {
      items.push({
        title: "Improve SEO Configuration",
        description: seoRecommendations.length > 0 
          ? `Address ${seoRecommendations.length} SEO issues: ${seoRecommendations.slice(0, 2).join(', ')}${seoRecommendations.length > 2 ? '...' : ''}`
          : "Implement missing meta tags, sitemaps, and structured data for better search visibility.",
        impact: `Improve from ${seoScore}% to ${Math.min(90, seoScore + 25)}% SEO score`,
        time: seoRecommendations.length > 5 ? "1-2 weeks" : seoScore < 30 ? "3-5 days" : "1-2 days",
        priority: seoScore < 30 ? 'critical' : seoScore < 50 ? 'high' : 'medium' as const,
        status: 'pending' as const,
        phase: seoScore < 40 ? 'immediate' : 'short-term' as const
      });
    }
    
    // Image Optimization - Based on opportunities with actual savings
    const imageOpportunities = [...desktopOpportunities, ...mobileOpportunities].filter(opp => 
      opp.id?.includes('image') || opp.id?.includes('offscreen') || opp.id?.includes('responsive')
    );
    if (imageOpportunities.length > 0) {
      const totalImageSavings = imageOpportunities.reduce((sum, opp) => sum + (opp.potential_savings || 0), 0);
      items.push({
        title: "Optimize Image Delivery",
        description: `Implement lazy loading, modern formats (WebP/AVIF), and responsive sizing. ${imageOpportunities.length} optimization opportunities found.`,
        impact: totalImageSavings > 0 ? `Save ${formatDuration(totalImageSavings)}` : "Improve loading performance",
        time: imageOpportunities.length > 3 ? "1-2 weeks" : "3-5 days",
        priority: totalImageSavings > 500 ? 'critical' : totalImageSavings > 100 ? 'high' : 'medium' as const,
        status: 'pending' as const,
        phase: totalImageSavings > 300 ? 'immediate' : 'short-term' as const
      });
    }
    
    // Render Blocking Resources - Based on opportunities with actual savings
    const renderBlockingOpportunities = [...desktopOpportunities, ...mobileOpportunities].filter(opp => 
      opp.id?.includes('render-blocking') || opp.id?.includes('unused-css') || opp.id?.includes('css')
    );
    if (renderBlockingOpportunities.length > 0) {
      const totalBlockingSavings = renderBlockingOpportunities.reduce((sum, opp) => sum + (opp.potential_savings || 0), 0);
      items.push({
        title: "Eliminate Render-Blocking Resources", 
        description: `Defer non-critical CSS and JavaScript to improve First Contentful Paint. Found ${renderBlockingOpportunities.length} optimization opportunities.`,
        impact: totalBlockingSavings > 0 ? `Save ${formatDuration(totalBlockingSavings)}` : "Improve FCP timing",
        time: renderBlockingOpportunities.length > 5 ? "1 week" : "2-3 days",
        priority: totalBlockingSavings > 400 ? 'critical' : 'high' as const,
        status: 'pending' as const,
        phase: 'short-term' as const
      });
    }
    
    // Long-term improvements based on overall scores
    const overallScore = reportData.summary?.overall_score || 0;
    
    if (overallScore < 80) {
      items.push({
        title: "Advanced Caching Strategy",
        description: "Implement multi-layer caching with Redis, Full Page Cache, and intelligent cache warming.",
        impact: "+15-25 performance score",
        time: "2-3 weeks",
        priority: 'medium' as const,
        status: 'pending' as const,
        phase: 'long-term' as const
      });
      
      items.push({
        title: "Database Optimization",
        description: "Query optimization, index tuning, and database performance monitoring setup.",
        impact: "+10-18 performance score",
        time: "3-4 weeks",
        priority: 'medium' as const,
        status: 'pending' as const,
        phase: 'long-term' as const
      });
    }
    
    if (!optimization?.details?.cdn_usage && overallScore < 85) {
      items.push({
        title: "CDN Implementation",
        description: "Deploy global Content Delivery Network for static assets and dynamic content acceleration.",
        impact: "+8-15 performance score",
        time: "1-2 weeks",
        priority: 'medium' as const,
        status: 'pending' as const,
        phase: 'long-term' as const
      });
    }
    
    return items;
  }, [reportData]);
  
  const roadmapItems = generateRoadmapItems;
  
  // Enhanced filtering logic
  const filteredItems = useMemo(() => {
    let filtered = selectedPhase === 'all' ? roadmapItems : roadmapItems.filter(item => item.phase === selectedPhase);
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply severity filter (map priority to severity)
    if (selectedSeverity.length > 0) {
      filtered = filtered.filter(item => {
        const severity = item.priority === 'critical' ? 'critical' : 
                        item.priority === 'high' ? 'high' : 'medium';
        return selectedSeverity.includes(severity);
      });
    }
    
    // Apply category filter (map to phase)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => 
        selectedCategories.includes(item.phase)
      );
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => {
        if (selectedTags.includes('high-impact')) {
          return item.priority === 'critical' || item.priority === 'high';
        }
        if (selectedTags.includes('quick-win')) {
          return item.time.includes('day') && !item.time.includes('week');
        }
        return true;
      });
    }
    
    // Apply sorting
    switch (selectedSort) {
      case 'priority':
        filtered.sort((a, b) => {
          const priorityOrder = { critical: 3, high: 2, medium: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        });
        break;
      case 'phase':
        filtered.sort((a, b) => {
          const phaseOrder = { immediate: 3, 'short-term': 2, 'long-term': 1 };
          return phaseOrder[b.phase as keyof typeof phaseOrder] - phaseOrder[a.phase as keyof typeof phaseOrder];
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Keep default order
        break;
    }
    
    return filtered;
  }, [roadmapItems, selectedPhase, searchQuery, selectedSeverity, selectedCategories, selectedTags, selectedSort]);
  
  // Filter options
  const filterCategories = useMemo(() => [
    { value: 'immediate', label: 'Immediate', icon: <AlertTriangle className="h-4 w-4" />, count: roadmapItems.filter(i => i.phase === 'immediate').length },
    { value: 'short-term', label: 'Short-term', icon: <Zap className="h-4 w-4" />, count: roadmapItems.filter(i => i.phase === 'short-term').length },
    { value: 'long-term', label: 'Long-term', icon: <TrendingUp className="h-4 w-4" />, count: roadmapItems.filter(i => i.phase === 'long-term').length }
  ], [roadmapItems]);
  
  const filterTags = useMemo(() => [
    { value: 'high-impact', label: 'High Impact', count: roadmapItems.filter(i => i.priority === 'critical' || i.priority === 'high').length },
    { value: 'quick-win', label: 'Quick Win', count: roadmapItems.filter(i => i.time.includes('day') && !i.time.includes('week')).length }
  ], [roadmapItems]);
  
  const currentScore = reportData.summary?.overall_score || 0;
  
  // Calculate dynamic target score based on current performance
  const targetScore = useMemo(() => {
    if (currentScore < 40) return 70; // Realistic improvement for very poor performance
    if (currentScore < 60) return 80; // Moderate improvement for poor performance
    if (currentScore < 80) return 90; // Good improvement for average performance
    return Math.min(95, currentScore + 10); // Small improvement for good performance
  }, [currentScore]);
  const improvementPotential = targetScore - currentScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Professional Header */}
      <motion.div 
        className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Route className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Optimization Roadmap
                </h1>
                <p className="text-gray-600">
                  Strategic timeline for performance improvements and optimization milestones
                </p>
              </div>
            </div>
            
            {/* Score Progress Indicator */}
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>{Math.round(currentScore)}</div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{targetScore}</div>
                  <div className="text-xs text-gray-500">Target</div>
                </div>
              </div>
              <Badge className="mt-2 bg-blue-100 text-blue-800">
                +{improvementPotential.toFixed(0)} potential
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Advanced Search and Filter Controls */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={filterCategories}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            severityLevels={[
              { value: 'critical', label: 'Critical', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' },
              { value: 'high', label: 'High Priority', icon: <Zap className="h-4 w-4" />, color: 'text-orange-600' },
              { value: 'medium', label: 'Medium Priority', icon: <TrendingUp className="h-4 w-4" />, color: 'text-yellow-600' }
            ]}
            selectedSeverity={selectedSeverity}
            onSeverityChange={setSelectedSeverity}
            tags={filterTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            sortOptions={[
              { value: 'relevance', label: 'Relevance', icon: <Target className="h-4 w-4" /> },
              { value: 'priority', label: 'Priority', icon: <AlertTriangle className="h-4 w-4" /> },
              { value: 'phase', label: 'Phase', icon: <Clock className="h-4 w-4" /> },
              { value: 'name', label: 'Name (A-Z)', icon: <Target className="h-4 w-4" /> }
            ]}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            totalResults={filteredItems.length}
            onReset={() => {
              setSearchQuery('');
              setSelectedCategories([]);
              setSelectedSeverity([]);
              setSelectedTags([]);
              setSelectedSort('relevance');
            }}
          />
        </motion.div>
        {/* Quick Phase Filter Buttons */}
        <motion.div 
          className="mb-8 flex items-center justify-center space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { key: 'all', label: 'All Phases', icon: Target },
            { key: 'immediate', label: 'Immediate', icon: AlertTriangle },
            { key: 'short-term', label: 'Short-term', icon: Zap },
            { key: 'long-term', label: 'Long-term', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedPhase === key ? "default" : "outline"}
              onClick={() => setSelectedPhase(key as any)}
              size="sm"
              className="transition-all duration-200"
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
              <Badge variant="secondary" className="ml-1">
                {key === 'all' ? roadmapItems.length : roadmapItems.filter(i => i.phase === key).length}
              </Badge>
            </Button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline Column */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Implementation Timeline</span>
                  <Badge variant="outline" className="ml-2">
                    {filteredItems.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={`${item.title}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <TimelineItem 
                        {...item}
                        isLast={index === filteredItems.length - 1}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary & Expected Results Column */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Progress Overview */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Target className="h-5 w-5" />
                  <span>Progress Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{Math.round(currentScore)}</div>
                    <div className="text-sm text-gray-600">Current Score</div>
                    <TrendingDown className="h-4 w-4 text-gray-400 mx-auto mt-1" />
                    <div className="text-2xl font-bold text-emerald-600 mt-2">{targetScore}</div>
                    <div className="text-sm text-gray-600">Target Score</div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs text-gray-500">{Math.round((currentScore / targetScore) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentScore / targetScore) * 100}%` }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expected Results */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-green-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-900">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Expected Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xl font-bold text-emerald-600">85+</div>
                      <div className="text-xs text-gray-600">Overall Score</div>
                      <div className="text-xs text-emerald-600">+{improvementPotential.toFixed(0)} pts</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">&lt;200ms</div>
                      <div className="text-xs text-gray-600">Server Response</div>
                      <div className="text-xs text-blue-600">-{Math.max(0, (reportData.performance?.raw_data?.ttfb_analysis?.ttfb_ms || 0) - 200).toFixed(0)}ms</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">90+</div>
                      <div className="text-xs text-gray-600">Mobile Perf</div>
                      <div className="text-xs text-purple-600">+{Math.max(0, 90 - (reportData.performance?.raw_data?.mobile_performance?.performance_score || 0)).toFixed(0)} pts</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">A</div>
                      <div className="text-xs text-gray-600">Overall Grade</div>
                      <div className="text-xs text-yellow-600">{reportData.summary?.grade || "F"} → A</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Key Benefits</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Improved user experience & retention</li>
                      <li>• Better search engine rankings</li>
                      <li>• Reduced bounce rate & cart abandonment</li>
                      <li>• Enhanced mobile performance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase Summary */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-900">
                  <Clock className="h-5 w-5" />
                  <span>Timeline Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-white/60 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">Immediate</span>
                    </div>
                    <span className="text-gray-600">{roadmapItems.filter(i => i.phase === 'immediate').length} items</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/60 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Short-term</span>
                    </div>
                    <span className="text-gray-600">{roadmapItems.filter(i => i.phase === 'short-term').length} items</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/60 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Long-term</span>
                    </div>
                    <span className="text-gray-600">{roadmapItems.filter(i => i.phase === 'long-term').length} items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
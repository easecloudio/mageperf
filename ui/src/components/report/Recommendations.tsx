'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Zap,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Timer,
  Gauge,
  ExternalLink,
  Settings,
  Target,
} from "lucide-react";
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { MetricDetailModal } from '@/components/ui/DetailModal';
import { InteractiveTooltip } from '@/components/ui/InteractiveTooltip';

// Utility functions from the original page.tsx
function getPriorityColor(priority: number): string {
  const colors = {
    5: "bg-red-500",
    4: "bg-orange-500",
    3: "bg-yellow-500",
    2: "bg-blue-500",
    1: "bg-gray-500",
  };
  return colors[priority as keyof typeof colors] || "bg-gray-500";
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

interface RecommendationsProps {
  reportData: {
    performance?: {
      raw_data?: {
        desktop_performance?: { opportunities?: Array<{ potential_savings?: number; [key: string]: unknown }> };
        mobile_performance?: { opportunities?: Array<{ potential_savings?: number; [key: string]: unknown }> };
      };
    };
    recommendations?: unknown[] | {
      critical?: Array<{ category?: string; effort?: string; impact?: string; priority?: number; [key: string]: unknown }>;
      high?: Array<{ category?: string; effort?: string; impact?: string; priority?: number; [key: string]: unknown }>;
      medium?: Array<{ category?: string; effort?: string; impact?: string; priority?: number; [key: string]: unknown }>;
    };
    detailed_analysis?: {
      magento_analysis?: {
        categories?: {
          [key: string]: {
            recommendations?: unknown[];
          };
        };
      };
    };
  };
  selectedDevice: string | undefined;
  selectedTab: "opportunities" | "optimization";
}

export function Recommendations({ reportData, selectedDevice, selectedTab }: RecommendationsProps) {
  const [expandedSection, setExpandedSection] = useState<"critical" | "high" | "medium" | null>("critical");
  
  // Enhanced filtering and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState(selectedTab === "opportunities" ? "impact" : "severity");
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  // Normalize recommendations to object form (may arrive as array or object)
  const structuredRecs = useMemo(() => {
    const r = reportData.recommendations;
    if (!r || Array.isArray(r)) return { critical: [] as any[], high: [] as any[], medium: [] as any[] };
    return r as { critical?: any[]; high?: any[]; medium?: any[] };
  }, [reportData.recommendations]);

  const currentPerformanceData = useMemo(() => {
    return selectedDevice === "desktop"
      ? reportData.performance?.raw_data?.desktop_performance || {}
      : reportData.performance?.raw_data?.mobile_performance || {};
  }, [selectedDevice, reportData.performance?.raw_data]);

  const opportunitiesData = useMemo(() => {
    return (currentPerformanceData.opportunities || [])
      .filter((opp: { potential_savings?: number }) => (opp.potential_savings ?? 0) > 0)
      .sort((a: { potential_savings?: number }, b: { potential_savings?: number }) => (b.potential_savings ?? 0) - (a.potential_savings ?? 0));
  }, [currentPerformanceData]);

  const diagnosticsData = useMemo(() => {
    // Filter diagnostics to only include those with meaningful savings or actionable data
    return ((currentPerformanceData as any).diagnostics || [])
      .filter((diag: any) => {
        // Only include diagnostics that have potential savings or are actionable
        return diag.potential_savings > 0 || diag.display_value?.includes('savings');
      });
  }, [currentPerformanceData]);

  // Filter options for advanced filtering with dynamic counts
  // Dynamic filter categories based on actual data
  const filterCategories = useMemo(() => {
    if (selectedTab === "opportunities") {
      // Simulate exactly what filteredOpportunities would return for each category
      const getCountForCategory = (categoryValue: string) => {
        // Start with the same base data as filteredOpportunities (deduplicated)
        const combinedData = [...opportunitiesData];
        diagnosticsData.forEach((diag: any) => {
          if (!combinedData.find((opp: any) => opp.id === diag.id)) {
            combinedData.push(diag);
          }
        });
        let filtered = combinedData;

        // Apply the same category filtering logic as filteredOpportunities
        filtered = filtered.filter((opp: any) => {
          switch (categoryValue) {
            case 'images':
              return opp.id?.includes('image') || opp.id?.includes('offscreen') || opp.id?.includes('responsive') || 
                     opp.id?.includes('optimized') || opp.id?.includes('lcp') || opp.id?.includes('animated');
            case 'javascript':
              return opp.id?.includes('javascript') || opp.id?.includes('js') || opp.id?.includes('bootup') || 
                     opp.id?.includes('legacy') || opp.id?.includes('unused-javascript');
            case 'css':
              return opp.id?.includes('css') || opp.id?.includes('render-blocking') || opp.id?.includes('unused-css');
            case 'server':
              return opp.id?.includes('server') || opp.id?.includes('response-time') || opp.id?.includes('redirect') || 
                     opp.id?.includes('compression') || opp.id?.includes('cache');
            case 'fonts':
              return opp.id?.includes('font') || opp.id?.includes('webfont');
            default:
              return false;
          }
        });

        return filtered.length;
      };
      
      return [
        { value: 'images', label: 'Images', icon: <Gauge className="h-4 w-4" />, count: getCountForCategory('images') },
        { value: 'javascript', label: 'JavaScript', icon: <Zap className="h-4 w-4" />, count: getCountForCategory('javascript') },
        { value: 'css', label: 'CSS & Styles', icon: <Settings className="h-4 w-4" />, count: getCountForCategory('css') },
        { value: 'server', label: 'Server & Network', icon: <Timer className="h-4 w-4" />, count: getCountForCategory('server') },
        { value: 'fonts', label: 'Web Fonts', icon: <Star className="h-4 w-4" />, count: getCountForCategory('fonts') }
      ].filter(cat => cat.count > 0);
    } else {
      // Optimization tab - simulate exactly what filteredRecommendations would return
      const getCountForOptimizationCategory = (categoryValue: string) => {
        // Start with the same base data as filteredRecommendations (including detailed analysis)
        const basicRecommendations = [
          ...(structuredRecs.critical?.map((rec: any) => ({ ...rec, severity: 'critical' })) || []),
          ...(structuredRecs.high?.map((rec: any) => ({ ...rec, severity: 'high' })) || []),
          ...(structuredRecs.medium?.map((rec: any) => ({ ...rec, severity: 'medium' })) || []),
        ];

        // Add detailed analysis recommendations
        const detailedRecommendations: any[] = [];
        const categories = reportData.detailed_analysis?.magento_analysis?.categories || {};
        
        Object.entries(categories).forEach(([categoryKey, categoryData]: [string, any]) => {
          if (categoryData.recommendations && Array.isArray(categoryData.recommendations)) {
            categoryData.recommendations.forEach((rec: string, index: number) => {
              if (!rec || rec.trim() === '') return;
              
              detailedRecommendations.push({
                id: `${categoryKey}-${index}`,
                title: rec,
                category: categoryKey,
                severity: categoryData.score < 50 ? 'critical' : categoryData.score < 75 ? 'high' : 'medium'
              });
            });
          }
        });

        // Combine and deduplicate
        const allRecommendations = [...basicRecommendations];
        detailedRecommendations.forEach(detailedRec => {
          const isDuplicate = basicRecommendations.some(basicRec => 
            basicRec.title?.toLowerCase().includes(detailedRec.title.toLowerCase().substring(0, 20)) ||
            detailedRec.title.toLowerCase().includes(basicRec.title?.toLowerCase().substring(0, 20) || '')
          );
          if (!isDuplicate) {
            allRecommendations.push(detailedRec);
          }
        });

        // Apply the same category filtering logic as filteredRecommendations
        const filtered = allRecommendations.filter((rec: any) => {
          const recCategory = rec.category?.toLowerCase();
          switch (categoryValue) {
            case 'performance':
              return recCategory === 'performance';
            case 'magento':
              return recCategory === 'magento' || recCategory === 'optimization' || recCategory === 'configuration';
            case 'security':
              return recCategory === 'security';
            case 'seo':
              return recCategory === 'seo';
            default:
              return recCategory === categoryValue;
          }
        });

        return filtered.length;
      };
      
      return [
        { 
          value: 'performance', 
          label: 'Performance', 
          icon: <Zap className="h-4 w-4" />, 
          count: getCountForOptimizationCategory('performance')
        },
        { 
          value: 'magento', 
          label: 'Magento Config', 
          icon: <Settings className="h-4 w-4" />, 
          count: getCountForOptimizationCategory('magento')
        },
        { 
          value: 'security', 
          label: 'Security', 
          icon: <AlertTriangle className="h-4 w-4" />, 
          count: getCountForOptimizationCategory('security')
        },
        { 
          value: 'seo', 
          label: 'SEO', 
          icon: <TrendingUp className="h-4 w-4" />, 
          count: getCountForOptimizationCategory('seo')
        }
      ].filter(cat => cat.count > 0);
    }
  }, [opportunitiesData, diagnosticsData, reportData, selectedTab, structuredRecs]);

  const filterTags = useMemo(() => {
    if (selectedTab === "opportunities") {
      // Simulate exactly what filteredOpportunities would return for each tag
      const getCountForTag = (tagValue: string) => {
        // Start with the same base data as filteredOpportunities (deduplicated)
        const combinedData = [...opportunitiesData];
        diagnosticsData.forEach((diag: any) => {
          if (!combinedData.find((opp: any) => opp.id === diag.id)) {
            combinedData.push(diag);
          }
        });
        let filtered = combinedData;

        // Apply the same tag filtering logic as filteredOpportunities
        filtered = filtered.filter((opp: any) => {
          switch (tagValue) {
            case 'high-savings':
              return opp.potential_savings > 100;
            case 'quick-wins':
              return opp.score >= 0.5 && opp.potential_savings > 0;
            case 'critical-issues':
              return opp.score <= 0.3;
            case 'server-issues':
              return opp.id?.includes('server') || opp.id?.includes('response');
            default:
              return false;
          }
        });

        return filtered.length;
      };
      
      return [
        { value: 'high-savings', label: 'High Savings (>100ms)', count: getCountForTag('high-savings') },
        { value: 'quick-wins', label: 'Quick Wins', count: getCountForTag('quick-wins') },
        { value: 'critical-issues', label: 'Critical Issues', count: getCountForTag('critical-issues') },
        { value: 'server-issues', label: 'Server Issues', count: getCountForTag('server-issues') }
      ].filter(tag => tag.count > 0);
    } else {
      // Optimization tab - simulate exactly what filteredRecommendations would return for each tag
      const getCountForOptimizationTag = (tagValue: string) => {
        // Start with the same base data as filteredRecommendations (including detailed analysis)
        const basicRecommendations = [
          ...(structuredRecs.critical?.map((rec: any) => ({ ...rec, severity: 'critical' })) || []),
          ...(structuredRecs.high?.map((rec: any) => ({ ...rec, severity: 'high' })) || []),
          ...(structuredRecs.medium?.map((rec: any) => ({ ...rec, severity: 'medium' })) || []),
        ];

        // Add detailed analysis recommendations
        const detailedRecommendations: any[] = [];
        const categories = reportData.detailed_analysis?.magento_analysis?.categories || {};
        
        Object.entries(categories).forEach(([categoryKey, categoryData]: [string, any]) => {
          if (categoryData.recommendations && Array.isArray(categoryData.recommendations)) {
            categoryData.recommendations.forEach((rec: string, index: number) => {
              if (!rec || rec.trim() === '') return;
              
              let effort = 'medium';
              let impact = 'medium';
              
              if (rec.toLowerCase().includes('enable') || rec.toLowerCase().includes('add')) {
                effort = 'low';
              }
              if (rec.toLowerCase().includes('optimize') || rec.toLowerCase().includes('implement')) {
                effort = 'high';
              }
              if (categoryData.score < 30 || rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('security')) {
                impact = 'high';
              }

              detailedRecommendations.push({
                id: `${categoryKey}-${index}`,
                title: rec,
                category: categoryKey,
                severity: categoryData.score < 50 ? 'critical' : categoryData.score < 75 ? 'high' : 'medium',
                effort,
                impact
              });
            });
          }
        });

        // Combine and deduplicate
        const allRecommendations = [...basicRecommendations];
        detailedRecommendations.forEach(detailedRec => {
          const isDuplicate = basicRecommendations.some(basicRec => 
            basicRec.title?.toLowerCase().includes(detailedRec.title.toLowerCase().substring(0, 20)) ||
            detailedRec.title.toLowerCase().includes(basicRec.title?.toLowerCase().substring(0, 20) || '')
          );
          if (!isDuplicate) {
            allRecommendations.push(detailedRec);
          }
        });
        
        // Apply the same tag filtering logic as filteredRecommendations
        const filtered = allRecommendations.filter((rec: any) => {
          switch (tagValue) {
            case 'easy-effort':
              return rec.effort === 'low' || rec.effort === 'easy';
            case 'high-impact':
              return rec.impact === 'high';
            case 'medium-effort':
              return rec.effort === 'medium';
            case 'magento-specific':
              return rec.category === 'magento' || rec.category === 'optimization' || rec.category === 'configuration';
            default:
              return false;
          }
        });

        return filtered.length;
      };
      
      return [
        { value: 'easy-effort', label: 'Easy to Fix', count: getCountForOptimizationTag('easy-effort') },
        { value: 'high-impact', label: 'High Impact', count: getCountForOptimizationTag('high-impact') },
        { value: 'medium-effort', label: 'Medium Effort', count: getCountForOptimizationTag('medium-effort') },
        { value: 'magento-specific', label: 'Magento Specific', count: getCountForOptimizationTag('magento-specific') }
      ].filter(tag => tag.count > 0);
    }
  }, [opportunitiesData, diagnosticsData, reportData, selectedTab, structuredRecs]);

  // Enhanced filtering logic for opportunities
  const filteredOpportunities = useMemo(() => {
    // Combine and deduplicate by id to avoid React key conflicts
    const combinedData = [...opportunitiesData];
    diagnosticsData.forEach((diag: any) => {
      if (!combinedData.find((opp: any) => opp.id === diag.id)) {
        combinedData.push(diag);
      }
    });
    
    let filtered = combinedData;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((opp: any) => 
        opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter - based on opportunity types
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((opp: any) => {
        return selectedCategories.some(category => {
          switch (category) {
            case 'images':
              return opp.id?.includes('image') || opp.id?.includes('offscreen') || opp.id?.includes('responsive') || 
                     opp.id?.includes('optimized') || opp.id?.includes('lcp') || opp.id?.includes('animated');
            case 'javascript':
              return opp.id?.includes('javascript') || opp.id?.includes('js') || opp.id?.includes('bootup') || 
                     opp.id?.includes('legacy') || opp.id?.includes('unused-javascript');
            case 'css':
              return opp.id?.includes('css') || opp.id?.includes('render-blocking') || opp.id?.includes('unused-css');
            case 'server':
              return opp.id?.includes('server') || opp.id?.includes('response-time') || opp.id?.includes('redirect') || 
                     opp.id?.includes('compression') || opp.id?.includes('cache');
            case 'fonts':
              return opp.id?.includes('font') || opp.id?.includes('webfont');
            default:
              return false;
          }
        });
      });
    }

    // Impact level filter for performance opportunities (using potential_savings - higher savings = higher impact)
    if (selectedSeverity.length > 0 && selectedTab === "opportunities") {
      filtered = filtered.filter((opp: any) => {
        return selectedSeverity.some(impact => {
          const savings = opp.potential_savings || 0;
          switch (impact) {
            case 'high-impact':
              return savings >= 100; // High savings = high impact opportunity
            case 'medium-impact':
              return savings > 20 && savings < 100; // Medium savings = medium impact
            case 'low-impact':
              return savings > 0 && savings <= 20; // Low savings = low impact opportunity
            default:
              return false;
          }
        });
      });
    }

    // Tag filter - based on savings and difficulty
    if (selectedTags.length > 0) {
      filtered = filtered.filter((opp: any) => {
        return selectedTags.some(tag => {
          switch (tag) {
            case 'high-savings':
              return opp.potential_savings > 100;
            case 'quick-wins':
              return opp.score >= 0.5 && opp.potential_savings > 0;
            case 'critical-issues':
              return opp.score <= 0.3;
            case 'server-issues':
              return opp.id?.includes('server') || opp.id?.includes('response');
            default:
              return false;
          }
        });
      });
    }

    // Sort
    switch (selectedSort) {
      case 'impact':
        filtered.sort((a: any, b: any) => (b.potential_savings || 0) - (a.potential_savings || 0));
        break;
      case 'name':
        filtered.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'relevance':
      default:
        // Keep current order (already sorted by potential savings)
        break;
    }

    return filtered;
  }, [opportunitiesData, diagnosticsData, searchQuery, selectedCategories, selectedSort, selectedTags, selectedSeverity, selectedTab]);

  // Enhanced filtering logic for optimization recommendations
  const filteredRecommendations = useMemo(() => {
    // Start with basic recommendations
    const basicRecommendations = [
      ...(structuredRecs.critical?.map((rec: any) => ({ ...rec, severity: 'critical' })) || []),
      ...(structuredRecs.high?.map((rec: any) => ({ ...rec, severity: 'high' })) || []),
      ...(structuredRecs.medium?.map((rec: any) => ({ ...rec, severity: 'medium' })) || []),
    ];

    // Add detailed analysis recommendations from magento_analysis.categories
    const detailedRecommendations: any[] = [];
    const categories = reportData.detailed_analysis?.magento_analysis?.categories || {};
    
    Object.entries(categories).forEach(([categoryKey, categoryData]: [string, any]) => {
      if (categoryData.recommendations && Array.isArray(categoryData.recommendations)) {
        categoryData.recommendations.forEach((rec: string, index: number) => {
          // Skip empty recommendations
          if (!rec || rec.trim() === '') return;
          
          // Determine severity based on category score and recommendation content
          let severity = 'medium';
          let priority = 2;
          
          if (categoryData.score < 50) {
            severity = 'critical';
            priority = 5;
          } else if (categoryData.score < 75) {
            severity = 'high'; 
            priority = 4;
          }
          
          // Determine effort and impact based on content
          let effort = 'medium';
          let impact = 'medium';
          
          if (rec.toLowerCase().includes('enable') || rec.toLowerCase().includes('add')) {
            effort = 'low';
          }
          if (rec.toLowerCase().includes('optimize') || rec.toLowerCase().includes('implement')) {
            effort = 'high';
          }
          if (categoryData.score < 30 || rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('security')) {
            impact = 'high';
          }

          detailedRecommendations.push({
            id: `${categoryKey}-${index}`,
            title: rec,
            description: `${categoryData.category} improvement: ${rec}`,
            category: categoryKey,
            severity,
            priority,
            impact,
            effort,
            source: 'detailed_analysis',
            categoryScore: categoryData.score
          });
        });
      }
    });

    // Combine and deduplicate (basic recommendations take priority)
    const allRecommendations = [...basicRecommendations];
    detailedRecommendations.forEach(detailedRec => {
      // Only add if not already covered by basic recommendations
      const isDuplicate = basicRecommendations.some(basicRec => 
        basicRec.title?.toLowerCase().includes(detailedRec.title.toLowerCase().substring(0, 20)) ||
        detailedRec.title.toLowerCase().includes(basicRec.title?.toLowerCase().substring(0, 20) || '')
      );
      if (!isDuplicate) {
        allRecommendations.push(detailedRec);
      }
    });

    let filtered = [...allRecommendations];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((rec: any) => 
        rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Severity filter
    if (selectedSeverity.length > 0) {
      filtered = filtered.filter((rec: any) => 
        selectedSeverity.includes(rec.severity)
      );
    }

    // Category filter - based on actual recommendation categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((rec: any) => {
        const recCategory = rec.category?.toLowerCase();
        return selectedCategories.some(category => {
          switch (category) {
            case 'performance':
              return recCategory === 'performance';
            case 'magento':
              return recCategory === 'magento' || recCategory === 'optimization' || recCategory === 'configuration';
            case 'security':
              return recCategory === 'security';
            case 'seo':
              return recCategory === 'seo';
            default:
              return recCategory === category;
          }
        });
      });
    }

    // Tag filter - based on effort and impact
    if (selectedTags.length > 0) {
      filtered = filtered.filter((rec: any) => {
        return selectedTags.some(tag => {
          switch (tag) {
            case 'easy-effort':
              return rec.effort === 'low' || rec.effort === 'easy';
            case 'high-impact':
              return rec.impact === 'high';
            case 'medium-effort':
              return rec.effort === 'medium';
            case 'magento-specific':
              return rec.category === 'magento' || rec.category === 'optimization' || rec.category === 'configuration';
            default:
              return false;
          }
        });
      });
    }

    // Sort
    switch (selectedSort) {
      case 'severity':
        filtered.sort((a: any, b: any) => {
          const severityOrder = { critical: 3, high: 2, medium: 1 };
          const aScore = severityOrder[a.severity as keyof typeof severityOrder] || 0;
          const bScore = severityOrder[b.severity as keyof typeof severityOrder] || 0;
          return bScore - aScore; // Descending order (critical first)
        });
        break;
      case 'impact':
        filtered.sort((a: any, b: any) => {
          const aPriority = a.priority || 0;
          const bPriority = b.priority || 0;
          return bPriority - aPriority; // Descending order (higher priority first)
        });
        break;
      case 'name':
        filtered.sort((a: any, b: any) => {
          const aTitle = a.title || '';
          const bTitle = b.title || '';
          return aTitle.localeCompare(bTitle); // Ascending order (A-Z)
        });
        break;
      case 'relevance':
      default:
        // Keep current order (already ordered by severity from the mapping)
        break;
    }

    return filtered;
  }, [structuredRecs, reportData.detailed_analysis?.magento_analysis?.categories, searchQuery, selectedSeverity, selectedCategories, selectedSort, selectedTags]);

  // Removed unused variable

  function toggleSection(section: "critical" | "high" | "medium") {
    // if it’s already open, close it; otherwise open this one
    setExpandedSection(prev => prev === section ? null : section);
  }

  return (
    <div className="space-y-8">
      {/* Advanced Search and Filter Controls */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={filterCategories}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        severityLevels={selectedTab === "optimization" ? [
          { value: 'critical', label: 'Critical', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' },
          { value: 'high', label: 'High Priority', icon: <Zap className="h-4 w-4" />, color: 'text-orange-600' },
          { value: 'medium', label: 'Medium Priority', icon: <TrendingUp className="h-4 w-4" />, color: 'text-yellow-600' }
        ] : [
          { value: 'high-impact', label: 'High Impact', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' },
          { value: 'medium-impact', label: 'Medium Impact', icon: <Zap className="h-4 w-4" />, color: 'text-orange-600' },
          { value: 'low-impact', label: 'Low Impact', icon: <TrendingUp className="h-4 w-4" />, color: 'text-yellow-600' }
        ]}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        tags={filterTags}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        sortOptions={selectedTab === "opportunities" ? [
          { value: 'impact', label: 'Savings', icon: <TrendingUp className="h-4 w-4" /> },
          { value: 'name', label: 'Name (A-Z)', icon: <Settings className="h-4 w-4" /> },
          { value: 'relevance', label: 'Relevance', icon: <Target className="h-4 w-4" /> }
        ] : [
          { value: 'severity', label: 'Severity', icon: <AlertTriangle className="h-4 w-4" /> },
          { value: 'impact', label: 'Impact', icon: <TrendingUp className="h-4 w-4" /> },
          { value: 'name', label: 'Name (A-Z)', icon: <Settings className="h-4 w-4" /> },
          { value: 'relevance', label: 'Relevance', icon: <Target className="h-4 w-4" /> }
        ]}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        totalResults={selectedTab === "opportunities" ? filteredOpportunities.length : filteredRecommendations.length}
        onReset={() => {
          setSearchQuery("");
          setSelectedCategories([]);
          setSelectedSeverity([]);
          setSelectedTags([]);
          setSelectedSort(selectedTab === "opportunities" ? "impact" : "severity");
        }}
      />

      {/* Performance Opportunities Tab Content */}
      {selectedTab === "opportunities" && (
        <>
          {filteredOpportunities.length > 0 ? (
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                    <span>Performance Opportunities</span>
                    <Badge variant="secondary" className="ml-2">
                      {filteredOpportunities.length} found
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Potential savings:{" "}
                    {formatDuration(filteredOpportunities.reduce((sum: number, opp: { potential_savings?: number }) => sum + (opp.potential_savings ?? 0), 0))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {filteredOpportunities.map((opportunity: Record<string, unknown>, index: number) => (
                    <div 
                      key={(opportunity.id as string) || `opportunity-${index}`} 
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOpportunity(opportunity)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {opportunity.title as string}
                            </div>
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs">
                              Save {formatDuration(opportunity.potential_savings as number)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {selectedDevice}
                            </Badge>
                          </div>
                          <MarkdownRenderer content={opportunity.description as string} />
                          <div className="flex items-center space-x-6 mt-4">
                            <div className="flex items-center space-x-2">
                              <Timer className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                Potential savings: {formatDuration(opportunity.potential_savings as number)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Gauge className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                Impact:{" "}
                                {(opportunity.potential_savings as number) > 200 ? "High" : (opportunity.potential_savings as number) > 50 ? "Medium" : "Low"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">Priority: {index + 1}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <InteractiveTooltip
                            content={{
                              title: "View Details",
                              description: "Click to see detailed analysis and implementation steps",
                              type: "info"
                            }}
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </InteractiveTooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-12 text-center">
                <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Performance Opportunities Found</h3>
                <p className="text-gray-500">Your website is already well-optimized for performance!</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Optimization Tab Content */}
      {selectedTab === "optimization" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Configuration & Security Optimization</h3>
              <p className="text-gray-600">Critical issues and improvements for your Magento store</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Dynamic Recommendations Display */}
            {filteredRecommendations.length > 0 ? (
              <div className="space-y-6">
                {/* Group by severity for display */}
                {['critical', 'high', 'medium'].map(severity => {
                  const severityItems = filteredRecommendations.filter((rec: any) => rec.severity === severity);
                  if (severityItems.length === 0) return null;

                  const severityConfig = {
                    critical: {
                      icon: AlertTriangle,
                      color: 'red',
                      bgClass: 'bg-gradient-to-br from-white to-red-50/20',
                      headerBg: 'bg-gradient-to-r from-red-50 to-pink-50',
                      textColor: 'text-red-800',
                      iconColor: 'text-red-600',
                      badgeClass: 'bg-red-500',
                      divideClass: 'divide-red-100',
                      itemBg: 'bg-red-50/50 hover:bg-red-50'
                    },
                    high: {
                      icon: Zap,
                      color: 'orange', 
                      bgClass: 'bg-gradient-to-br from-white to-orange-50/20',
                      headerBg: 'bg-gradient-to-r from-orange-50 to-yellow-50',
                      textColor: 'text-orange-800',
                      iconColor: 'text-orange-600',
                      badgeClass: 'bg-orange-500',
                      divideClass: 'divide-orange-100',
                      itemBg: 'bg-orange-50/50 hover:bg-orange-50'
                    },
                    medium: {
                      icon: TrendingUp,
                      color: 'yellow',
                      bgClass: 'bg-gradient-to-br from-white to-yellow-50/20', 
                      headerBg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
                      textColor: 'text-yellow-800',
                      iconColor: 'text-yellow-600',
                      badgeClass: 'bg-yellow-500',
                      divideClass: 'divide-yellow-100',
                      itemBg: 'bg-yellow-50/50 hover:bg-yellow-50'
                    }
                  };

                  const config = severityConfig[severity as keyof typeof severityConfig];
                  const IconComponent = config.icon;

                  return (
                    <Card key={severity} className={`border-${config.color}-200 shadow-lg border-0 ${config.bgClass}`}>
                      <CardHeader 
                        className={`${config.headerBg} cursor-pointer`} 
                        onClick={() => toggleSection(severity as "critical" | "high" | "medium")}
                      >
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                            <span className={config.textColor}>
                              {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority Issues
                            </span>
                            <Badge variant="secondary" className={`text-sm ${config.badgeClass} text-white`}>
                              {severityItems.length}
                            </Badge>
                          </div>
                          {expandedSection === severity ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {expandedSection === severity && (
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {severityItems.map((rec: any, index: number) => (
                              <div 
                                key={`${severity}-${index}`} 
                                className={`p-6 ${config.itemBg} rounded-lg border border-white/20 shadow-sm hover:shadow-md transition-all duration-200`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                      <div className={`text-xl font-bold ${config.textColor}`}>
                                        {rec.title}
                                      </div>
                                      <Badge className={`text-white ${getPriorityColor(rec.priority)}`}>
                                        P{rec.priority}
                                      </Badge>
                                      <Badge variant="outline" className={`text-xs border-${config.color}-300 ${config.textColor}`}>
                                        {rec.impact} impact
                                      </Badge>
                                      <Badge variant="outline" className={`text-xs border-${config.color}-300 ${config.textColor}`}>
                                        {rec.effort} effort
                                      </Badge>
                                      {rec.category && (
                                        <Badge variant="secondary" className="text-xs">
                                          {rec.category}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className={`${config.textColor} mb-4 leading-relaxed`}>{rec.description}</p>

                                    {/* Show implementation time estimate */}
                                    <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                                      <div className="flex items-center space-x-2">
                                        <Timer className="h-4 w-4" />
                                        <span>
                                          Est. time: {rec.effort === 'low' ? '15-30 min' : rec.effort === 'high' ? '1-3 hours' : '30-60 min'}
                                        </span>
                                      </div>
                                      {rec.impact === 'high' && (
                                        <div className="flex items-center space-x-2">
                                          <TrendingUp className="h-4 w-4 text-red-500" />
                                          <span className="text-red-600 font-medium">High Impact</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30">
                <CardContent className="p-12 text-center">
                  <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Recommendations Match Your Filters</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      )}

      {/* Detail Modals */}
      {selectedOpportunity && (
        <MetricDetailModal
          isOpen={!!selectedOpportunity}
          onOpenChange={(open) => !open && setSelectedOpportunity(null)}
          metric={{
            id: selectedOpportunity.id as string || 'opportunity',
            name: selectedOpportunity.title as string,
            value: formatDuration(selectedOpportunity.potential_savings as number),
            unit: '',
            score: Math.max(0, Math.min(1, 1 - (selectedOpportunity.potential_savings as number) / 1000)),
            category: 'Performance Optimization',
            description: selectedOpportunity.description as string,
            impact: (selectedOpportunity.potential_savings as number) > 200 ? 'critical' : 
                   (selectedOpportunity.potential_savings as number) > 100 ? 'high' : 
                   (selectedOpportunity.potential_savings as number) > 50 ? 'medium' : 'low',
            recommendations: [
              {
                title: "Implement this optimization",
                description: "Follow the steps outlined to achieve the potential performance savings.",
                effort: "medium" as const,
                impact: "high" as const,
                priority: 1
              }
            ],
            technicalDetails: {
              currentValue: `${selectedOpportunity.potential_savings}ms delay`,
              targetValue: "0ms delay",
              measurement: "Performance analysis via PageSpeed Insights",
              context: [
                "This optimization can improve Core Web Vitals scores",
                "Implementation may require technical expertise",
                "Results may vary based on site architecture"
              ]
            },
            resources: [
              {
                title: "Google PageSpeed Insights Documentation",
                url: "https://developers.google.com/speed/pagespeed/insights/",
                type: "documentation" as const
              }
            ]
          }}
        />
      )}

    </div>
  );
}
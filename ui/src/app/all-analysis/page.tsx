'use client';

import { useState, useMemo, useEffect } from 'react';
import { MainSidebar } from '@/components/MainSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { fetchReports, UiReport } from '@/lib/localApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle,
  FileText,
  AlertTriangle,
  Globe,
  Activity,
  Eye,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Smartphone,
  Monitor,
  Timer,
  ChevronDown
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DynamicBreadcrumb } from '@/components/ui/DynamicBreadcrumb';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const getGradeColor = (grade: string) => {
  const colors = {
    A: 'bg-emerald-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-orange-500',
    F: 'bg-red-500',
  };
  return colors[grade as keyof typeof colors] || 'bg-gray-500';
};

const getDomainFromUrl = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Performance trend calculation
const calculateTrend = (reports: UiReport[]) => {
  const sortedByDate = reports.slice().sort((a, b) =>
    new Date(a.created_at.$date).getTime() - new Date(b.created_at.$date).getTime()
  );

  if (sortedByDate.length < 2) return { trend: 'neutral', change: 0 };

  const recent = sortedByDate.slice(-3);
  const older = sortedByDate.slice(-6, -3);

  const recentAvg = recent.reduce((sum, r) => sum + (r.report_data.summary?.overall_score ?? 0), 0) / recent.length;
  const olderAvg = older.length > 0
    ? older.reduce((sum, r) => sum + (r.report_data.summary?.overall_score ?? 0), 0) / older.length
    : recentAvg;

  const change = recentAvg - olderAvg;
  return {
    trend: change > 2 ? 'up' : change < -2 ? 'down' : 'neutral',
    change: Math.round(change * 10) / 10
  };
};

// Mini chart component for KPI cards
const MiniChart = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <div className="flex items-end space-x-1 h-8">
      {data.map((value, index) => {
        const height = ((value - min) / range) * 28 + 4;
        return (
          <div
            key={index}
            className={`w-1 ${color} rounded-sm opacity-70`}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};

// Performance distribution chart
const PerformanceDistribution = ({ reports }: { reports: UiReport[] }) => {
  const distribution = useMemo(() => {
    const ranges = {
      'Excellent (90-100)': 0,
      'Good (75-89)': 0,
      'Fair (50-74)': 0,
      'Poor (0-49)': 0
    };

    reports.forEach(report => {
      const score = report.report_data.summary?.overall_score ?? 0;
      if (score >= 90) ranges['Excellent (90-100)']++;
      else if (score >= 75) ranges['Good (75-89)']++;
      else if (score >= 50) ranges['Fair (50-74)']++;
      else ranges['Poor (0-49)']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count,
      percentage: reports.length > 0 ? (count / reports.length) * 100 : 0
    }));
  }, [reports]);
  
  return (
    <div className="space-y-3">
      {distribution.map(({ range, count, percentage }, index) => {
        const colors = [
          'bg-emerald-500',
          'bg-blue-500', 
          'bg-yellow-500',
          'bg-red-500'
        ];
        return (
          <div key={range} className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 truncate">{range}</span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${colors[index]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function AllAnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [analyses, setAnalyses] = useState<UiReport[]>([]);

  useEffect(() => {
    fetchReports()
      .then(setAnalyses)
      .catch(console.error);
  }, []);

  const totalAnalyses = analyses.length;
  const completedAnalyses = analyses.filter(a => a.report_data.status === 'completed').length;

  // Calculate analytics
  const criticalIssues = analyses.reduce((sum, a) => sum + (a.report_data.summary?.critical_issues ?? 0), 0);
  const totalIssues = analyses.reduce((sum, a) => sum + (a.report_data.summary?.total_issues ?? 0), 0);
  const avgScore = analyses.length > 0
    ? analyses.reduce((sum, a) => sum + (a.report_data.summary?.overall_score ?? 0), 0) / analyses.length
    : 0;
  const trend = calculateTrend(analyses);

  // Performance metrics for charts
  const scoreHistory = analyses.map(a => a.report_data.summary?.overall_score ?? 0);

  // Filter and sort analyses
  const filteredAndSortedAnalyses = useMemo(() => {
    const filtered = analyses.filter(analysis => {
      const matchesSearch = searchTerm === '' ||
        getDomainFromUrl(analysis.report_data.url).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = selectedFilter === 'all' ||
        (selectedFilter === 'completed' && analysis.report_data.status === 'completed') ||
        (selectedFilter === 'pending' && analysis.report_data.status !== 'completed') ||
        (selectedFilter === 'high-score' && (analysis.report_data.summary?.overall_score ?? 0) >= 80) ||
        (selectedFilter === 'needs-attention' && (analysis.report_data.summary?.overall_score ?? 0) < 60);

      return matchesSearch && matchesFilter;
    });

    // Sort analyses
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at.$date).getTime() - new Date(a.created_at.$date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at.$date).getTime() - new Date(b.created_at.$date).getTime());
        break;
      case 'score-high':
        filtered.sort((a, b) => (b.report_data.summary?.overall_score ?? 0) - (a.report_data.summary?.overall_score ?? 0));
        break;
      case 'score-low':
        filtered.sort((a, b) => (a.report_data.summary?.overall_score ?? 0) - (b.report_data.summary?.overall_score ?? 0));
        break;
      case 'domain':
        filtered.sort((a, b) => getDomainFromUrl(a.report_data.url).localeCompare(getDomainFromUrl(b.report_data.url)));
        break;
    }

    return filtered;
  }, [analyses, searchTerm, selectedFilter, sortBy]);

  const getFilterLabel = () => {
    switch(selectedFilter) {
      case 'all': return 'All Reports';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'high-score': return 'High Score (80+)';
      case 'needs-attention': return 'Needs Attention (<60)';
      default: return 'Filter';
    }
  };

  const getSortLabel = () => {
    switch(sortBy) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'score-high': return 'Score: High to Low';
      case 'score-low': return 'Score: Low to High';
      case 'domain': return 'Domain A-Z';
      default: return 'Sort by';
    }
  };

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </header>
          <div className="flex-1 p-6 overflow-auto bg-gray-50">
            {/* Enhanced Header */}
            <div className='mb-8'>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Analytics Dashboard
                  </h1>
                  <p className="text-lg text-gray-600 mb-4 lg:mb-0">
                    Performance analysis history and insights across all your websites
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      trend.trend === 'up' ? 'bg-emerald-500' : 
                      trend.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-gray-600">
                      Performance {trend.trend === 'up' ? 'improving' : trend.trend === 'down' ? 'declining' : 'stable'}
                    </span>
                    {trend.change !== 0 && (
                      <span className={`font-medium ${
                        trend.change > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>All Reports</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Enhanced Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-blue-700">Total Analyses</p>
                            <div className={`flex items-center space-x-1 text-xs ${
                              trend.trend === 'up' ? 'text-emerald-600' : 
                              trend.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {trend.trend === 'up' ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : trend.trend === 'down' ? (
                                <ArrowDownRight className="h-3 w-3" />
                              ) : null}
                            </div>
                          </div>
                          <p className="text-3xl font-bold text-blue-900 mb-2">{totalAnalyses}</p>
                          <p className="text-xs text-blue-600">All time • Avg: {avgScore.toFixed(1)}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <MiniChart data={scoreHistory} color="bg-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-emerald-700">Completed</p>
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          </div>
                          <p className="text-3xl font-bold text-emerald-900 mb-2">{completedAnalyses}</p>
                          <p className="text-xs text-emerald-600">
                            {totalAnalyses > 0 ? Math.round((completedAnalyses / totalAnalyses) * 100) : 0}% success rate
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <CheckCircle className="h-8 w-8 text-emerald-600" />
                          <div className="text-right">
                            <div className="text-xs text-emerald-600">This week</div>
                            <div className="text-lg font-bold text-emerald-800">{completedAnalyses}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-purple-700">Active Monitoring</p>
                            <Timer className="h-3 w-3 text-purple-500" />
                          </div>
                          <p className="text-3xl font-bold text-purple-900 mb-2">{totalAnalyses - completedAnalyses}</p>
                          <p className="text-xs text-purple-600">Currently running</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Activity className="h-8 w-8 text-purple-600" />
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <span className="text-xs text-purple-600">Live</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-orange-700">Critical Issues</p>
                            <Zap className="h-3 w-3 text-orange-500" />
                          </div>
                          <p className="text-3xl font-bold text-orange-900 mb-2">{criticalIssues}</p>
                          <p className="text-xs text-orange-600">{totalIssues} total issues</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <AlertTriangle className="h-8 w-8 text-orange-600" />
                          <div className="text-right">
                            <div className="text-xs text-orange-600">Severity</div>
                            <div className="text-sm font-bold text-orange-800">
                              {criticalIssues > 0 ? 'High' : 'Low'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Performance Distribution */}
                  <Card className="lg:col-span-1 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span>Performance Distribution</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PerformanceDistribution reports={analyses} />
                    </CardContent>
                  </Card>

                  {/* Device Performance Comparison */}
                  <Card className="lg:col-span-1 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <div className="flex items-center space-x-1">
                          <Monitor className="h-4 w-4" />
                          <Smartphone className="h-4 w-4" />
                        </div>
                        <span>Device Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyses.slice(0, 3).map((analysis) => {
                          const desktop = analysis.report_data.performance?.raw_data?.desktop_performance?.performance_score || 0;
                          const mobile = analysis.report_data.performance?.raw_data?.mobile_performance?.performance_score || 0;
                          return (
                            <div key={analysis.task_id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700 truncate max-w-32">
                                  {getDomainFromUrl(analysis.report_data.url)}
                                </span>
                                <div className="flex space-x-2 text-xs">
                                  <span className="text-blue-600">D: {desktop}</span>
                                  <span className="text-purple-600">M: {mobile}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${desktop}%` }}
                                  />
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{ width: `${mobile}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex justify-center space-x-4 text-xs text-gray-500 pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded" />
                            <span>Desktop</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded" />
                            <span>Mobile</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="lg:col-span-1 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                        <span>Quick Stats</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Avg Analysis Time</span>
                          </div>
                          <span className="font-semibold">1m 12s</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Unique Domains</span>
                          </div>
                          <span className="font-semibold">{new Set(analyses.map(a => getDomainFromUrl(a.report_data.url))).size}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Best Score</span>
                          </div>
                          <span className="font-semibold text-emerald-600">
                            {analyses.length > 0 ? Math.max(...analyses.map(a => a.report_data.summary?.overall_score ?? 0)).toFixed(0) : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingDown className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Needs Work</span>
                          </div>
                          <span className="font-semibold text-red-600">
                            {analyses.filter(a => (a.report_data.summary?.overall_score ?? 0) < 60).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Recent Activity */}
                <Card className="shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span>Recent Analysis Activity</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Last 30 days</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          View All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {analyses.slice(0, 5).map((analysis) => {
                        const desktop = (analysis.report_data.performance?.raw_data?.desktop_performance?.performance_score as number) || 0;
                        const mobile = (analysis.report_data.performance?.raw_data?.mobile_performance?.performance_score as number) || 0;
                        return (
                          <div key={analysis.task_id} className="group relative">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Globe className="h-6 w-6 text-white" />
                                  </div>
                                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    analysis.report_data.status === 'completed' ? 'bg-emerald-500' : 'bg-yellow-500'
                                  }`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                      {getDomainFromUrl(analysis.report_data.url)}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                      <Monitor className="h-3 w-3 text-blue-500" />
                                      <span className="text-xs text-blue-600 font-medium">{desktop}</span>
                                      <Smartphone className="h-3 w-3 text-purple-500 ml-1" />
                                      <span className="text-xs text-purple-600 font-medium">{mobile}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <p className="text-sm text-gray-500">{formatRelativeTime(analysis.created_at.$date)}</p>
                                    <div className="text-xs text-gray-400">•</div>
                                    <p className="text-xs text-gray-500">{analysis.report_data.summary?.total_issues ?? 0} issues</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <Badge className={`${getScoreColor(analysis.report_data.summary?.overall_score ?? 0)} border text-sm font-semibold px-3 py-1`}>
                                    {(analysis.report_data.summary?.overall_score ?? 0).toFixed(0)}
                                  </Badge>
                                  <div className="mt-1 flex items-center justify-end space-x-1">
                                    <div className={`w-5 h-5 rounded-full ${getGradeColor(analysis.report_data.summary?.grade ?? 'F')} flex items-center justify-center`}>
                                      <span className="text-white text-xs font-bold">{analysis.report_data.summary?.grade ?? 'F'}</span>
                                    </div>
                                  </div>
                                </div>
                                <Link href={`/report/${analysis.task_id}`}>
                                  <Button size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-all bg-gray-100 text-gray-700 border-0">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced All Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                {/* Advanced Filter and Search Bar */}
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search domains..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        {/* Filter Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-48 border-gray-200 justify-between">
                              <div className="flex items-center space-x-2">
                                <Filter className="h-4 w-4" />
                                <span>{getFilterLabel()}</span>
                              </div>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48">
                            <DropdownMenuItem onClick={() => setSelectedFilter('all')}>All Reports</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedFilter('completed')}>Completed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedFilter('pending')}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedFilter('high-score')}>High Score (80+)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedFilter('needs-attention')}>Needs Attention (&lt;60)</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Sort Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-40 border-gray-200 justify-between">
                              <span>{getSortLabel()}</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40">
                            <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('score-high')}>Score: High to Low</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('score-low')}>Score: Low to High</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('domain')}>Domain A-Z</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Results Counter and Export */}
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-gray-600 whitespace-nowrap">
                          Showing <span className="font-semibold text-gray-900">{filteredAndSortedAnalyses.length}</span> of <span className="font-semibold text-gray-900">{totalAnalyses}</span> analyses
                        </p>
                        {/* <Button variant="outline" size="sm" className="flex items-center space-x-2 whitespace-nowrap">
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Export</span>
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {filteredAndSortedAnalyses.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndSortedAnalyses.map((analysis) => {
                      const desktop = (analysis.report_data.performance?.raw_data?.desktop_performance?.performance_score as number) || 0;
                      const mobile = (analysis.report_data.performance?.raw_data?.mobile_performance?.performance_score as number) || 0;
                      const issues = analysis.report_data.summary;
                      return (
                        <Card key={analysis.task_id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 hover:border-blue-300 relative overflow-hidden">
                          {/* Status indicator */}
                          <div className={`absolute top-0 left-0 w-full h-1 ${
                            analysis.report_data.status === 'completed' ? 'bg-emerald-500' : 'bg-yellow-500'
                          }`} />
                          
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-5">
                              <div className="flex items-start space-x-3 flex-1 min-w-0">
                                <div className="relative flex-shrink-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    <Globe className="h-6 w-6 text-white" />
                                  </div>
                                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    analysis.report_data.status === 'completed' ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'
                                  }`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate text-lg">
                                    {getDomainFromUrl(analysis.report_data.url)}
                                  </p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <p className="text-sm text-gray-500">{formatDate(analysis.created_at.$date)}</p>
                                    <div className="text-xs text-gray-400">•</div>
                                    <p className="text-xs text-gray-500">{analysis.report_data.summary?.analysis_duration ?? ''}</p>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Monitor className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs text-blue-600 font-medium">{desktop}</span>
                                    <Smartphone className="h-3 w-3 text-purple-500" />
                                    <span className="text-xs text-purple-600 font-medium">{mobile}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-4">
                                <Badge className={`${getScoreColor(analysis.report_data.summary?.overall_score ?? 0)} border text-base font-bold px-3 py-1.5`}>
                                  {(analysis.report_data.summary?.overall_score ?? 0).toFixed(0)}
                                </Badge>
                                <div className={`w-8 h-8 rounded-full ${getGradeColor(analysis.report_data.summary?.grade ?? 'F')} flex items-center justify-center shadow-md`}>
                                  <span className="text-white text-sm font-bold">{analysis.report_data.summary?.grade ?? 'F'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Enhanced metrics grid */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-center mb-1">
                                  <Zap className="h-4 w-4 text-blue-600 mr-1" />
                                  <p className="text-xs font-medium text-blue-700">Performance</p>
                                </div>
                                <p className="text-lg font-bold text-blue-900">{(analysis.report_data.scores?.performance ?? 0).toFixed(0)}</p>
                                <div className="w-full bg-blue-200 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${analysis.report_data.scores?.performance ?? 0}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-center mb-1">
                                  <Target className="h-4 w-4 text-purple-600 mr-1" />
                                  <p className="text-xs font-medium text-purple-700">Magento</p>
                                </div>
                                <p className="text-lg font-bold text-purple-900">{(analysis.report_data.scores?.magento ?? 0).toFixed(0)}</p>
                                <div className="w-full bg-purple-200 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${analysis.report_data.scores?.magento ?? 0}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-center mb-1">
                                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                                  <p className="text-xs font-medium text-orange-700">Issues</p>
                                </div>
                                <p className="text-lg font-bold text-orange-900">{issues?.total_issues ?? 0}</p>
                                <p className="text-xs text-orange-600 mt-1">
                                  {issues?.critical_issues ?? 0} critical
                                </p>
                              </div>
                            </div>

                            {/* Action row */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-600">
                                  Grade <span className="font-semibold">{analysis.report_data.summary?.grade ?? 'N/A'}</span>
                                </div>
                                {analysis.report_data.status !== 'completed' && (
                                  <div className="flex items-center space-x-1 text-xs text-yellow-600">
                                    <Clock className="h-3 w-3 animate-spin" />
                                    <span>Processing...</span>
                                  </div>
                                )}
                              </div>
                              <Link href={`/report/${analysis.task_id}`}>
                                <Button size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-all bg-gray-100 text-gray-700 border-0 shadow-sm hover:shadow-md">
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">View Report</span>
                                  <span className="sm:hidden">View</span>
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="text-center py-20">
                    <CardContent>
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <FileText className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <Search className="h-3 w-3 text-blue-600" />
                          </div>
                        </div>
                        <div className="max-w-md">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">No reports found</h3>
                          <p className="text-gray-500 leading-relaxed">
                            {selectedFilter === 'completed' && searchTerm 
                              ? `No completed analyses found matching "${searchTerm}".`
                              : selectedFilter === 'completed' 
                              ? 'No completed analyses match your current filter.'
                              : selectedFilter === 'pending' && searchTerm
                              ? `No pending analyses found matching "${searchTerm}".`
                              : selectedFilter === 'pending'
                              ? 'No pending analyses found.'
                              : selectedFilter === 'high-score' && searchTerm
                              ? `No high-scoring analyses found matching "${searchTerm}".`
                              : selectedFilter === 'high-score'
                              ? 'No analyses with scores 80+ found.'
                              : selectedFilter === 'needs-attention' && searchTerm
                              ? `No analyses needing attention found matching "${searchTerm}".`
                              : selectedFilter === 'needs-attention'
                              ? 'No analyses with scores below 60 found.'
                              : searchTerm
                              ? `No analyses found matching "${searchTerm}".`
                              : 'No analyses available yet.'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                          {(selectedFilter !== 'all' || searchTerm) && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedFilter('all');
                                setSearchTerm('');
                              }}
                              className="flex items-center space-x-2"
                            >
                              <Filter className="h-4 w-4" />
                              <span>Clear Filters</span>
                            </Button>
                          )}
                          <Link href="/">
                            <Button className="flex items-center space-x-2">
                              <Activity className="h-4 w-4" />
                              <span>Start New Analysis</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
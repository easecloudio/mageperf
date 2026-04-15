'use client';

import { DualSidebarLayout } from '@/components/layout/DualSidebarLayout';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useReport } from '@/contexts/ReportContext';
import { ListChecks, Lightbulb, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

export default function RecommendationsPage() {
  const params = useParams();
  const taskId = params.task_id as string;
  const { report, loading } = useReport();

  // Calculate dynamic counts based on actual data (same logic as Recommendations component)
  const dynamicCounts = useMemo(() => {
    if (!report) return { opportunities: 0, optimizations: 0 };

    const reportData = report.report_data;

    // Performance Opportunities Count (using desktop data as default)
    const desktopPerformance = reportData.performance?.raw_data?.desktop_performance || {};
    const opportunitiesData = ((desktopPerformance as Record<string, unknown>).opportunities as Array<{ potential_savings: number }> || [])
      .filter((opp: { potential_savings: number }) => opp.potential_savings > 0);
    const diagnosticsData = ((desktopPerformance as Record<string, unknown>).diagnostics as Array<Record<string, unknown>> || [])
      .filter((diag: Record<string, unknown>) => (diag.potential_savings as number) > 0 || (diag.display_value as string)?.includes('savings'));

    // Combine and deduplicate opportunities
    const combinedOpportunities: Record<string, unknown>[] = [...opportunitiesData];
    diagnosticsData.forEach((diag: Record<string, unknown>) => {
      if (!combinedOpportunities.find((opp: Record<string, unknown>) => opp.id === diag.id)) {
        combinedOpportunities.push(diag);
      }
    });
    const opportunitiesCount = combinedOpportunities.length;

    // Optimization Count
    const recommendations = reportData.recommendations as Record<string, unknown[]> | undefined;
    const basicRecommendations = [
      ...(recommendations?.critical || []),
      ...(recommendations?.high || []),
      ...(recommendations?.medium || [])
    ];

    const optimizationsCount = basicRecommendations.length;

    return {
      opportunities: opportunitiesCount,
      optimizations: optimizationsCount
    };
  }, [report]);

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

  if (!report) {
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
      <div className="min-h-screen/2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Professional Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <ListChecks className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Recommendations Overview
                </h1>
                <p className="text-gray-600">
                  Choose a recommendation category to view detailed insights
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Recommendation Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Performance Opportunities */}
            <Link href={`/report/${taskId}/recommendations/performance-opportunities`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Lightbulb className="h-8 w-8 text-blue-600" />
                    <span className="text-xl text-gray-900">Performance Opportunities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Specific recommendations to improve your website&apos;s performance metrics, Core Web Vitals, and user experience.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Focus Areas:</span>
                      <Badge variant="outline" className="bg-white/50">
                        {dynamicCounts.opportunities} {dynamicCounts.opportunities === 1 ? 'opportunity' : 'opportunities'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      • Page Speed Optimization<br/>
                      • Image &amp; Asset Loading<br/>
                      • Core Web Vitals Improvements<br/>
                      • JavaScript &amp; CSS Optimization
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-6 text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-medium">Explore Opportunities</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Optimization */}
            <Link href={`/report/${taskId}/recommendations/optimization`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-orange-600" />
                    <span className="text-xl text-gray-900">Optimization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Advanced optimization techniques and Magento-specific configurations to maximize your store&apos;s performance.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Focus Areas:</span>
                      <Badge variant="outline" className="bg-white/50">
                        {dynamicCounts.optimizations} {dynamicCounts.optimizations === 1 ? 'optimization' : 'optimizations'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      • Magento Configuration<br/>
                      • Caching &amp; CDN Setup<br/>
                      • Database Optimization<br/>
                      • Extension Management
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-6 text-orange-600 group-hover:translate-x-1 transition-transform">
                    <span className="text-sm font-medium">View Optimizations</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DualSidebarLayout>
  );
}

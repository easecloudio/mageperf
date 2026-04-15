'use client';

import { DualSidebarLayout } from '@/components/layout/DualSidebarLayout';
import { Recommendations } from '@/components/report/Recommendations';
import { useParams } from 'next/navigation';
import { useReport } from '@/contexts/ReportContext';
import { Settings } from 'lucide-react';

export default function OptimizationPage() {
  const params = useParams();
  const taskId = params.task_id as string;
  const { report, loading } = useReport();

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

  const reportData = report.report_data;

  return (
    <DualSidebarLayout reportId={taskId}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Professional Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Optimization
                </h1>
                <p className="text-gray-600">
                  Advanced optimization techniques and Magento-specific configurations
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Content */}
          <Recommendations
            reportData={reportData}
            selectedTab="optimization"
            selectedDevice="desktop"
          />
        </div>
      </div>
    </DualSidebarLayout>
  );
}

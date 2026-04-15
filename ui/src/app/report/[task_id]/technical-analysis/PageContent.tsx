'use client';

import { DualSidebarLayout } from '@/components/layout/DualSidebarLayout';
import { TechnicalAnalysis } from '@/components/report/TechnicalAnalysis';
import { useParams } from 'next/navigation';
import { useReport } from '@/contexts/ReportContext';

export default function TechnicalAnalysisPage() {
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
      <TechnicalAnalysis reportData={reportData} />
    </DualSidebarLayout>
  );
}

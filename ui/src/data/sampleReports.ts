// Sample report data for whiteboarding - using real data structure from sample-report-data.json
// NOTE: sampleReports are kept only as fallback type references.
// Real data is fetched from the local CLI API via src/lib/localApi.ts
// and injected via ReportContext / ReportsContext.
export { useReport } from '@/contexts/ReportContext';
import sampleReport1 from './sampleReport1.json'

// Create variations of the sample data for multiple reports
export const sampleReports = [
  // Original report - magento.softwaretestingboard.com
  sampleReport1,
  
  // Variation 1 - Better performing store
  {
    ...sampleReport1,
    _id: { $oid: "689c64cb9e2e8ad7b1cd7f77" },
    task_id: "c849ef3b-g5d9-5c31-bcde-f4e996e5a98e",
    created_at: { $date: "2025-07-28T14:22:15.000Z" },
    report_data: {
      ...sampleReport1.report_data,
      generated_at: "2025-07-28T14:22:15.123456",
      url: "https://demo-store.example.com",
      summary: {
        overall_score: 85.2,
        grade: "B",
        total_issues: 8,
        critical_issues: 2,
        analysis_duration: "45s"
      },
      scores: {
        overall: 85.2,
        performance: 89.1,
        magento: 81.3,
        breakdown: {
          performance: 89.1,
          magento_overall: 81.3,
          magento_configuration: 95,
          magento_security: 100,
          magento_optimization: 75,
          magento_extensions: 90,
          magento_seo: 50
        }
      },
      magento: {
        ...sampleReport1.report_data.magento,
        confidence: 95,
        version: "2.4.7"
      },
      performance: {
        ...sampleReport1.report_data.performance,
        raw_data: {
          ...sampleReport1.report_data.performance.raw_data,
          desktop_performance: {
            ...sampleReport1.report_data.performance.raw_data.desktop_performance,
            performance_score: 94,
            accessibility_score: 98,
            best_practices_score: 100,
            seo_score: 91,
            core_web_vitals: {
              largest_contentful_paint: { value: 425.8, score: 1, display_value: "0.4 s", unit: "millisecond" },
              first_input_delay: { value: 45, score: 1, display_value: "50 ms", unit: "millisecond" },
              cumulative_layout_shift: { value: 0.002, score: 1, display_value: "0.002", unit: "unitless" },
              first_contentful_paint: { value: 287.5, score: 1, display_value: "0.3 s", unit: "millisecond" },
              time_to_interactive: { value: 1854.2, score: 0.98, display_value: "1.9 s", unit: "millisecond" },
              speed_index: { value: 985.4, score: 0.96, display_value: "1.0 s", unit: "millisecond" },
              total_blocking_time: { value: 8, score: 1, display_value: "10 ms", unit: "millisecond" }
            }
          },
          mobile_performance: {
            ...sampleReport1.report_data.performance.raw_data.mobile_performance,
            performance_score: 87,
            accessibility_score: 95,
            best_practices_score: 88,
            seo_score: 89
          }
        }
      }
    }
  },

  // Variation 2 - Average performing store
  {
    ...sampleReport1,
    _id: { $oid: "690c64cb9e2e8ad7b1cd7f78" },
    task_id: "d94afg4c-h6e0-6d42-cdef-g5fa07f6b09f",
    created_at: { $date: "2025-07-25T09:15:30.000Z" },
    report_data: {
      ...sampleReport1.report_data,
      generated_at: "2025-07-25T09:15:30.654321",
      url: "https://test.magentoshop.com",
      summary: {
        overall_score: 72.6,
        grade: "C",
        total_issues: 12,
        critical_issues: 4,
        analysis_duration: "1m 15s"
      },
      scores: {
        overall: 72.6,
        performance: 68.9,
        magento: 76.3,
        breakdown: {
          performance: 68.9,
          magento_overall: 76.3,
          magento_configuration: 85,
          magento_security: 100,
          magento_optimization: 45,
          magento_extensions: 80,
          magento_seo: 65
        }
      },
      magento: {
        ...sampleReport1.report_data.magento,
        confidence: 87,
        version: "2.4.5"
      },
      performance: {
        ...sampleReport1.report_data.performance,
        raw_data: {
          ...sampleReport1.report_data.performance.raw_data,
          desktop_performance: {
            ...sampleReport1.report_data.performance.raw_data.desktop_performance,
            performance_score: 82,
            accessibility_score: 87,
            best_practices_score: 79,
            seo_score: 76,
            core_web_vitals: {
              largest_contentful_paint: { value: 1245.7, score: 0.82, display_value: "1.2 s", unit: "millisecond" },
              first_input_delay: { value: 125, score: 0.85, display_value: "120 ms", unit: "millisecond" },
              cumulative_layout_shift: { value: 0.089, score: 0.78, display_value: "0.089", unit: "unitless" },
              first_contentful_paint: { value: 654.3, score: 0.92, display_value: "0.7 s", unit: "millisecond" },
              time_to_interactive: { value: 3876.5, score: 0.65, display_value: "3.9 s", unit: "millisecond" },
              speed_index: { value: 2145.8, score: 0.74, display_value: "2.1 s", unit: "millisecond" },
              total_blocking_time: { value: 185, score: 0.71, display_value: "180 ms", unit: "millisecond" }
            }
          },
          mobile_performance: {
            ...sampleReport1.report_data.performance.raw_data.mobile_performance,
            performance_score: 58,
            accessibility_score: 81,
            best_practices_score: 72,
            seo_score: 74
          }
        }
      }
    }
  }
]

// Helper to get report by task_id
export const getReportByTaskId = (taskId: string) => {
  return sampleReports.find(report => report.task_id === taskId) || sampleReports[0]
}

// Helper to get all domains with metadata
export const getAllDomains = () => {
  return sampleReports.map(report => ({
    id: report.task_id,
    name: new URL(report.report_data.url).hostname,
    url: report.report_data.url,
    lastAnalysis: report.created_at.$date,
    status: report.report_data.status,
    score: report.report_data.summary.overall_score,
    grade: report.report_data.summary.grade,
    issues: report.report_data.summary.total_issues,
    criticalIssues: report.report_data.summary.critical_issues
  }))
}

// Helper to get most recent report for a domain
export const getMostRecentReportByDomain = (domainName: string) => {
  const domainReports = sampleReports.filter(report => {
    const reportDomain = new URL(report.report_data.url).hostname
    return reportDomain === domainName
  })
  
  // Sort by creation date (most recent first) and return the first one
  if (domainReports.length === 0) return sampleReports[0] // Fallback to first report
  
  return domainReports.sort((a, b) => 
    new Date(b.created_at.$date).getTime() - new Date(a.created_at.$date).getTime()
  )[0]
}

export default sampleReports
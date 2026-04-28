/** Strongly-typed shape for per-device PageSpeed data */
export interface DevicePerformance {
  performance_score?: number;
  accessibility_score?: number;
  best_practices_score?: number;
  seo_score?: number;
  core_web_vitals?: {
    largest_contentful_paint?: { value?: number; score?: number; display_value?: string; unit?: string };
    first_input_delay?: { value?: number; score?: number; display_value?: string; unit?: string };
    cumulative_layout_shift?: { value?: number; score?: number; display_value?: string; unit?: string };
    first_contentful_paint?: { value?: number; score?: number; display_value?: string; unit?: string };
    time_to_interactive?: { value?: number; score?: number; display_value?: string; unit?: string };
    speed_index?: { value?: number; score?: number; display_value?: string; unit?: string };
    total_blocking_time?: { value?: number; score?: number; display_value?: string; unit?: string };
  };
  opportunities?: Array<{
    id?: string;
    title?: string;
    description?: string;
    potential_savings?: number;
    display_value?: string;
  }>;
  diagnostics?: Array<{
    id?: string;
    title?: string;
    description?: string;
    potential_savings?: number;
    display_value?: string;
  }>;
  [key: string]: unknown;
}

/** Typed raw performance data container */
export interface PerformanceRawData {
  desktop_performance?: DevicePerformance;
  mobile_performance?: DevicePerformance;
  ttfb_analysis?: {
    ttfb_ms?: number;
    grade?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE
    ? process.env.NEXT_PUBLIC_API_BASE
    : "http://localhost:4780";

/** A single finding entry from the CLI report. */
export interface ReportFinding {
  severity?: "critical" | "high" | "medium" | "low" | "info";
  priority?: number;
  recommendation?: string;
  category?: string;
  [key: string]: unknown;
}

/** A single recommendation entry — either a structured dict or a plain string. */
export type ReportRecommendation =
  | { priority?: number; severity?: string; category?: string; recommendation?: string; [key: string]: unknown }
  | string;

/** Shape saved by the CLI ReportStore */
export interface CliReport {
  id: string;
  url: string;
  created_at: string;
  status: string;
  magento_version?: string;
  overall_score: number;
  grade?: string;
  scores: {
    performance: number;
    security: number;
    config: number;
  };
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  raw?: {
    magento_detection?: Record<string, unknown>;
    magento_analysis?: Record<string, unknown>;
    performance?: Record<string, unknown>;
    scores?: Record<string, unknown>;
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isCliReport(v: unknown): v is CliReport {
  if (!isRecord(v)) return false;
  if (typeof v.id !== "string" || typeof v.url !== "string") return false;
  if (typeof v.created_at !== "string" || typeof v.status !== "string") return false;
  if (typeof v.overall_score !== "number") return false;
  if (!isRecord(v.scores)) return false;
  return true;
}

/**
 * Shape the UI components expect.
 * We transform the flat CLI report into this envelope so the existing
 * components can work without large rewrites.
 */
export interface UiReport {
  task_id: string;
  created_at: { $date: string };
  report_data: {
    generated_at: string;
    url: string;
    status: string;
    summary: {
      overall_score: number;
      grade: string;
      total_issues: number;
      critical_issues: number;
      analysis_duration: string;
    };
    scores: {
      overall: number;
      performance: number;
      magento: number;
      breakdown: {
        performance: number;
        magento_overall: number;
        magento_configuration: number;
        magento_security: number;
        magento_optimization: number;
        magento_extensions: number;
        magento_seo: number;
      };
    };
    magento: {
      is_magento: boolean;
      confidence: number;
      version: string | null;
      indicators?: string[];
    };
    performance: {
      overall_score: number;
      raw_data?: PerformanceRawData;
      categories?: Record<string, unknown>;
    };
    findings: ReportFinding[];
    recommendations: ReportRecommendation[] | {
      critical?: Array<{ category?: string; effort?: string; impact?: string; priority?: number; [key: string]: unknown }>;
      high?: Array<{ category?: string; effort?: string; impact?: string; priority?: number; [key: string]: unknown }>;
      medium?: Array<{ category?: string; effort?: string; impact?: string; priority?: number; [key: string]: unknown }>;
    };
    /** Optional detailed analysis data — present in whiteboarding data but may be absent in CLI reports */
    detailed_analysis?: {
      magento_analysis?: {
        categories?: {
          [category: string]: {
            score?: number;
            grade?: string;
            recommendations?: string[];
            [key: string]: unknown;
          };
        };
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    raw?: CliReport["raw"];
  };
}

/** Convert a CLI flat report into the UI envelope shape */
function adaptReport(r: CliReport): UiReport {
  const raw = r.raw ?? {};
  // magentoAnalysis available for future use
  const magentoDetection = (raw.magento_detection ?? {}) as Record<string, unknown>;
  const performanceRaw = (raw.performance ?? {}) as Record<string, unknown>;
  const scoresRaw = (raw.scores ?? {}) as Record<string, unknown>;
  const categoryScores = (scoresRaw.category_scores ?? {}) as Record<string, number>;

  const findings: ReportFinding[] = r.findings ?? [];
  const criticalFindings = findings.filter(
    (f) => f.severity === "critical" || f.priority === 5
  );

  // Build breakdown scores from category_scores
  const breakdown = {
    performance: r.scores?.performance ?? categoryScores.performance ?? 0,
    magento_overall: r.scores?.config ?? categoryScores.magento_overall ?? 0,
    magento_configuration:
      categoryScores.magento_configuration ?? r.scores?.config ?? 0,
    magento_security:
      r.scores?.security ?? categoryScores.magento_security ?? 0,
    magento_optimization: categoryScores.magento_optimization ?? 0,
    magento_extensions: categoryScores.magento_extensions ?? 0,
    magento_seo: categoryScores.magento_seo ?? 0,
  };

  const rawData = (performanceRaw.raw_data ?? {}) as PerformanceRawData;

  return {
    task_id: r.id,
    created_at: { $date: r.created_at },
    report_data: {
      generated_at: r.created_at,
      url: r.url,
      status: r.status,
      summary: {
        overall_score: r.overall_score ?? 0,
        grade: r.grade ?? scoresRaw.grade as string ?? "N/A",
        total_issues: findings.length,
        critical_issues: criticalFindings.length,
        analysis_duration: (scoresRaw.analysis_duration as string) ?? "—",
      },
      scores: {
        overall: r.overall_score ?? 0,
        performance: r.scores?.performance ?? 0,
        magento: r.scores?.config ?? 0,
        breakdown,
      },
      magento: {
        is_magento: (magentoDetection.is_magento as boolean) ?? true,
        confidence: (magentoDetection.confidence as number) ?? 0,
        version:
          r.magento_version ??
          (magentoDetection.version as string | null) ??
          null,
        indicators: (magentoDetection.indicators as string[]) ?? [],
      },
      performance: {
        overall_score: r.scores?.performance ?? 0,
        raw_data: rawData,
        categories: (performanceRaw.categories ?? {}) as Record<string, unknown>,
      },
      findings: r.findings ?? [],
      recommendations: r.recommendations ?? [],
      raw: r.raw,
    },
  };
}

export async function fetchReports(): Promise<UiReport[]> {
  const res = await fetch(`${API_BASE}/api/reports`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  const raw: unknown = await res.json();
  if (!Array.isArray(raw)) throw new Error("Unexpected response shape: expected array");
  return raw.filter(isCliReport).map(adaptReport);
}

export async function fetchReport(id: string): Promise<UiReport> {
  const res = await fetch(`${API_BASE}/api/reports/${id}`);
  if (!res.ok) throw new Error(`Report ${id} not found`);
  const raw: unknown = await res.json();
  if (!isCliReport(raw)) throw new Error(`Malformed report data for id: ${id}`);
  return adaptReport(raw);
}

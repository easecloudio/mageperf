"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { fetchReport, UiReport } from "@/lib/localApi";

interface ReportContextValue {
  report: UiReport | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const ReportContext = createContext<ReportContextValue>({
  report: null,
  loading: true,
  error: null,
  refresh: () => {},
});

export function ReportProvider({
  taskId,
  children,
}: {
  taskId: string;
  children: React.ReactNode;
}) {
  const [report, setReport] = useState<UiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchReport(taskId)
      .then((r) => {
        setReport(r);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load report");
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ReportContext.Provider value={{ report, loading, error, refresh: load }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport(): ReportContextValue {
  return useContext(ReportContext);
}

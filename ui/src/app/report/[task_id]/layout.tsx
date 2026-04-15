// For static export we pre-build no IDs — the page fetches real data
// client-side from the local API.  Unknown task_id values are served via
// the SPA fallback in the CLI server (index.html for all unmatched routes).
export function generateStaticParams() {
  return [{ task_id: '_' }];
}

export const dynamicParams = false;

export default function TaskIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

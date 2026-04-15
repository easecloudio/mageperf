// Server component wrapper — needed for generateStaticParams with output: "export"
// The actual client-side logic lives in PageContent.tsx
import PageContent from './PageContent';

// Must return at least one entry; actual IDs are fetched client-side at runtime.
// The CLI server's SPA fallback serves index.html for all unmatched routes.
export function generateStaticParams() {
  return [{ task_id: '_' }];
}

export default PageContent;

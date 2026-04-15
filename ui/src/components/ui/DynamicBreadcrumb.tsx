'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useReport } from '@/contexts/ReportContext';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

interface BreadcrumbPath {
  label: string;
  href?: string;
}

interface DynamicBreadcrumbProps {
  customPaths?: BreadcrumbPath[];
  reportId?: string;
  className?: string;
}

export function DynamicBreadcrumb({ customPaths, reportId, className }: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  // useReport reads from ReportContext; if not inside a ReportProvider the context
  // returns the default value (report: null), which is safe.
  const { report: contextReport } = useReport();

  // If custom paths are provided, use them
  if (customPaths) {
    return (
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {customPaths.map((path, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {path.href && index < customPaths.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={path.href}>{path.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{path.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = (): BreadcrumbPath[] => {
    const paths: BreadcrumbPath[] = [];
    const segments = pathname.split('/').filter(Boolean);

    // Get report data from context (injected by ReportProvider via DualSidebarLayout)
    const report = reportId ? contextReport : null;
    const currentDomain = report?.report_data?.url ? new URL(report.report_data.url).hostname.replace('www.', '') : null;

    // Handle different page types
    if (segments[0] === 'all-analysis') {
      paths.push({ label: 'Analytics Dashboard' });
    } else if (segments[0] === 'progress') {
      paths.push({ label: 'Live Analysis' });
    } else if (segments[0] === 'settings') {
      paths.push({ label: 'Account Settings' });
    } else if (segments[0] === 'profile') {
      paths.push({ label: 'User Profile' });
    } else if (segments[0] === 'report' && segments[1]) {
      // Report pages
      paths.push({ label: 'Reports', href: '/all-analysis' });
      
      if (segments.length === 2) {
        // Main report page
        paths.push({ label: currentDomain || 'Report Overview' });
      } else if (segments[2]) {
        // Report subpages
        paths.push({ 
          label: currentDomain || 'Report Overview', 
          href: `/report/${segments[1]}` 
        });
        
        const subpageMap: Record<string, string> = {
          'core-web-vitals': 'Core Web Vitals',
          'technical-analysis': 'Technical Analysis',
          'recommendations': 'Recommendations',
          'performance-trends': 'Performance Trends',
          'roadmap': 'Optimization Roadmap'
        };
        
        // Handle nested recommendations pages
        if (segments[2] === 'recommendations' && segments[3]) {
          paths.push({ 
            label: 'Recommendations', 
            href: `/report/${segments[1]}/recommendations` 
          });
          
          const nestedMap: Record<string, string> = {
            'performance-opportunities': 'Performance Opportunities',
            'optimization': 'Optimization Guide'
          };
          
          paths.push({ label: nestedMap[segments[3]] || segments[3] });
        } else {
          paths.push({ label: subpageMap[segments[2]] || segments[2] });
        }
      }
    }

    return paths;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.href && index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
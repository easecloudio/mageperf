'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  Wrench,
  Route,
  Settings,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ReportSidebarProps {
  reportId: string;
  onNavigate?: () => void;
}

export function ReportSidebar({ reportId, onNavigate }: ReportSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const navItems = useMemo(() => [
    { 
      href: `/report/${reportId}`, 
      label: 'Overview', 
      icon: LayoutDashboard,
      description: 'Summary & key metrics'
    },
    { 
      href: `/report/${reportId}/core-web-vitals`, 
      label: 'Core Web Vitals', 
      icon: HeartPulse,
      description: 'LCP, FID, CLS metrics'
    },
    { 
      href: `/report/${reportId}/performance-trends`, 
      label: 'Performance Trends', 
      icon: TrendingUp,
      description: 'Historical data & trends'
    },
    {
      href: `/report/${reportId}/recommendations`,
      label: 'Recommendations',
      icon: Target,
      description: 'Optimization opportunities',
      subItems: [
        { 
          href: `/report/${reportId}/recommendations/performance-opportunities`, 
          label: 'Performance Opportunities', 
          icon: Zap,
          description: 'Quick wins & improvements'
        },
        { 
          href: `/report/${reportId}/recommendations/optimization`, 
          label: 'Optimization Guide', 
          icon: Settings,
          description: 'Detailed implementation'
        },
      ]
    },
    { 
      href: `/report/${reportId}/technical-analysis`, 
      label: 'Technical Analysis', 
      icon: Wrench,
      description: 'Code & configuration review'
    },
    { 
      href: `/report/${reportId}/roadmap`, 
      label: 'Optimization Roadmap', 
      icon: Route,
      description: 'Strategic implementation plan'
    },
  ], [reportId]);

  // Effect to expand parent if a sub-item is active on page load
  useEffect(() => {
    const activeParent = navItems.find(item => item.subItems?.some(sub => pathname === sub.href));
    if (activeParent) {
      setExpandedItems(prev => new Set(prev).add(activeParent.label));
    }
  }, [pathname, navItems]);


  const toggleExpanded = (itemKey: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemKey)) {
        newExpanded.delete(itemKey);
      } else {
        newExpanded.add(itemKey);
      }
      return newExpanded;
    });
  };

  const handleNavigate = () => {
    onNavigate?.();
  };

  const renderNavItems = (isMobileView: boolean) => (
    <div className="space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const isSubmenuParentActive = item.subItems?.some(sub => pathname.startsWith(sub.href)) || pathname === item.href;
        const hasSubItems = !!item.subItems;
        const isExpanded = expandedItems.has(item.label);

        return (
          <div key={item.label}>
            {hasSubItems ? (
              <>
                {/* Enhanced Container for the parent item */}
                <div
                  className={`flex items-center justify-between w-full rounded-xl text-sm font-medium transition-all duration-200 min-h-[52px] border group ${
                    isSubmenuParentActive
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 border-orange-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 border-transparent hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <Link
                    href={item.href}
                    onClick={isMobileView ? handleNavigate : undefined}
                    className="flex flex-grow items-center px-4 py-3 hover:text-gray-900 min-w-0"
                  >
                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isSubmenuParentActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-orange-600'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">{item.description}</div>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className="p-2 mr-2 rounded-lg hover:bg-blue-100/50 transition-colors"
                    aria-label={`Toggle ${item.label} submenu`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600" />
                    )}
                  </button>
                </div>
                {/* Enhanced Sub-items list (collapsible) */}
                {isExpanded && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-blue-100 pl-4">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={isMobileView ? handleNavigate : undefined}
                          className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 min-h-[48px] border group ${
                            isSubActive
                              ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-300 shadow-sm'
                              : 'text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-gray-800 border-transparent hover:border-orange-200'
                          }`}
                        >
                          <subItem.icon className={`mr-3 h-4 w-4 flex-shrink-0 transition-colors ${
                            isSubActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-orange-600'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate">{subItem.label}</div>
                            {subItem.description && (
                              <div className="text-xs text-gray-500 truncate mt-0.5">{subItem.description}</div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                onClick={isMobileView ? handleNavigate : undefined}
                className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 min-h-[52px] border group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 border-orange-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:text-gray-900 border-transparent hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-orange-600'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 truncate mt-0.5">{item.description}</div>
                  )}
                </div>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );

  // Mobile version (rendered inside sheet)
  if (isMobile) {
    return (
      <nav className="flex flex-col p-6">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Report Sections</h3>
          <p className="text-xs text-gray-500 mt-1">Navigate through analysis results</p>
        </div>
        {renderNavItems(true)}
      </nav>
    );
  }

  // Desktop version  
  return (
    <div className="sticky top-0 h-screen flex w-72 flex-col border-r border-gray-200 bg-gradient-to-b from-white to-gray-50">
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6 bg-gradient-to-r from-orange-50 to-red-50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Report Sections</h2>
          <p className="text-xs text-gray-600 font-medium">Navigate analysis results</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-6 overflow-y-auto">
        {renderNavItems(false)}
      </nav>
    </div>
  );
}
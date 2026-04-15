'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/logo';
import { PageTransition, MobilePageTransition } from './PageTransition';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: ReactNode;
  headerContent?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  animated?: boolean;
  transitionVariant?: 'fade' | 'slide' | 'modal' | 'instant';
}

export function AppLayout({ 
  children, 
  showBackButton = false,
  breadcrumbs,
  headerActions,
  headerContent,
  fullWidth = false,
  className = '',
  animated = true,
  transitionVariant = 'fade'
}: AppLayoutProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 ${className}`}>
      {/* Unified Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className={`${fullWidth ? 'w-full' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile: Back button comes first */}
              {isMobile && showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-9 w-9 -ml-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Go back</span>
                </Button>
              )}

              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <Logo />
                  <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
                    Magento Performance
                  </span>
                </Link>
              </div>

              {/* Desktop: Back button after logo */}
              {!isMobile && showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            {/* Breadcrumbs - Center on desktop, mobile below header */}
            {!isMobile && breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex-1 px-6 max-w-2xl">
                <Breadcrumb>
                  <BreadcrumbList className="justify-center">
                    {breadcrumbs.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <BreadcrumbItem>
                          {item.href ? (
                            <BreadcrumbLink asChild>
                              <Link href={item.href}>{item.label}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <span className="text-gray-600">{item.label}</span>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {headerActions}
            </div>
          </div>
        </div>

        {/* Mobile breadcrumbs below main header */}
        {isMobile && breadcrumbs && breadcrumbs.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-2">
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap overflow-x-auto">
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center flex-shrink-0">
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href} className="text-sm">{item.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-gray-600 text-sm truncate">{item.label}</span>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="flex-shrink-0" />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Optional header content below main header */}
        {headerContent && (
          <div className="border-t border-gray-100">
            {headerContent}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`${fullWidth ? 'w-full' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {animated ? (
          isMobile ? (
            <MobilePageTransition>
              {children}
            </MobilePageTransition>
          ) : (
            <PageTransition variant={transitionVariant}>
              {children}
            </PageTransition>
          )
        ) : (
          children
        )}
      </main>
    </div>
  );
}
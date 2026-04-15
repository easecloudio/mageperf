'use client';

import { useState, useEffect } from "react";
import { MainSidebar } from "@/components/MainSidebar";
import { ReportSidebar } from "./ReportSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/ui/DynamicBreadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, BarChart3 } from "lucide-react";
import { MobileNavigation, BottomTabNavigation } from "@/components/mobile/MobileNavigation";
import { ReportProvider, useReport } from "@/contexts/ReportContext";

interface DualSidebarLayoutProps {
  reportId: string;
  children: React.ReactNode;
}

function DualSidebarLayoutInner({ reportId, children }: DualSidebarLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Get the report from context (fetched by ReportProvider)
  const { report } = useReport();
  const currentDomain = report?.report_data?.url
    ? new URL(report.report_data.url).hostname
    : undefined;

  // Loading state simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [reportId]);

  // Enhanced Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
        {/* Enhanced Mobile Navigation */}
        <MobileNavigation currentDomain={currentDomain} />

        {/* Mobile Content with enhanced touch optimizations */}
        <main className="flex-1 overflow-y-auto smooth-scroll thumb-zone">
          {/* Premium Report Navigation Sheet */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="fixed top-4 right-4 z-50 h-12 w-12 touch-target bg-white/95 backdrop-blur-sm shadow-xl border-2 border-orange-200 hover:border-orange-300 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                {mobileNavOpen ? (
                  <X className="h-5 w-5 text-gray-700" />
                ) : (
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                )}
                <span className="sr-only">Report sections</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0 border-0 shadow-2xl">
              <SheetHeader className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-lg font-bold text-gray-900">Report Navigation</SheetTitle>
                    {currentDomain && (
                      <p className="text-sm text-gray-600 font-medium truncate mt-1">{currentDomain}</p>
                    )}
                  </div>
                  <div className="px-3 py-1 bg-orange-100 border border-orange-200 rounded-full">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </SheetHeader>
              <div className="flex flex-col h-[calc(100%-100px)] bg-white">
                {/* Report Sections with enhanced styling */}
                <div className="flex-1 overflow-y-auto smooth-scroll">
                  <ReportSidebar reportId={reportId} onNavigate={() => setMobileNavOpen(false)} />
                </div>
                {/* Enhanced Domain Switcher in mobile drawer */}
                <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                  <MainSidebar currentDomain={currentDomain} variant="compact" />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Content with enhanced mobile padding */}
          <div className="p-4 pb-24 min-h-[calc(100vh-4rem)]">
            <div className={`transition-all duration-500 ${
              isLoading 
                ? 'opacity-0 translate-y-4' 
                : 'opacity-100 translate-y-0 animate-in fade-in-0 slide-in-from-bottom-4'
            }`}>
              {children}
            </div>
          </div>
        </main>

        {/* Enhanced Bottom Tab Navigation */}
        <BottomTabNavigation />
      </div>
    );
  }

  // Enhanced Desktop layout with premium dual sidebars
  return (
    <SidebarProvider>

      <MainSidebar currentDomain={currentDomain} />
      <div className="flex flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Report Navigation Sidebar */}
        <ReportSidebar reportId={reportId} />
        
        {/* Premium Main Content Area */}
        <SidebarInset className="bg-transparent">
          <header className="flex h-16 shrink-0 items-center gap-4 px-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
            <SidebarTrigger className="-ml-1 p-2 rounded-lg hover:bg-blue-50 transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-6 bg-gray-300" />
            <DynamicBreadcrumb reportId={reportId} />
          </header>
          <div className="flex-1 overflow-y-auto p-8">
            <div className={`transition-all duration-700 max-w-7xl mx-auto ${
              isLoading 
                ? 'opacity-0 translate-y-8 scale-95' 
                : 'opacity-100 translate-y-0 scale-100 animate-in fade-in-0 slide-in-from-bottom-6'
            }`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 min-h-[calc(100vh-12rem)]">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export function DualSidebarLayout({ reportId, children }: DualSidebarLayoutProps) {
  return (
    <ReportProvider taskId={reportId}>
      <DualSidebarLayoutInner reportId={reportId}>
        {children}
      </DualSidebarLayoutInner>
    </ReportProvider>
  );
}

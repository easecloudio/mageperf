'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  Menu, 
  X, 
  ArrowLeft,
  Globe,
  ChevronRight,
  User,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

interface MobileNavigationProps {
  className?: string;
  currentDomain?: string;
  onDomainChange?: (domain: string) => void;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: BarChart3, label: 'All Analysis', href: '/all-analysis' },
  { icon: TrendingUp, label: 'Progress Tracking', href: '/progress' },
];

const quickActions: NavItem[] = [
  { icon: Globe, label: 'New Analysis', href: '/' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export function MobileNavigation({ className, currentDomain }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, currentX: 0 });
  const pathname = usePathname();
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Swipe to open navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0].clientX < 20) {
      setDragState({
        isDragging: true,
        startX: e.touches[0].clientX,
        currentX: e.touches[0].clientX
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        currentX: e.touches[0].clientX
      }));
    }
  };

  const handleTouchEnd = () => {
    if (dragState.isDragging) {
      const deltaX = dragState.currentX - dragState.startX;
      if (deltaX > 50) {
        setIsOpen(true);
      }
      setDragState({ isDragging: false, startX: 0, currentX: 0 });
    }
  };

  useEffect(() => {
    // Close navigation when route changes
    setIsOpen(false);
  }, [pathname]);

  const handleBackNavigation = () => {
    router.back();
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className={cn(
        "flex h-14 items-center justify-between px-4 bg-white border-b border-gray-200 sticky top-0 z-40",
        "lg:hidden", // Only show on mobile
        className
      )}>
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackNavigation}
          className="h-10 w-10 touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>

        {/* Logo/Title */}
        <div className="flex items-center gap-2 min-w-0">
          <Logo />
          <span className="text-sm font-semibold text-gray-900 truncate">
            Magento Performance
          </span>
        </div>

        {/* Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 touch-target"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          
          <SheetContent 
            ref={sheetRef}
            side="right" 
            className="w-80 p-0 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center gap-3">
                  <Logo />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                    {currentDomain && (
                      <p className="text-sm text-gray-600 truncate max-w-48">{currentDomain}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 touch-target"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Main Navigation */}
                <div className="p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Main Navigation
                  </h3>
                  <nav className="space-y-1">
                    {mainNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors touch-target",
                            isActive
                              ? "bg-orange-50 text-orange-700 border border-orange-200"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isActive ? "text-orange-600" : "text-gray-500"
                          )} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Quick Actions
                  </h3>
                  <nav className="space-y-1">
                    {quickActions.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors touch-target"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0 text-gray-500" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    ))}
                  </nav>
                </div>

                <Separator />

                {/* User Section */}
                <div className="p-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500 truncate">john.doe@example.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  v1.0.0 • Magento Performance Tool
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Touch Area for Swipe Gesture */}
      <div
        className="fixed inset-y-0 left-0 w-5 z-30 lg:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </>
  );
}

// Bottom Tab Navigation Component
interface BottomTabNavigationProps {
  className?: string;
}

export function BottomTabNavigation({ className }: BottomTabNavigationProps) {
  const pathname = usePathname();

  const tabItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: BarChart3, label: 'Analysis', href: '/all-analysis' },
    { icon: TrendingUp, label: 'Progress', href: '/progress' },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb",
      "lg:hidden", // Only show on mobile
      className
    )}>
      <div className="flex">
        {tabItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-16 touch-target transition-colors",
                isActive
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 mb-1",
                isActive ? "text-orange-600" : "text-gray-400"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-orange-700" : "text-gray-600"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Card } from './card';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// Touch-optimized button with haptic feedback simulation
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  haptic?: boolean;
  children: ReactNode;
}

export function TouchButton({ 
  size = 'md', 
  haptic = true, 
  className, 
  children, 
  onTouchStart,
  ...props 
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
    onTouchStart?.(e);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <Button
      {...props}
      className={cn(
        'min-h-11 min-w-11 touch-target transition-transform active:scale-95',
        size === 'sm' && 'min-h-9 min-w-9 text-sm',
        size === 'lg' && 'min-h-14 min-w-14 text-lg',
        isPressed && 'transform scale-95',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </Button>
  );
}

// Swipeable Card Component
interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  threshold = 50
}: SwipeableCardProps) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragState({
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging) return;
    
    const touch = e.touches[0];
    setDragState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));

    // Update visual feedback
    const deltaX = touch.clientX - dragState.startX;
    const deltaY = touch.clientY - dragState.startY;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${deltaX * 0.3}px, ${deltaY * 0.3}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!dragState.isDragging) return;

    const deltaX = dragState.currentX - dragState.startX;
    const deltaY = dragState.currentY - dragState.startY;

    // Reset visual feedback
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        'transition-transform duration-200 ease-out touch-pan-y',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </Card>
  );
}

// Pull to Refresh Component
interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  refreshThreshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  refreshThreshold = 80
}: PullToRefreshProps) {
  const [pullState, setPullState] = useState({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    startY: 0,
    currentY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setPullState(prev => ({
      ...prev,
      startY: touch.clientY,
      currentY: touch.clientY,
    }));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const container = containerRef.current;
    
    if (!container) return;
    
    // Only activate pull-to-refresh when scrolled to top
    if (container.scrollTop > 0) return;

    const deltaY = touch.clientY - pullState.startY;
    
    if (deltaY > 0) {
      e.preventDefault();
      const pullDistance = Math.min(deltaY, refreshThreshold * 1.5);
      
      setPullState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        currentY: touch.clientY,
      }));
    }
  };

  const handleTouchEnd = async () => {
    if (pullState.isPulling && pullState.pullDistance >= refreshThreshold) {
      setPullState(prev => ({
        ...prev,
        isRefreshing: true,
      }));
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setPullState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          startY: 0,
          currentY: 0,
        });
      }
    } else {
      setPullState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        startY: 0,
        currentY: 0,
      });
    }
  };

  const refreshProgress = Math.min(pullState.pullDistance / refreshThreshold, 1);
  const isReady = pullState.pullDistance >= refreshThreshold;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {(pullState.isPulling || pullState.isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-white border-b z-10 transition-transform duration-200"
          style={{
            transform: `translateY(${pullState.pullDistance - 60}px)`,
            height: '60px',
          }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RotateCcw 
              className={cn(
                'h-4 w-4',
                pullState.isRefreshing && 'animate-spin',
                isReady && !pullState.isRefreshing && 'text-green-600'
              )}
              style={{
                transform: `rotate(${refreshProgress * 180}deg)`,
              }}
            />
            <span>
              {pullState.isRefreshing 
                ? 'Refreshing...' 
                : isReady 
                  ? 'Release to refresh'
                  : 'Pull to refresh'
              }
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullState.pullDistance}px)`,
          transition: pullState.isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Touch-Optimized Carousel
interface TouchCarouselProps {
  items: ReactNode[];
  className?: string;
  itemClassName?: string;
  showIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function TouchCarousel({
  items,
  className,
  itemClassName,
  showIndicators = true,
  autoPlay = false,
  autoPlayInterval = 3000
}: TouchCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoPlay && !isDragging) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % items.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, isDragging, items.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const offset = currentX - dragStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (dragOffset < 0 && currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(items.length - 1, prev + 1));
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${-currentIndex * 100 + (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn('w-full flex-shrink-0', itemClassName)}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <TouchButton
        variant="ghost"
        size="sm"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
        onClick={goToPrevious}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </TouchButton>

      <TouchButton
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
        onClick={goToNext}
        disabled={currentIndex === items.length - 1}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </TouchButton>

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-2 w-8 rounded-full transition-colors touch-target',
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/50'
              )}
              onClick={() => setCurrentIndex(index)}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
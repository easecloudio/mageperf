'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Consistent spacing scale following 8px grid system
export const spacing = {
  xs: 'p-2',     // 8px
  sm: 'p-3',     // 12px
  md: 'p-4',     // 16px
  lg: 'p-6',     // 24px
  xl: 'p-8',     // 32px
  '2xl': 'p-12', // 48px
  '3xl': 'p-16', // 64px
} as const;

export const margin = {
  xs: 'm-2',
  sm: 'm-3',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8',
  '2xl': 'm-12',
  '3xl': 'm-16',
} as const;

export const gap = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
  '3xl': 'gap-16',
} as const;

// Grid container component
interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: keyof typeof gap;
  className?: string;
  children: React.ReactNode;
}

export function Grid({ cols = 1, gap: gapSize = 'md', className = '', children }: GridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-12',
  };

  return (
    <div className={cn('grid', gridCols[cols], gap[gapSize], className)}>
      {children}
    </div>
  );
}

// Flexible container component
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: keyof typeof spacing;
  className?: string;
  children: React.ReactNode;
}

export function Container({ 
  maxWidth = '7xl', 
  padding = 'lg', 
  className = '', 
  children 
}: ContainerProps) {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('mx-auto', maxWidths[maxWidth], spacing[padding], className)}>
      {children}
    </div>
  );
}

// Section component for consistent page sections
interface SectionProps {
  spacing?: keyof typeof spacing;
  background?: 'white' | 'gray' | 'gradient' | 'transparent';
  border?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Section({ 
  spacing: sectionSpacing = 'xl',
  background = 'transparent',
  border = false,
  className = '',
  children 
}: SectionProps) {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
    transparent: 'bg-transparent',
  };

  return (
    <div className={cn(
      spacing[sectionSpacing],
      backgrounds[background],
      border && 'border border-gray-200 rounded-lg',
      className
    )}>
      {children}
    </div>
  );
}

// Card grid item component
interface CardGridItemProps {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export function CardGridItem({ colSpan = 1, className = '', children }: CardGridItemProps) {
  const colSpans = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4',
    5: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5',
    6: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6',
  };

  return (
    <div className={cn(colSpans[colSpan], className)}>
      {children}
    </div>
  );
}

// Responsive stack component
interface StackProps {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: keyof typeof gap;
  className?: string;
  children: React.ReactNode;
}

export function Stack({
  direction = 'col',
  align = 'start',
  justify = 'start',
  gap: gapSize = 'md',
  className = '',
  children
}: StackProps) {
  const directions = {
    row: 'flex-row',
    col: 'flex-col',
  };

  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifications = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div className={cn(
      'flex',
      directions[direction],
      alignments[align],
      justifications[justify],
      gap[gapSize],
      className
    )}>
      {children}
    </div>
  );
}

// Visual boundaries component
interface BoundaryProps {
  type?: 'subtle' | 'normal' | 'strong';
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof margin;
  className?: string;
}

export function Boundary({ 
  type = 'normal', 
  orientation = 'horizontal',
  spacing: boundarySpacing = 'md',
  className = '' 
}: BoundaryProps) {
  const types = {
    subtle: 'border-gray-100',
    normal: 'border-gray-200',
    strong: 'border-gray-300',
  };

  const orientations = {
    horizontal: 'border-t',
    vertical: 'border-l h-full',
  };

  return (
    <div className={cn(
      'border-solid',
      types[type],
      orientations[orientation],
      margin[boundarySpacing],
      className
    )} />
  );
}

// Content area with consistent spacing
interface ContentAreaProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  spacing?: keyof typeof spacing;
  className?: string;
  children: React.ReactNode;
}

export function ContentArea({
  title,
  subtitle,
  actions,
  spacing: contentSpacing = 'lg',
  className = '',
  children
}: ContentAreaProps) {
  return (
    <div className={cn(spacing[contentSpacing], className)}>
      {(title || subtitle || actions) && (
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              )}
              {subtitle && (
                <p className="text-gray-600">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
          <Boundary type="subtle" spacing="md" />
        </div>
      )}
      {children}
    </div>
  );
}
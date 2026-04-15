'use client';

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Gauge,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface InteractiveTooltipProps {
  children: ReactNode;
  content: {
    title: string;
    description: string;
    type?: 'info' | 'help' | 'warning' | 'success' | 'metric' | 'recommendation';
    details?: Array<{
      label: string;
      value: string | number;
      unit?: string;
      status?: 'good' | 'warning' | 'critical';
    }>;
    metrics?: Array<{
      name: string;
      value: string | number;
      unit?: string;
      trend?: 'up' | 'down' | 'neutral';
      context?: string;
    }>;
    recommendations?: Array<{
      title: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    actions?: Array<{
      label: string;
      action: () => void;
      variant?: 'primary' | 'secondary' | 'outline';
    }>;
    links?: Array<{
      label: string;
      url: string;
      external?: boolean;
    }>;
  };
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  interactive?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface MetricTooltipProps {
  children: ReactNode;
  metric: {
    name: string;
    value: string | number;
    unit?: string;
    score?: number;
    description: string;
    interpretation: {
      current: string;
      good?: string;
      improvement?: string;
    };
    benchmark?: {
      industry: string | number;
      target: string | number;
    };
    relatedFactors?: string[];
  };
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export interface HelpTooltipProps {
  children: ReactNode;
  help: {
    title: string;
    description: string;
    steps?: Array<{
      step: number;
      description: string;
    }>;
    tips?: string[];
    commonIssues?: Array<{
      issue: string;
      solution: string;
    }>;
    learnMoreUrl?: string;
  };
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

const typeIcons = {
  info: Info,
  help: HelpCircle,
  warning: AlertCircle,
  success: CheckCircle2,
  metric: Gauge,
  recommendation: Lightbulb,
};

const typeColors = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
  help: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-500' },
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' },
  metric: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500' },
  recommendation: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' },
};

const maxWidthClasses = {
  sm: 'max-w-xs',
  md: 'max-w-sm',
  lg: 'max-w-md',
  xl: 'max-w-lg',
};

export function InteractiveTooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
  interactive = true,
  maxWidth = 'md',
}: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const type = content.type || 'info';
  const typeStyle = typeColors[type];
  const IconComponent = typeIcons[type];

  return (
    <Tooltip.Root 
      open={isOpen} 
      onOpenChange={setIsOpen}
      delayDuration={delayDuration}
    >
      <Tooltip.Trigger asChild>
        {children}
      </Tooltip.Trigger>
      <AnimatePresence>
        {isOpen && (
          <Tooltip.Portal>
            <Tooltip.Content
              side={side}
              align={align}
              className={cn(
                "z-50 rounded-xl shadow-2xl border",
                typeStyle.bg,
                typeStyle.border,
                maxWidthClasses[maxWidth],
                className
              )}
              sideOffset={8}
              onPointerDownOutside={!interactive ? undefined : (e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-4"
              >
                {/* Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <div className={cn("flex-shrink-0 mt-0.5", typeStyle.icon)}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-semibold text-sm leading-tight", typeStyle.text)}>
                      {content.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {content.description}
                    </p>
                  </div>
                </div>

                {/* Details */}
                {content.details && content.details.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {content.details.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{detail.label}:</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-mono font-medium">
                            {detail.value}{detail.unit}
                          </span>
                          {detail.status && (
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              detail.status === 'good' ? 'bg-green-500' :
                              detail.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                            )} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Metrics */}
                {content.metrics && content.metrics.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {content.metrics.map((metric, index) => (
                      <div key={index} className="bg-white/60 p-2 rounded border border-white/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{metric.name}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-mono">
                              {metric.value}{metric.unit}
                            </span>
                            {metric.trend && (
                              <TrendingUp className={cn(
                                "h-3 w-3",
                                metric.trend === 'up' ? 'text-green-500' :
                                metric.trend === 'down' ? 'text-red-500' :
                                'text-gray-400'
                              )} />
                            )}
                          </div>
                        </div>
                        {metric.context && (
                          <p className="text-xs text-gray-500">{metric.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {content.recommendations && content.recommendations.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Quick Actions:</div>
                    <div className="space-y-1">
                      {content.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs px-1 py-0",
                              rec.impact === 'high' ? 'border-red-300 text-red-600' :
                              rec.impact === 'medium' ? 'border-yellow-300 text-yellow-600' :
                              'border-blue-300 text-blue-600'
                            )}
                          >
                            {rec.impact}
                          </Badge>
                          <span className="text-xs text-gray-700">{rec.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {content.actions && content.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {content.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant === 'primary' ? 'default' : 
                                action.variant === 'secondary' ? 'secondary' : 'outline'}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Links */}
                {content.links && content.links.length > 0 && (
                  <div className="border-t border-white/40 pt-3">
                    <div className="space-y-1">
                      {content.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <span>{link.label}</span>
                          <div className="flex items-center space-x-1">
                            {link.external ? (
                              <ExternalLink className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
              <Tooltip.Arrow className={cn("fill-current", typeStyle.bg)} />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </AnimatePresence>
    </Tooltip.Root>
  );
}

export function MetricTooltip({
  children,
  metric,
  side = 'top',
  align = 'center',
}: MetricTooltipProps) {
  const content = {
    title: metric.name,
    description: metric.description,
    type: 'metric' as const,
    details: [
      { label: 'Current Value', value: metric.value, unit: metric.unit || '' },
      ...(metric.score ? [{ label: 'Performance Score', value: `${Math.round(metric.score * 100)}/100`, status: metric.score > 0.7 ? 'good' as const : metric.score > 0.4 ? 'warning' as const : 'critical' as const }] : []),
      ...(metric.benchmark ? [
        { label: 'Industry Average', value: metric.benchmark.industry, unit: metric.unit || '' },
        { label: 'Target Value', value: metric.benchmark.target, unit: metric.unit || '' },
      ] : []),
    ],
  };

  return (
    <InteractiveTooltip
      content={content}
      side={side}
      align={align}
      maxWidth="lg"
    >
      {children}
    </InteractiveTooltip>
  );
}

export function HelpTooltip({
  children,
  help,
  side = 'top',
  align = 'center',
}: HelpTooltipProps) {
  const content = {
    title: help.title,
    description: help.description,
    type: 'help' as const,
    links: help.learnMoreUrl ? [{ label: 'Learn More', url: help.learnMoreUrl, external: true }] : undefined,
  };

  return (
    <InteractiveTooltip
      content={content}
      side={side}
      align={align}
      maxWidth="lg"
    >
      <div className="cursor-help">
        {children}
      </div>
    </InteractiveTooltip>
  );
}

// Tooltip Provider wrapper component
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={300}>
      {children}
    </Tooltip.Provider>
  );
}

// Quick helper components for common use cases
export function InfoTooltip({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <InteractiveTooltip
      content={{
        title,
        description,
        type: 'info',
      }}
      interactive={false}
      maxWidth="sm"
    >
      {children}
    </InteractiveTooltip>
  );
}

export function WarningTooltip({ 
  children, 
  title, 
  description, 
  actions 
}: { 
  children: ReactNode; 
  title: string; 
  description: string;
  actions?: Array<{ label: string; action: () => void; variant?: 'primary' | 'secondary' | 'outline' }>;
}) {
  return (
    <InteractiveTooltip
      content={{
        title,
        description,
        type: 'warning',
        actions,
      }}
      maxWidth="md"
    >
      {children}
    </InteractiveTooltip>
  );
}

export default InteractiveTooltip;
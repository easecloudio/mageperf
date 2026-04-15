'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';

interface ProgressiveDisclosureProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function ProgressiveDisclosure({
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  icon: Icon,
  children,
  defaultOpen = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <CardHeader 
        className={`cursor-pointer select-none ${headerClassName}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="h-5 w-5 text-blue-600" />}
            <div>
              <span className="text-lg font-semibold text-gray-900">{title}</span>
              {subtitle && <p className="text-sm text-gray-600 font-normal mt-1">{subtitle}</p>}
            </div>
            {badge && (
              <Badge variant={badgeVariant} className="ml-2">
                {badge}
              </Badge>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4"
          >
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </motion.div>
        </CardTitle>
      </CardHeader>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <CardContent className={`pt-0 ${contentClassName}`}>
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

interface DetailedInsightProps {
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  timeToImplement: string;
  steps: string[];
  technicalDetails?: string[];
  relatedMetrics?: { name: string; value: string; improvement?: string }[];
}

export function DetailedInsight({
  title,
  description,
  impact,
  timeToImplement,
  steps,
  technicalDetails = [],
  relatedMetrics = [],
}: DetailedInsightProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <ProgressiveDisclosure
      title={title}
      subtitle={description}
      badge={`${impact.toUpperCase()} impact`}
      badgeVariant="outline"
      icon={Info}
      className={`border-l-4 ${
        impact === 'critical' ? 'border-l-red-500' : 
        impact === 'high' ? 'border-l-orange-500' : 
        impact === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
      }`}
      headerClassName={getImpactColor(impact)}
    >
      <div className="space-y-6">
        {/* Implementation Steps */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Implementation Steps ({timeToImplement})
          </h4>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-800">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Metrics */}
        {relatedMetrics.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Impact on Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedMetrics.map((metric, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-900">{metric.name}</span>
                    <span className="text-sm text-blue-700">{metric.value}</span>
                  </div>
                  {metric.improvement && (
                    <div className="text-xs text-emerald-600 font-medium">
                      Expected improvement: {metric.improvement}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details */}
        {technicalDetails.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Technical Details
            </h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              {technicalDetails.map((detail, index) => (
                <div key={index} className="text-sm text-gray-300 font-mono mb-1">
                  {detail}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 pt-4 border-t">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Get Implementation Guide
          </Button>
          <Button size="sm" variant="outline">
            Contact Expert
          </Button>
        </div>
      </div>
    </ProgressiveDisclosure>
  );
}
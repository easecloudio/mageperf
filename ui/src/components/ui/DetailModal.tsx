'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  ExternalLink,
  Copy,
  Download,
  Share2,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface DetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export interface MetricDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  metric: {
    id: string;
    name: string;
    value: string | number;
    unit?: string;
    score?: number;
    category: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    recommendations?: Array<{
      title: string;
      description: string;
      effort: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      priority: number;
    }>;
    technicalDetails?: {
      currentValue?: string | number;
      targetValue?: string | number;
      threshold?: string | number;
      measurement?: string;
      context?: string[];
    };
    resources?: Array<{
      title: string;
      url: string;
      type: 'documentation' | 'guide' | 'tool' | 'article';
    }>;
    relatedMetrics?: Array<{
      name: string;
      value: string | number;
      correlation: 'positive' | 'negative' | 'neutral';
    }>;
  };
}

export interface RecommendationDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    implementationSteps?: Array<{
      step: number;
      title: string;
      description: string;
      estimatedTime: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
    beforeAfter?: {
      before: {
        description: string;
        metrics: Array<{ name: string; value: string | number; }>;
      };
      after: {
        description: string;
        metrics: Array<{ name: string; value: string | number; }>;
      };
    };
    codeExamples?: Array<{
      language: string;
      title: string;
      code: string;
      description: string;
    }>;
    resources?: Array<{
      title: string;
      url: string;
      type: 'documentation' | 'guide' | 'tool' | 'article';
    }>;
    risks?: Array<{
      risk: string;
      severity: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
  };
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

const impactColors = {
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
};

const effortColors = {
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export function DetailModal({
  isOpen,
  onOpenChange,
  title,
  subtitle,
  children,
  size = 'lg',
  className,
}: DetailModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full",
            sizeClasses[size],
            className
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex-1 min-w-0">
                <Dialog.Title className="text-xl font-bold text-gray-900 leading-tight">
                  {title}
                </Dialog.Title>
                {subtitle && (
                  <Dialog.Description className="mt-1 text-sm text-gray-600">
                    {subtitle}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" className="flex-shrink-0 ml-4">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function MetricDetailModal({ isOpen, onOpenChange, metric }: MetricDetailModalProps) {
  const impactStyle = impactColors[metric.impact];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={metric.name}
      subtitle={`${metric.category} • Current Value: ${metric.value}${metric.unit || ''}`}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Metric Overview */}
        <Card className={cn("border-2", impactStyle.border, impactStyle.bg)}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{metric.value}{metric.unit}</div>
                <div className="text-sm text-gray-600">Current Value</div>
              </div>
              {metric.score && (
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{Math.round(metric.score * 100)}/100</div>
                  <div className="text-sm text-gray-600">Performance Score</div>
                </div>
              )}
              <div className="text-center">
                <Badge className={cn("text-white", impactStyle.bg.replace('bg-', 'bg-').replace('-50', '-500'))}>
                  <AlertTriangle className={cn("h-4 w-4 mr-1", impactStyle.icon)} />
                  {metric.impact.charAt(0).toUpperCase() + metric.impact.slice(1)} Impact
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{metric.description}</p>
              </CardContent>
            </Card>

            {metric.relatedMetrics && metric.relatedMetrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Related Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metric.relatedMetrics.map((related, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            related.correlation === 'positive' ? 'bg-green-500' :
                            related.correlation === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                          )} />
                          <span className="font-medium">{related.name}</span>
                        </div>
                        <span className="text-gray-600">{related.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {metric.recommendations && metric.recommendations.length > 0 ? (
              metric.recommendations.map((rec, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{rec.title}</h4>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className={cn("text-xs", effortColors[rec.effort].text, effortColors[rec.effort].bg)}>
                          {rec.effort} effort
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", impactColors[rec.impact].text, impactColors[rec.impact].bg)}>
                          {rec.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{rec.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Target className="h-4 w-4 mr-1" />
                      Priority: {rec.priority}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No specific recommendations available for this metric.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            {metric.technicalDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metric.technicalDetails.currentValue && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Current Value</div>
                        <div className="font-mono text-lg">{metric.technicalDetails.currentValue}</div>
                      </div>
                    )}
                    {metric.technicalDetails.targetValue && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Target Value</div>
                        <div className="font-mono text-lg text-green-700">{metric.technicalDetails.targetValue}</div>
                      </div>
                    )}
                    {metric.technicalDetails.threshold && (
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Threshold</div>
                        <div className="font-mono text-lg text-orange-700">{metric.technicalDetails.threshold}</div>
                      </div>
                    )}
                    {metric.technicalDetails.measurement && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Measurement Method</div>
                        <div className="text-blue-700">{metric.technicalDetails.measurement}</div>
                      </div>
                    )}
                  </div>

                  {metric.technicalDetails.context && (
                    <div>
                      <h5 className="font-medium mb-2">Context</h5>
                      <ul className="space-y-1">
                        {metric.technicalDetails.context.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            {metric.resources && metric.resources.length > 0 ? (
              <div className="grid gap-4">
                {metric.resources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            resource.type === 'documentation' ? 'bg-blue-100 text-blue-600' :
                            resource.type === 'guide' ? 'bg-green-100 text-green-600' :
                            resource.type === 'tool' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          )}>
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-sm text-gray-500 capitalize">{resource.type}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(resource.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No resources available for this metric.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DetailModal>
  );
}

export function RecommendationDetailModal({ isOpen, onOpenChange, recommendation }: RecommendationDetailModalProps) {
  const impactStyle = impactColors[recommendation.impact];
  const effortStyle = effortColors[recommendation.effort];

  return (
    <DetailModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={recommendation.title}
      subtitle={`${recommendation.category} • Priority ${recommendation.priority}`}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Status Overview */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg">
          <div className="flex space-x-4">
            <Badge className={cn("text-white", impactStyle.bg.replace('bg-', 'bg-').replace('-50', '-500'))}>
              <AlertTriangle className="h-4 w-4 mr-1" />
              {recommendation.impact.charAt(0).toUpperCase() + recommendation.impact.slice(1)} Impact
            </Badge>
            <Badge className={cn("text-white", effortStyle.bg.replace('bg-', 'bg-').replace('-50', '-500'))}>
              <Clock className="h-4 w-4 mr-1" />
              {recommendation.effort.charAt(0).toUpperCase() + recommendation.effort.slice(1)} Effort
            </Badge>
            <Badge variant="outline">
              P{recommendation.priority}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="impact">Before/After</TabsTrigger>
            <TabsTrigger value="code">Code Examples</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{recommendation.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4">
            {recommendation.implementationSteps && recommendation.implementationSteps.length > 0 ? (
              <div className="space-y-4">
                {recommendation.implementationSteps.map((step) => (
                  <Card key={step.step} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                            <div className="flex space-x-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.estimatedTime}
                              </Badge>
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                step.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                                step.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                              )}>
                                {step.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No implementation steps available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            {recommendation.beforeAfter ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-red-200 bg-red-50/30">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
                      Before Implementation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700 mb-4">{recommendation.beforeAfter.before.description}</p>
                    <div className="space-y-2">
                      {recommendation.beforeAfter.before.metrics.map((metric, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white/50 rounded">
                          <span className="text-sm text-red-800">{metric.name}</span>
                          <span className="font-mono text-red-900">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-200 bg-green-50/30">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                      After Implementation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 mb-4">{recommendation.beforeAfter.after.description}</p>
                    <div className="space-y-2">
                      {recommendation.beforeAfter.after.metrics.map((metric, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white/50 rounded">
                          <span className="text-sm text-green-800">{metric.name}</span>
                          <span className="font-mono text-green-900">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No before/after comparison available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            {recommendation.codeExamples && recommendation.codeExamples.length > 0 ? (
              <div className="space-y-4">
                {recommendation.codeExamples.map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{example.title}</CardTitle>
                        <Badge variant="outline" className="font-mono">
                          {example.language}
                        </Badge>
                      </div>
                      {example.description && (
                        <p className="text-sm text-gray-600">{example.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{example.code}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => navigator.clipboard.writeText(example.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No code examples available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {recommendation.risks && recommendation.risks.length > 0 ? (
              <div className="space-y-4">
                {recommendation.risks.map((risk, index) => (
                  <Card key={index} className={cn(
                    "border-2",
                    risk.severity === 'high' ? 'border-red-200 bg-red-50/30' :
                    risk.severity === 'medium' ? 'border-yellow-200 bg-yellow-50/30' :
                    'border-blue-200 bg-blue-50/30'
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{risk.risk}</h4>
                        <Badge className={cn(
                          "text-white",
                          risk.severity === 'high' ? 'bg-red-500' :
                          risk.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        )}>
                          {risk.severity} severity
                        </Badge>
                      </div>
                      <div className="bg-white/70 p-3 rounded border-l-4 border-l-gray-400">
                        <div className="text-sm text-gray-600 mb-1">Mitigation Strategy:</div>
                        <p className="text-gray-800">{risk.mitigation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No significant risks identified for this recommendation.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DetailModal>
  );
}

export default DetailModal;
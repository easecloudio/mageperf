'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { Search, Plus, TrendingUp } from 'lucide-react';

interface BrandedEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{className?: string}>;
  variant?: 'analysis' | 'reports' | 'generic';
  className?: string;
}

export const BrandedEmptyState: React.FC<BrandedEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  variant = 'generic',
  className = ''
}) => {
  // Default content based on variant
  const variantConfig = {
    analysis: {
      title: 'No Analysis Yet',
      description: 'Start analyzing your Magento store to get detailed performance insights and optimization recommendations.',
      actionLabel: 'Analyze Store',
      icon: Search
    },
    reports: {
      title: 'No Reports Available',
      description: 'Create your first performance analysis report to track your Magento store optimization progress.',
      actionLabel: 'Create Report',
      icon: TrendingUp
    },
    generic: {
      title: 'Nothing Here Yet',
      description: 'Get started with EaseCloud performance tools to optimize your Magento store.',
      actionLabel: 'Get Started',
      icon: Plus
    }
  };

  const config = variantConfig[variant];
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionLabel = actionLabel || config.actionLabel;
  const IconComponent = icon || config.icon;

  return (
    <motion.div 
      className={`flex flex-col items-center justify-center text-center p-12 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo and Branding */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <IconComponent className="w-10 h-10 text-orange-600" />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Logo size="sm" showText={false} />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="max-w-md space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-gray-900">
          {finalTitle}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {finalDescription}
        </p>

        {onAction && (
          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={onAction}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2"
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {finalActionLabel}
            </Button>
          </motion.div>
        )}

        {/* EaseCloud Attribution */}
        <motion.div
          className="pt-6 border-t border-gray-100 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Logo size="sm" showText={false} />
            <span>Powered by EaseCloud</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Professional Magento optimization services
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BrandedEmptyState;
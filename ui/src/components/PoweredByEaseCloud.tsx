'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './logo';
import { ExternalLink } from 'lucide-react';

interface PoweredByEaseCloudProps {
  variant?: 'compact' | 'full';
  className?: string;
  showLink?: boolean;
}

export const PoweredByEaseCloud: React.FC<PoweredByEaseCloudProps> = ({
  variant = 'compact',
  className = '',
  showLink = true
}) => {
  if (variant === 'full') {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Logo size="sm" showText={false} />
          <div className="text-sm text-gray-600">
            <span>Performance analysis </span>
            {showLink ? (
              <Link 
                href="https://easecloud.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center"
              >
                powered by EaseCloud
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            ) : (
              <span className="font-semibold text-orange-600">powered by EaseCloud</span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Professional Magento optimization services and performance auditing tools
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-2 text-xs text-gray-500 ${className}`}>
      <Logo size="sm" showText={false} />
      <span>Powered by</span>
      {showLink ? (
        <Link 
          href="https://easecloud.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-orange-600 hover:text-orange-700 inline-flex items-center"
        >
          EaseCloud
          <ExternalLink className="h-3 w-3 ml-1" />
        </Link>
      ) : (
        <span className="font-medium text-orange-600">EaseCloud</span>
      )}
    </div>
  );
};

export default PoweredByEaseCloud;
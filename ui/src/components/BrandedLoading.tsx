'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Logo from './logo';

interface BrandedLoadingProps {
  message?: string;
  variant?: 'compact' | 'full';
  className?: string;
}

export const BrandedLoading: React.FC<BrandedLoadingProps> = ({
  message = 'Loading...',
  variant = 'compact',
  className = ''
}) => {
  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: { 
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1]
    }
  };

  if (variant === 'full') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 ${className}`}>
        <div className="text-center">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <Logo size="lg" showText={true} />
          </motion.div>
          
          <div className="space-y-4">
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded mx-auto"
              animate={{ 
                x: [-100, 100, -100],
                scaleX: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.p
              className="text-lg font-medium text-gray-700"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {message}
            </motion.p>
            
            <p className="text-sm text-gray-500">
              EaseCloud Performance Analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-4"
        >
          <Logo size="md" showText={false} />
        </motion.div>
        
        <motion.div
          className="w-12 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded mx-auto mb-3"
          animate={{ 
            scaleX: [0.3, 1, 0.3],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.p
          className="text-sm font-medium text-gray-600"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default BrandedLoading;
'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  hasTouch: boolean;
  supportsHover: boolean;
  prefersReducedMotion: boolean;
  devicePixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  isLandscape: boolean;
  supportsPWA: boolean;
  isStandalone: boolean;
}

interface BatteryStatus {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export function useDeviceOptimization() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isTablet: false,
    hasTouch: false,
    supportsHover: false,
    prefersReducedMotion: false,
    devicePixelRatio: 1,
    viewportWidth: 0,
    viewportHeight: 0,
    isLandscape: false,
    supportsPWA: false,
    isStandalone: false,
  });

  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isMobile = /Mobi|Android/i.test(userAgent);
      const isTablet = /iPad|Tablet/.test(userAgent) || (isAndroid && !/Mobile/.test(userAgent));
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const supportsHover = window.matchMedia('(hover: hover)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isLandscape = viewportWidth > viewportHeight;
      const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      setDeviceInfo({
        isIOS,
        isAndroid,
        isMobile,
        isTablet,
        hasTouch,
        supportsHover,
        prefersReducedMotion,
        devicePixelRatio,
        viewportWidth,
        viewportHeight,
        isLandscape,
        supportsPWA,
        isStandalone,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  useEffect(() => {
    // Battery API
    if ('getBattery' in navigator) {
      (navigator as unknown as { getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        chargingTime: number;
        dischargingTime: number;
        addEventListener: (event: string, listener: () => void) => void;
      }> }).getBattery?.().then((battery) => {
        const updateBatteryInfo = () => {
          setBatteryStatus({
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        };

        updateBatteryInfo();
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
      });
    }

    // Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { 
        connection?: {
          effectiveType: string;
          downlink: number;
          rtt: number;
          saveData: boolean;
          addEventListener: (event: string, listener: () => void) => void;
        }
      }).connection;
      
      if (connection) {
        const updateNetworkInfo = () => {
          setNetworkInfo({
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
          });
        };

        updateNetworkInfo();
        connection.addEventListener('change', updateNetworkInfo);
      }
    }
  }, []);

  // Haptic feedback utilities
  const hapticFeedback = {
    light: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    },
    medium: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    },
    heavy: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 10, 30]);
      }
    },
    success: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 5, 10]);
      }
    },
    error: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 20, 50, 20, 50]);
      }
    },
  };

  // Performance optimization utilities
  const shouldReduceAnimations = deviceInfo.prefersReducedMotion || 
    (batteryStatus && batteryStatus.level < 0.2 && !batteryStatus.charging);

  const shouldReduceQuality = networkInfo?.saveData || 
    networkInfo?.effectiveType === 'slow-2g' || 
    networkInfo?.effectiveType === '2g';

  const getOptimalImageSize = (baseWidth: number, baseHeight: number) => {
    const { devicePixelRatio, viewportWidth } = deviceInfo;
    const maxWidth = Math.min(viewportWidth, baseWidth);
    
    // Reduce resolution on low-end devices or poor network
    const qualityMultiplier = shouldReduceQuality ? 0.75 : devicePixelRatio;
    
    return {
      width: Math.round(maxWidth * qualityMultiplier),
      height: Math.round((baseHeight / baseWidth) * maxWidth * qualityMultiplier),
    };
  };

  // PWA utilities
  const installPWA = async () => {
    const deferredPrompt = (window as unknown as { 
      deferredPrompt?: {
        prompt: () => void;
        userChoice: Promise<{ outcome: string }>;
      }
    }).deferredPrompt;
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome === 'accepted';
    }
    return false;
  };

  const isPWAInstallable = () => {
    return !!(window as unknown as { deferredPrompt?: unknown }).deferredPrompt && deviceInfo.supportsPWA;
  };

  // Gesture utilities
  const isSafariOnIOS = deviceInfo.isIOS && /Safari/.test(navigator.userAgent);
  const supportsBackGesture = deviceInfo.isIOS || deviceInfo.isAndroid;

  return {
    deviceInfo,
    batteryStatus,
    networkInfo,
    hapticFeedback,
    shouldReduceAnimations,
    shouldReduceQuality,
    getOptimalImageSize,
    installPWA,
    isPWAInstallable,
    isSafariOnIOS,
    supportsBackGesture,
  };
}

// Custom hook for performance-aware loading
export function usePerformanceAwareLoading() {
  const { networkInfo, batteryStatus, shouldReduceQuality } = useDeviceOptimization();

  const getLoadingStrategy = (resourceType: 'image' | 'video' | 'script' | 'style') => {
    const isSlowNetwork = networkInfo?.effectiveType === 'slow-2g' || 
                         networkInfo?.effectiveType === '2g';
    const isLowBattery = batteryStatus && batteryStatus.level < 0.2 && !batteryStatus.charging;

    if (isSlowNetwork || isLowBattery) {
      return {
        lazy: true,
        preload: false,
        quality: 'low',
        deferNonCritical: true,
      };
    }

    if (networkInfo?.effectiveType === '3g' || shouldReduceQuality) {
      return {
        lazy: true,
        preload: resourceType === 'style',
        quality: 'medium',
        deferNonCritical: false,
      };
    }

    return {
      lazy: false,
      preload: ['style', 'script'].includes(resourceType),
      quality: 'high',
      deferNonCritical: false,
    };
  };

  return { getLoadingStrategy };
}

// Custom hook for adaptive UI
export function useAdaptiveUI() {
  const { deviceInfo, shouldReduceAnimations } = useDeviceOptimization();

  const getAnimationClass = (animation: string) => {
    if (shouldReduceAnimations) {
      return 'transition-none';
    }
    return animation;
  };

  const getTouchTargetClass = (size: 'sm' | 'md' | 'lg' = 'md') => {
    if (!deviceInfo.hasTouch) {
      return '';
    }

    const sizeClasses = {
      sm: 'touch-target-small',
      md: 'touch-target',
      lg: 'touch-target-large',
    };

    return sizeClasses[size];
  };

  const getHoverClass = (hoverClass: string) => {
    return deviceInfo.supportsHover ? hoverClass : '';
  };

  return {
    getAnimationClass,
    getTouchTargetClass,
    getHoverClass,
    shouldShowHoverStates: deviceInfo.supportsHover,
    shouldUseTouch: deviceInfo.hasTouch,
  };
}
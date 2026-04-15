/**
 * Optimized Image Component
 * Performance-optimized image component with progressive loading
 */

'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { respectMotionPreference } from '@/lib/animations'

// ============================================================================
// OPTIMIZED IMAGE COMPONENT
// ============================================================================

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string
  showPlaceholder?: boolean
  placeholderColor?: string
  animateIn?: boolean
  rounded?: boolean
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto'
  onLoad?: () => void
  onError?: (error: Error) => void
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallback = '/images/placeholder.jpg',
  showPlaceholder = true,
  placeholderColor = 'bg-gray-200',
  animateIn = true,
  rounded = false,
  aspectRatio = 'auto',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback)
      setHasError(false)
      setIsLoading(true)
    }
    onError?.(new Error('Image failed to load'))
  }, [fallback, imageSrc, onError])

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square'
      case '16/9': return 'aspect-video'
      case '4/3': return 'aspect-[4/3]'
      case '3/2': return 'aspect-[3/2]'
      default: return ''
    }
  }

  const imageVariants = respectMotionPreference({
    initial: { 
      opacity: 0, 
      scale: 1.05 
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  })

  const placeholderVariants = respectMotionPreference({
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  })

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        rounded && 'rounded-lg',
        getAspectRatioClass(),
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isLoading && showPlaceholder && (
          <motion.div
            key="placeholder"
            variants={placeholderVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              placeholderColor
            )}
          >
            <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        
        {!hasError && (
          <motion.div
            key={imageSrc as string}
            variants={animateIn ? imageVariants : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              className={cn(
                'object-cover',
                isLoading && 'opacity-0'
              )}
              onLoad={handleLoad}
              onError={handleError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              priority={props.priority}
              {...props}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// AVATAR COMPONENT WITH FALLBACK
// ============================================================================

interface OptimizedAvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: React.ReactNode
  className?: string
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  if (!src) {
    return (
      <div className={cn(
        'rounded-full bg-gray-200 flex items-center justify-center',
        sizeClasses[size],
        textSizeClasses[size],
        className
      )}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
      aspectRatio="square"
      animateIn={true}
      fallback="/images/default-avatar.jpg"
    />
  )
}

// ============================================================================
// HERO IMAGE COMPONENT
// ============================================================================

interface HeroImageProps {
  src: string
  alt: string
  className?: string
  overlay?: boolean
  overlayClassName?: string
  children?: React.ReactNode
  priority?: boolean
}

export const HeroImage: React.FC<HeroImageProps> = ({
  src,
  alt,
  className,
  overlay = false,
  overlayClassName = 'bg-black/20',
  children,
  priority = true
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        sizes="100vw"
        quality={90}
      />
      
      {overlay && (
        <div className={cn('absolute inset-0', overlayClassName)} />
      )}
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// GALLERY COMPONENT WITH LAZY LOADING
// ============================================================================

interface GalleryImageProps {
  src: string
  alt: string
  aspectRatio?: OptimizedImageProps['aspectRatio']
  onClick?: () => void
}

interface GalleryProps {
  images: GalleryImageProps[]
  columns?: 2 | 3 | 4 | 5 | 6
  gap?: 2 | 3 | 4 | 6 | 8
  className?: string
}

export const Gallery: React.FC<GalleryProps> = ({
  images,
  columns = 3,
  gap = 4,
  className
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <div className={cn(
      'grid',
      gridCols[columns],
      gapClasses[gap],
      className
    )}>
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
          onClick={image.onClick}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            aspectRatio={image.aspectRatio || 'square'}
            className="rounded-lg"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================================
// PROGRESSIVE IMAGE COMPONENT
// ============================================================================

interface ProgressiveImageProps extends OptimizedImageProps {
  lowQualitySrc?: string
  blurDataURL?: string
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowQualitySrc,
  blurDataURL,
  ...props
}) => {
  const [highQualityLoaded, setHighQualityLoaded] = useState(false)

  return (
    <div className="relative">
      {/* Low quality image */}
      {lowQualitySrc && (
        <OptimizedImage
          src={lowQualitySrc}
          {...props}
          className={cn(
            props.className,
            highQualityLoaded && 'opacity-0',
            'transition-opacity duration-300'
          )}
          quality={10}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
        />
      )}
      
      {/* High quality image */}
      <OptimizedImage
        src={src}
        {...props}
        className={cn(
          props.className,
          lowQualitySrc && !highQualityLoaded && 'opacity-0',
          lowQualitySrc && 'absolute inset-0',
          'transition-opacity duration-300'
        )}
        onLoad={() => setHighQualityLoaded(true)}
        quality={85}
      />
    </div>
  )
}

// ============================================================================
// IMAGE WITH ZOOM FUNCTIONALITY
// ============================================================================

interface ZoomableImageProps extends OptimizedImageProps {
  zoomLevel?: number
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  zoomLevel = 2,
  className,
  ...props
}) => {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <motion.div
      className={cn('cursor-zoom-in overflow-hidden', className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setIsZoomed(!isZoomed)}
    >
      <motion.div
        animate={{ scale: isZoomed ? zoomLevel : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <OptimizedImage
          {...props}
          className="w-full h-full object-cover"
        />
      </motion.div>
    </motion.div>
  )
}
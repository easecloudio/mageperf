import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', variant = 'default', showText = false, className = '' }: LogoProps) => {
  const sizeMap = {
    sm: { width: 20, height: 10 },
    md: { width: 28, height: 14 },
    lg: { width: 36, height: 18 }
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-lg'
  };

  const dimensions = sizeMap[size];
  
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="EaseCloud"
        width={dimensions.width}
        height={dimensions.height}
        className={`${variant === 'white' ? 'brightness-0 invert' : ''}`}
        priority={size === 'sm'}
      />
      <span className={`ml-2 font-bold text-gray-900 ${textSizeMap[size]} ${variant === 'white' ? 'text-white' : ''} ${showText ? 'block' : 'hidden'}`}>
        EaseCloud
      </span>
    </div>
  );
};

export default Logo;
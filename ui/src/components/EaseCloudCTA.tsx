import { ArrowRight, Zap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EaseCloudCTAProps {
  variant?: 'banner' | 'card' | 'inline';
  context?: 'report' | 'optimization' | 'performance';
  className?: string;
}

const EaseCloudCTA: React.FC<EaseCloudCTAProps> = ({ 
  variant = 'card', 
  context = 'optimization',
  className = '' 
}) => {
  const contextConfig = {
    report: {
      title: 'Need Help Implementing These Recommendations?',
      subtitle: 'Our Magento experts can handle the technical implementation for you',
      action: 'Get Expert Help',
      url: 'https://easecloud.io/contact-us/get-in-touch/'
    },
    optimization: {
      title: 'Ready to Boost Your Store Performance?',
      subtitle: 'Let our team implement these optimizations and improve your results',
      action: 'Start Optimization',
      url: 'https://easecloud.io/contact-us/get-in-touch/'
    },
    performance: {
      title: 'Want Professional Implementation?',
      subtitle: 'Get expert help to implement these performance improvements',
      action: 'Contact Us',
      url: 'https://easecloud.io/contact-us/get-in-touch/'
    }
  };

  const config = contextConfig[context];

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center space-x-3 text-sm ${className}`}>
        <MessageCircle className="h-4 w-4 text-orange-600" />
        <span className="text-gray-600">Need help?</span>
        <a 
          href={config.url}
          className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center"
        >
          {config.action}
          <ArrowRight className="h-3 w-3 ml-1" />
        </a>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{config.subtitle}</p>
            </div>
          </div>
          <Button 
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            onClick={() => window.location.href = config.url}
          >
            {config.action}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Default card variant - engaging and full width
  return (
    <div className={`bg-gradient-to-br from-orange-50 via-white to-red-50 border border-orange-200 rounded-lg p-8 shadow-lg ${className}`}>
      <div className="text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-6 w-6 text-orange-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {config.title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {config.subtitle}
        </p>
        
        <div>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => window.location.href = config.url}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {config.action}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="text-sm text-gray-500 mt-4">
            Free consultation • Expert implementation
          </div>
        </div>
      </div>
    </div>
  );
};

export { EaseCloudCTA };
export default EaseCloudCTA;
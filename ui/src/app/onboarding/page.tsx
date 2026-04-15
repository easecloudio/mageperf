'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CheckCircle, AlertCircle, Globe, FileText, ExternalLink, Loader, Store, Settings, Target, ChevronDown, Shirt, Laptop, Heart, Home, Bike, BookOpen, UtensilsCrossed, Car, Building2, Package, Users, Zap, Check } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [url] = useState('https://magento.softwaretestingboard.com')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
    businessType: '',
    magentoVersion: '',
    monthlyVisitors: '',
    primaryGoals: [] as string[]
  })
  const [consents, setConsents] = useState({
    ownership: false,
    privacy: false,
    toc: false,
    dataUsage: false
  })

  useEffect(() => {
    // Auto-start verification process
    setIsVerifying(true)
    const timer = setTimeout(() => {
      setIsVerifying(false)
      setVerificationComplete(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleConsentChange = (type: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const allConsentsGiven = Object.values(consents).every(Boolean)

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal]
    }))
  }

  const businessTypes = [
    { value: 'Fashion & Apparel', icon: Shirt, description: 'Clothing, accessories, and fashion items' },
    { value: 'Electronics & Technology', icon: Laptop, description: 'Computers, phones, and tech gadgets' },
    { value: 'Health & Beauty', icon: Heart, description: 'Cosmetics, wellness, and healthcare products' },
    { value: 'Home & Garden', icon: Home, description: 'Furniture, decor, and garden supplies' },
    { value: 'Sports & Outdoors', icon: Bike, description: 'Athletic gear and outdoor equipment' },
    { value: 'Books & Media', icon: BookOpen, description: 'Books, music, movies, and digital content' },
    { value: 'Food & Beverage', icon: UtensilsCrossed, description: 'Groceries, restaurants, and specialty foods' },
    { value: 'Automotive', icon: Car, description: 'Cars, parts, and automotive services' },
    { value: 'B2B/Wholesale', icon: Building2, description: 'Business-to-business and wholesale' },
    { value: 'Other', icon: Package, description: 'Other business categories' }
  ]

  const performanceGoals = [
    'Improve Page Load Speed',
    'Reduce Server Response Time',
    'Optimize Mobile Performance',
    'Fix Core Web Vitals',
    'Reduce Bounce Rate',
    'Improve SEO Rankings',
    'Optimize Database Queries',
    'Enhance User Experience'
  ]

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Onboarding' }
  ];

  const headerActions = (
    <div className="text-sm text-gray-600">
      Step {currentStep} of 5
    </div>
  );

  return (
    <AppLayout 
      showBackButton={true}
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
      className="bg-gradient-to-br from-orange-50 via-white to-red-50"
    >
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {[
              { step: 1, label: 'URL Validation' },
              { step: 2, label: 'Store Information' },
              { step: 3, label: 'Technical Details' },
              { step: 4, label: 'Performance Goals' },
              { step: 5, label: 'Legal Consent' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= item.step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.step}
                  </div>
                  <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                    currentStep >= item.step ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
                {index < 4 && (
                  <div className="flex-1 mx-2 min-w-[40px]">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className={`h-2 rounded-full transition-all duration-500 ${
                        currentStep > item.step ? 'bg-orange-600 w-full' : 'bg-orange-600 w-0'
                      }`}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto">
          {currentStep === 1 && (
            <Card className="shadow-xl border border-gray-100">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <CardTitle className="flex items-center text-2xl">
                  <Globe className="w-7 h-7 mr-3 text-orange-600" />
                  URL Validation & Store Detection
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Verifying your Magento store and analyzing its configuration
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <Input
                      type="url"
                      value={url}
                      readOnly
                      className="bg-gray-50 text-lg py-3"
                    />
                  </div>

                  {/* Verification Process */}
                  {isVerifying && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <Loader className="w-6 h-6 text-blue-600 mr-3 animate-spin" />
                        <span className="font-medium text-blue-800">Verifying Magento Store...</span>
                      </div>
                      <div className="space-y-3 text-sm text-blue-700">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                          <span>Checking URL accessibility...</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                          <span>Detecting Magento installation...</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                          <span>Analyzing store configuration...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification Success */}
                  {verificationComplete && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                        <span className="font-medium text-green-800 text-lg">Magento Store Verified!</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm text-green-700">
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Valid Magento store URL
                          </p>
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Store is accessible and responsive
                          </p>
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Magento detection confidence: 95%
                          </p>
                        </div>
                        <div className="space-y-2 text-sm text-green-700">
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            SSL certificate valid
                          </p>
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Frontend accessible
                          </p>
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Ready for comprehensive analysis
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Magento 2.4.x
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          Commerce Edition
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          Production Mode
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      disabled={!verificationComplete}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      {verificationComplete ? 'Continue to Store Information' : 'Please wait...'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="shadow-xl border border-gray-100">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <CardTitle className="flex items-center text-2xl">
                  <Store className="w-7 h-7 mr-3 text-orange-600" />
                  Store Information
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Tell us about your Magento store
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="storeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Store URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="storeUrl"
                        type="url"
                        value={url}
                        readOnly
                        className="pl-10 bg-gray-50 text-lg py-3"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={(e) => handleFormDataChange('storeName', e.target.value)}
                      placeholder="My Awesome Store"
                      className="text-lg py-3"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal h-auto py-4 px-4 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-center gap-3">
                            {formData.businessType ? (
                              <>
                                {(() => {
                                  const selectedType = businessTypes.find(type => type.value === formData.businessType);
                                  const IconComponent = selectedType?.icon || Package;
                                  return <IconComponent className="h-5 w-5 text-orange-600" />;
                                })()}
                                <div className="flex flex-col">
                                  <span className="text-gray-900 font-medium">{formData.businessType}</span>
                                  <span className="text-sm text-gray-500">
                                    {businessTypes.find(type => type.value === formData.businessType)?.description}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <Package className="h-5 w-5 text-gray-400" />
                                <div className="flex flex-col">
                                  <span className="text-gray-500">Select your business type</span>
                                  <span className="text-sm text-gray-400">Choose the category that best describes your store</span>
                                </div>
                              </>
                            )}
                          </div>
                          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-w-lg border-2 border-gray-200 shadow-xl bg-white rounded-xl p-2">
                        {businessTypes.map((type) => {
                          const IconComponent = type.icon;
                          const isSelected = formData.businessType === type.value;
                          return (
                            <DropdownMenuItem
                              key={type.value}
                              onClick={() => handleFormDataChange('businessType', type.value)}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-900 cursor-pointer transition-all duration-200 focus:bg-orange-50 focus:text-orange-900"
                            >
                              <IconComponent className={`h-5 w-5 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`} />
                              <div className="flex-1 flex flex-col">
                                <span className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {type.value}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {type.description}
                                </span>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      ← Back to Validation
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.storeName || !formData.businessType}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Continue to Technical Details →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="shadow-xl border border-gray-100">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <CardTitle className="flex items-center text-2xl">
                  <Settings className="w-7 h-7 mr-3 text-orange-600" />
                  Technical Details
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Help us understand your setup
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="magentoVersion" className="block text-sm font-medium text-gray-700 mb-2">
                      Magento Version
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal h-auto py-4 px-4 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className={`h-5 w-5 ${formData.magentoVersion ? 'text-orange-600' : 'text-gray-400'}`} />
                            <div className="flex flex-col">
                              <span className={formData.magentoVersion ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                                {formData.magentoVersion || 'Select Magento version'}
                              </span>
                              <span className="text-sm text-gray-400">
                                {formData.magentoVersion ? 'Your current Magento installation' : 'We\'ll help identify your version during analysis'}
                              </span>
                            </div>
                          </div>
                          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-w-lg border-2 border-gray-200 shadow-xl bg-white rounded-xl p-2">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2">
                          Current Versions
                        </div>
                        {[
                          { version: 'Magento 2.4.7', status: 'Latest', recommended: true },
                          { version: 'Magento 2.4.6', status: 'Supported', recommended: false },
                          { version: 'Magento 2.4.5', status: 'Supported', recommended: false },
                          { version: 'Magento 2.4.4', status: 'Supported', recommended: false },
                        ].map((item) => {
                          const isSelected = formData.magentoVersion === item.version;
                          return (
                            <DropdownMenuItem
                              key={item.version}
                              onClick={() => handleFormDataChange('magentoVersion', item.version)}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-900 cursor-pointer transition-all duration-200 focus:bg-orange-50 focus:text-orange-900"
                            >
                              <Zap className={`h-4 w-4 ${isSelected ? 'text-orange-600' : 'text-green-500'}`} />
                              <div className="flex-1 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                    {item.version}
                                  </span>
                                  <span className="text-sm text-gray-500">{item.status}</span>
                                </div>
                                {item.recommended && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                            </DropdownMenuItem>
                          );
                        })}
                        
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-2 mt-4">
                          Legacy Versions
                        </div>
                        {[
                          { version: 'Magento 2.3.x', status: 'End of Support' },
                          { version: 'Magento 1.x', status: 'Deprecated' },
                          { version: 'Not sure', status: 'We\'ll detect it for you' },
                        ].map((item) => {
                          const isSelected = formData.magentoVersion === item.version;
                          return (
                            <DropdownMenuItem
                              key={item.version}
                              onClick={() => handleFormDataChange('magentoVersion', item.version)}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-900 cursor-pointer transition-all duration-200 focus:bg-orange-50 focus:text-orange-900"
                            >
                              <AlertCircle className={`h-4 w-4 ${isSelected ? 'text-orange-600' : item.version === 'Not sure' ? 'text-blue-500' : 'text-amber-500'}`} />
                              <div className="flex-1 flex flex-col">
                                <span className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {item.version}
                                </span>
                                <span className="text-sm text-gray-500">{item.status}</span>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <Label htmlFor="monthlyVisitors" className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Visitors
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal h-auto py-4 px-4 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-center gap-3">
                            <Users className={`h-5 w-5 ${formData.monthlyVisitors ? 'text-orange-600' : 'text-gray-400'}`} />
                            <div className="flex flex-col">
                              <span className={formData.monthlyVisitors ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                                {formData.monthlyVisitors || 'Select visitor range'}
                              </span>
                              <span className="text-sm text-gray-400">
                                {formData.monthlyVisitors ? 'Approximate monthly unique visitors' : 'Help us understand your traffic volume'}
                              </span>
                            </div>
                          </div>
                          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-w-lg border-2 border-gray-200 shadow-xl bg-white rounded-xl p-2">
                        {[
                          { range: 'Less than 1,000', description: 'Small business or startup', color: 'text-blue-500', size: 'sm' },
                          { range: '1,000 - 10,000', description: 'Growing business', color: 'text-green-500', size: 'md' },
                          { range: '10,000 - 50,000', description: 'Established business', color: 'text-yellow-500', size: 'lg' },
                          { range: '50,000 - 100,000', description: 'Large business', color: 'text-orange-500', size: 'xl' },
                          { range: '100,000 - 500,000', description: 'Enterprise level', color: 'text-red-500', size: '2xl' },
                          { range: '500,000+', description: 'High-traffic enterprise', color: 'text-purple-500', size: '3xl' },
                        ].map((item) => {
                          const isSelected = formData.monthlyVisitors === item.range;
                          return (
                            <DropdownMenuItem
                              key={item.range}
                              onClick={() => handleFormDataChange('monthlyVisitors', item.range)}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-900 cursor-pointer transition-all duration-200 focus:bg-orange-50 focus:text-orange-900"
                            >
                              <div className="relative">
                                <Users className={`h-5 w-5 ${isSelected ? 'text-orange-600' : item.color}`} />
                                <div className={`absolute -top-1 -right-1 w-2 h-2 ${item.color.replace('text-', 'bg-')} rounded-full opacity-60`}></div>
                              </div>
                              <div className="flex-1 flex flex-col">
                                <span className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {item.range}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {item.description}
                                </span>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Note:</span> We&apos;ll automatically detect your Magento version and configuration during the audit process.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      ← Back to Store Information
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(4)}
                      disabled={!formData.magentoVersion || !formData.monthlyVisitors}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Continue to Performance Goals →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="shadow-xl border border-gray-100">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <CardTitle className="flex items-center text-2xl">
                  <Target className="w-7 h-7 mr-3 text-orange-600" />
                  Performance Goals
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  What would you like to improve?
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <p className="text-sm text-gray-600 font-medium">Select all that apply:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {performanceGoals.map((goal) => (
                      <label
                        key={goal}
                        className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.primaryGoals.includes(goal)}
                          onChange={() => handleGoalToggle(goal)}
                          className="mt-1 focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {goal}
                        </span>
                      </label>
                    ))}
                  </div>

                  {formData.primaryGoals.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">Selected goals:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.primaryGoals.map((goal) => (
                          <Badge key={goal} className="bg-green-100 text-green-800 border-green-200">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      ← Back to Technical Details
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(5)}
                      disabled={formData.primaryGoals.length === 0}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Continue to Legal Consent →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              {/* Ownership Verification */}
              {/* <Card className="shadow-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                  <CardTitle className="flex items-center text-2xl">
                    <Shield className="w-7 h-7 mr-3 text-orange-600" />
                    Website Ownership Verification
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Choose your preferred method to verify ownership of your website
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <Tabs value={verificationMethod} onValueChange={setVerificationMethod}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="meta_tag" className="text-sm">
                        <div className="flex flex-col items-center">
                          <span>Meta Tag</span>
                          <span className="text-xs text-green-600">✓ Recommended</span>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="dns_txt" className="text-sm">DNS Record</TabsTrigger>
                      <TabsTrigger value="file_upload" className="text-sm">File Upload</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="meta_tag" className="space-y-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Add HTML Meta Tag</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Add this meta tag to your website&apos;s &lt;head&gt; section:
                        </p>
                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                          <code className="text-green-400 text-sm font-mono break-all">
                            &lt;meta name=&quot;mgt-audit-verification&quot; content=&quot;abc123def456ghi789jkl012&quot; /&gt;
                          </code>
                        </div>
                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm">
                            Copy to Clipboard
                          </Button>
                          <Button variant="outline" size="sm">
                            View Instructions
                          </Button>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center text-sm text-green-700">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Meta tag detected and verified successfully
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="dns_txt" className="space-y-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Add DNS TXT Record</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Add this TXT record to your domain&apos;s DNS settings:
                        </p>
                        <div className="space-y-3 text-sm bg-white border rounded-lg p-4">
                          <div className="flex">
                            <span className="font-medium w-20">Name:</span>
                            <code className="text-gray-800">_mgt-audit-verification</code>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-20">Value:</span>
                            <code className="text-gray-800">abc123def456ghi789jkl012</code>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-20">TTL:</span>
                            <code className="text-gray-800">300 (or default)</code>
                          </div>
                        </div>
                        <p className="text-xs text-amber-600 mt-3 bg-amber-50 border border-amber-200 rounded p-2">
                          ⚠️ DNS changes may take up to 24 hours to propagate worldwide
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="file_upload" className="space-y-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Upload Verification File</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Download and upload this file to your website&apos;s root directory:
                        </p>
                        <div className="space-y-3 text-sm bg-white border rounded-lg p-4">
                          <div className="flex">
                            <span className="font-medium w-24">Filename:</span>
                            <code className="text-gray-800">mgt-audit-verification-abc123.txt</code>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-24">Content:</span>
                            <code className="text-gray-800">abc123def456ghi789jkl012</code>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-24">Location:</span>
                            <code className="text-gray-800">yoursite.com/mgt-audit-verification-abc123.txt</code>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3">
                          Download Verification File
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card> */}

              {/* Legal Consent */}
              <Card className="shadow-xl border border-gray-100">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                  <CardTitle className="flex items-center text-2xl">
                    <FileText className="w-7 h-7 mr-3 text-orange-600" />
                    Legal Consent & Data Usage Agreement
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Please review and accept our terms to proceed with the analysis
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consents.ownership}
                          onChange={() => handleConsentChange('ownership')}
                          className="mt-1 focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                        />
                        <div className="text-sm">
                          <span className="text-gray-900 font-medium">
                            Website Ownership Confirmation
                          </span>
                          <p className="text-gray-600 mt-1">
                            I confirm that I own this website or have explicit permission from the website owner 
                            to conduct performance analysis.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consents.privacy}
                          onChange={() => handleConsentChange('privacy')}
                          className="mt-1 focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                        />
                        <div className="text-sm">
                          <span className="text-gray-900 font-medium">
                            I agree to the{' '}
                            <a href="https://easecloud.io/privacy-policy" target="_blank" className="text-orange-600 hover:text-orange-700 underline inline-flex items-center">
                              Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </span>
                          <p className="text-gray-600 mt-1">
                            Learn how we collect, use, and protect your data during the analysis process.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consents.toc}
                          onChange={() => handleConsentChange('toc')}
                          className="mt-1 focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                        />
                        <div className="text-sm">
                          <span className="text-gray-900 font-medium">
                            I accept the{' '}
                            <a href="https://easecloud.io/terms-and-conditions" target="_blank" className="text-orange-600 hover:text-orange-700 underline inline-flex items-center">
                              Terms and Conditions <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </span>
                          <p className="text-gray-600 mt-1">
                            Review our service terms, limitations, and user responsibilities.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consents.dataUsage}
                          onChange={() => handleConsentChange('dataUsage')}
                          className="mt-1 focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                        />
                        <div className="text-sm">
                          <span className="text-gray-900 font-medium">
                            I consent to performance analysis and data collection
                          </span>
                          <p className="text-gray-600 mt-1">
                            We will analyze your website&apos;s publicly available data to generate performance recommendations. 
                            All data is automatically deleted after 7 days. We never access private databases or sensitive information.
                          </p>
                        </div>
                      </label>
                    </div>

                    {!allConsentsGiven && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-amber-600 mr-3" />
                          <span className="text-sm text-amber-800 font-medium">
                            Please accept all terms and conditions to proceed with the analysis.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <Button variant="outline" onClick={() => setCurrentStep(4)}>
                        ← Back to Performance Goals
                      </Button>
                      <Link href="/progress">
                        <Button 
                          disabled={!allConsentsGiven}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8"
                        >
                          {allConsentsGiven ? 'Start Analysis →' : 'Accept Terms to Continue'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
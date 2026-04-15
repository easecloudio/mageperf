'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebar } from '@/components/MainSidebar'
import {
  CheckCircle,
  Zap,
  Shield,
  Settings,
  Activity
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { DynamicBreadcrumb } from '@/components/ui/DynamicBreadcrumb'

const mockProgress = [
  { message: "Initiating analysis for magento.softwaretestingboard.com", timestamp: "2025-08-01T06:54:01.000Z" },
  { message: "Detecting Magento version and configuration", timestamp: "2025-08-01T06:54:05.000Z" },
  { message: "Running PageSpeed Insights analysis (Desktop)", timestamp: "2025-08-01T06:54:12.000Z" },
  { message: "Running PageSpeed Insights analysis (Mobile)", timestamp: "2025-08-01T06:54:25.000Z" },
  { message: "Analyzing Core Web Vitals metrics", timestamp: "2025-08-01T06:54:38.000Z" },
  { message: "Scanning security headers and configurations", timestamp: "2025-08-01T06:54:45.000Z" },
  { message: "Checking for common Magento vulnerabilities", timestamp: "2025-08-01T06:54:52.000Z" },
  { message: "Analyzing extension impact and performance", timestamp: "2025-08-01T06:54:58.000Z" },
  { message: "Generating recommendations and report", timestamp: "2025-08-01T06:55:05.000Z" },
  { message: "Finalizing analysis results", timestamp: "2025-08-01T06:55:07.000Z" }
]

export default function ProgressPage() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)

      if (currentStep < mockProgress.length) {
        const newProgress = ((currentStep + 1) / mockProgress.length) * 100
        setProgress(newProgress)

        if (timeElapsed % 3 === 0 && currentStep < mockProgress.length - 1) {
          setCurrentStep(prev => prev + 1)
        }
      }
      if (currentStep >= mockProgress.length - 1) setIsComplete(true);
    }, 1000)

    return () => clearInterval(timer)
  }, [currentStep, timeElapsed, isComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </header>
          <div className="flex-1 p-6 overflow-auto bg-gray-50">

            {/* Progress Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analyzing Your Magento Store
              </h1>
              <p className="text-gray-600">
                magento.softwaretestingboard.com
              </p>
            </div>

            {/* Main Progress Card */}
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-orange-600" />
                    Live Analysis Progress
                  </CardTitle>
                  <div className={`text-sm text-gray-600 flex items-center space-x-2 ${isComplete ? 'text-gray-500' : ''}`}>
                    <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}></div>
                    <span>Live • {formatTime(timeElapsed)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Analysis Progress</span>
                    <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-3" />
                </div>

                {/* Estimated Time */}
                {/* <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Time Elapsed</span>
                  <span className="text-gray-900 font-medium">
                    {formatTime(timeElapsed)}
                  </span>
                </div> */}

                {/* Current Status */}
                {!isComplete && currentStep < mockProgress.length && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 transition-all duration-300">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse mr-3"></div>
                      <span className="font-medium text-orange-800">Current Step</span>
                    </div>
                    <p className="text-orange-700">
                      {mockProgress[currentStep]?.message}
                    </p>
                    <div className="text-xs text-orange-600 mt-1">
                      Step {currentStep + 1} of {mockProgress.length}
                    </div>
                  </div>
                )}

                {/* Progress Steps */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mockProgress.slice(0, currentStep + (isComplete ? 1 : 1)).map((step, index) => {
                    const isLatest = index === currentStep && !isComplete
                    const isCompleteStep = index < currentStep || isComplete

                    return (
                      <div key={index} className={`flex items-start justify-between text-sm transition-all duration-500 ${isLatest ? 'bg-orange-50 rounded-lg p-3 border border-orange-200' : 'py-2'
                        }`}>
                        <div className="flex items-start flex-1">
                          <div className={`flex-shrink-0 w-3 h-3 rounded-full mr-3 mt-0.5 ${isCompleteStep ? 'bg-green-500' : isLatest ? 'bg-orange-600 animate-pulse' : 'bg-gray-300'}`}></div>
                          <div className="flex-1">
                            <span className={`${isLatest ? 'text-orange-800 font-medium' :
                              isCompleteStep ? 'text-gray-700' : 'text-gray-500'
                              }`}>
                              {step.message}
                            </span>
                            {isLatest && (
                              <div className="flex items-center mt-1">
                                <div className="w-1 h-1 bg-orange-400 rounded-full animate-ping mr-1"></div>
                                <span className="text-xs text-orange-600">In Progress</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Complete State */}
                {isComplete && (
                  <div className="text-center pt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-800 mb-2">
                        Analysis Complete!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Your Magento store analysis has been completed successfully.
                      </p>
                      <Link href="/report/66a4d8f17063e8a45172a3b9">
                        <Button>View Detailed Report</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <div className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-green-500' : currentStep >= 0 && !isComplete ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Performance</h3>
                  <p className="text-sm text-gray-600">Core Web Vitals & PageSpeed</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {currentStep >= 3 ? '✓ Completed' : currentStep >= 0 && !isComplete ? 'Analyzing...' : 'Pending'}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div className={`w-2 h-2 rounded-full ${currentStep >= 6 ? 'bg-green-500' : currentStep >= 5 && !isComplete ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Security</h3>
                  <p className="text-sm text-gray-600">Headers & Vulnerabilities</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {currentStep >= 6 ? '✓ Completed' : currentStep >= 5 && !isComplete ? 'Scanning...' : 'Pending'}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-green-500' : currentStep >= 1 && !isComplete ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Configuration</h3>
                  <p className="text-sm text-gray-600">Magento Settings & Cache</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {currentStep >= 2 ? '✓ Completed' : currentStep >= 1 && !isComplete ? 'Reviewing...' : 'Pending'}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div className={`w-2 h-2 rounded-full ${currentStep >= 8 ? 'bg-green-500' : currentStep >= 7 && !isComplete ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Extensions</h3>
                  <p className="text-sm text-gray-600">Module Impact Analysis</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {currentStep >= 8 ? '✓ Completed' : currentStep >= 7 && !isComplete ? 'Evaluating...' : 'Pending'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
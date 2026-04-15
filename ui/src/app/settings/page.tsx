"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Store, 
  BarChart3, 
  FileText, 
  Palette, 
  Save, 
  RotateCcw, 
  CheckCircle,
  ChevronDown,
  Monitor,
  Sun,
  Moon,
  Loader2
} from "lucide-react"
import { MainSidebar } from '@/components/MainSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { DynamicBreadcrumb } from '@/components/ui/DynamicBreadcrumb'

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("store")
  
  // Store Settings (from onboarding)
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Magento Demo Store",
    businessType: "Fashion & Apparel",
    magentoVersion: "Magento 2.4.7",
    monthlyVisitors: "10,000 - 50,000",
    performanceGoals: ["Improve Page Load Speed", "Fix Core Web Vitals", "Optimize Mobile Performance"]
  })

  // Analysis Preferences
  const [analysisPreferences, setAnalysisPreferences] = useState({
    defaultDepth: "Standard",
    autoRunFrequency: "Weekly",
    performanceThresholds: {
      performance: 80,
      accessibility: 90,
      bestPractices: 85,
      seo: 90
    },
    coreWebVitalsAreas: ["LCP", "FID", "CLS"],
    enableSmartRecommendations: true,
    includeCompetitorAnalysis: false
  })

  // Report Settings
  const [reportSettings, setReportSettings] = useState({
    defaultView: "Detailed",
    includeTechnicalDetails: true,
    showComparisonData: true,
    exportFormat: "PDF",
    autoEmailReports: false,
    emailFrequency: "Monthly",
    sharePublicReports: false
  })

  // Display Settings
  const [displaySettings, setDisplaySettings] = useState({
    theme: "System",
    timezone: "America/New_York",
    language: "English (US)",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "US (1,234.56)",
    compactMode: false,
    showTooltips: true,
    animationsEnabled: true
  })

  const businessTypes = [
    "Fashion & Apparel",
    "Electronics & Technology", 
    "Health & Beauty",
    "Home & Garden",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Beverage",
    "Automotive",
    "B2B/Wholesale",
    "Other"
  ]

  const magentoVersions = [
    "Magento 2.4.7",
    "Magento 2.4.6", 
    "Magento 2.4.5",
    "Magento 2.4.4",
    "Magento 2.3.x",
    "Magento 1.x",
    "Not sure"
  ]

  const visitorRanges = [
    "Less than 1,000",
    "1,000 - 10,000",
    "10,000 - 50,000", 
    "50,000 - 100,000",
    "100,000 - 500,000",
    "500,000+"
  ]

  const performanceGoals = [
    "Improve Page Load Speed",
    "Reduce Server Response Time",
    "Optimize Mobile Performance",
    "Fix Core Web Vitals",
    "Reduce Bounce Rate",
    "Improve SEO Rankings",
    "Optimize Database Queries",
    "Enhance User Experience"
  ]

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = (section: string) => {
    // Reset to default values based on section
    switch (section) {
      case "store":
        setStoreSettings({
          storeName: "",
          businessType: "",
          magentoVersion: "",
          monthlyVisitors: "",
          performanceGoals: []
        })
        break
      case "analysis":
        setAnalysisPreferences({
          defaultDepth: "Standard",
          autoRunFrequency: "Weekly",
          performanceThresholds: {
            performance: 80,
            accessibility: 90,
            bestPractices: 85,
            seo: 90
          },
          coreWebVitalsAreas: ["LCP", "FID", "CLS"],
          enableSmartRecommendations: true,
          includeCompetitorAnalysis: false
        })
        break
      case "reports":
        setReportSettings({
          defaultView: "Summary",
          includeTechnicalDetails: false,
          showComparisonData: true,
          exportFormat: "PDF",
          autoEmailReports: false,
          emailFrequency: "Monthly",
          sharePublicReports: false
        })
        break
      case "display":
        setDisplaySettings({
          theme: "System",
          timezone: "America/New_York",
          language: "English (US)",
          dateFormat: "MM/DD/YYYY",
          numberFormat: "US (1,234.56)",
          compactMode: false,
          showTooltips: true,
          animationsEnabled: true
        })
        break
    }
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
            <div className="ml-auto flex items-center space-x-3">
              {saveSuccess && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Saved!
                </div>
              )}
              <Button
                onClick={() => handleSave()}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All
                  </>
                )}
              </Button>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto bg-gray-50">
            {/* Enhanced Header */}
            <div className='mb-8'>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Settings
                  </h1>
                  <p className="text-lg text-gray-600 mb-4 lg:mb-0">
                    Customize your Magento performance analysis experience
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="store" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Store</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
          </TabsList>

          {/* Store Settings Tab */}
          <TabsContent value="store" className="space-y-6">
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Store className="h-6 w-6 mr-3 text-orange-600" />
                  Store Settings
                </CardTitle>
                <CardDescription>Basic information about your Magento store</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      placeholder="My Awesome Store"
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {storeSettings.businessType || "Select business type"}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {businessTypes.map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => setStoreSettings({ ...storeSettings, businessType: type })}
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="magentoVersion">Magento Version</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {storeSettings.magentoVersion || "Select version"}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {magentoVersions.map((version) => (
                          <DropdownMenuItem
                            key={version}
                            onClick={() => setStoreSettings({ ...storeSettings, magentoVersion: version })}
                          >
                            {version}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyVisitors">Monthly Visitors</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {storeSettings.monthlyVisitors || "Select range"}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {visitorRanges.map((range) => (
                          <DropdownMenuItem
                            key={range}
                            onClick={() => setStoreSettings({ ...storeSettings, monthlyVisitors: range })}
                          >
                            {range}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Performance Goals</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {performanceGoals.map((goal) => (
                      <label
                        key={goal}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={storeSettings.performanceGoals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStoreSettings({
                                ...storeSettings,
                                performanceGoals: [...storeSettings.performanceGoals, goal]
                              })
                            } else {
                              setStoreSettings({
                                ...storeSettings,
                                performanceGoals: storeSettings.performanceGoals.filter(g => g !== goal)
                              })
                            }
                          }}
                          className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => handleReset("store")}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                  <Button 
                    onClick={() => handleSave()}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Store Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Preferences Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <BarChart3 className="h-6 w-6 mr-3 text-orange-600" />
                  Analysis Preferences
                </CardTitle>
                <CardDescription>Configure how your store analysis is performed</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDepth">Default Analysis Depth</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {analysisPreferences.defaultDepth}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => setAnalysisPreferences({ ...analysisPreferences, defaultDepth: "Quick" })}>
                          <div className="flex flex-col">
                            <span className="font-medium">Quick</span>
                            <span className="text-xs text-gray-500">Basic performance scan (5-10 min)</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAnalysisPreferences({ ...analysisPreferences, defaultDepth: "Standard" })}>
                          <div className="flex flex-col">
                            <span className="font-medium">Standard</span>
                            <span className="text-xs text-gray-500">Comprehensive analysis (15-30 min)</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAnalysisPreferences({ ...analysisPreferences, defaultDepth: "Deep" })}>
                          <div className="flex flex-col">
                            <span className="font-medium">Deep</span>
                            <span className="text-xs text-gray-500">Thorough examination (45-60 min)</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autoRunFrequency">Auto-run Frequency</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {analysisPreferences.autoRunFrequency}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {["Never", "Daily", "Weekly", "Bi-weekly", "Monthly"].map((freq) => (
                          <DropdownMenuItem
                            key={freq}
                            onClick={() => setAnalysisPreferences({ ...analysisPreferences, autoRunFrequency: freq })}
                          >
                            {freq}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Performance Threshold Alerts</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analysisPreferences.performanceThresholds).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize">{key === 'seo' ? 'SEO' : key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id={key}
                            type="number"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => setAnalysisPreferences({
                              ...analysisPreferences,
                              performanceThresholds: {
                                ...analysisPreferences.performanceThresholds,
                                [key]: parseInt(e.target.value)
                              }
                            })}
                            className="w-20 focus:ring-orange-500 focus:border-orange-500"
                          />
                          <span className="text-sm text-gray-500">/ 100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Core Web Vitals Focus Areas</Label>
                  <div className="flex flex-wrap gap-3">
                    {["LCP", "FID", "CLS", "FCP", "TTI", "TBT"].map((metric) => (
                      <label
                        key={metric}
                        className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={analysisPreferences.coreWebVitalsAreas.includes(metric)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAnalysisPreferences({
                                ...analysisPreferences,
                                coreWebVitalsAreas: [...analysisPreferences.coreWebVitalsAreas, metric]
                              })
                            } else {
                              setAnalysisPreferences({
                                ...analysisPreferences,
                                coreWebVitalsAreas: analysisPreferences.coreWebVitalsAreas.filter(m => m !== metric)
                              })
                            }
                          }}
                          className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium">{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Smart Recommendations</Label>
                      <p className="text-sm text-gray-500 mt-1">AI-powered optimization suggestions based on your store type</p>
                    </div>
                    <Switch
                      checked={analysisPreferences.enableSmartRecommendations}
                      onCheckedChange={(checked) => setAnalysisPreferences({ ...analysisPreferences, enableSmartRecommendations: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Competitor Analysis</Label>
                      <p className="text-sm text-gray-500 mt-1">Compare your performance with similar stores (coming soon)</p>
                    </div>
                    <Switch
                      checked={analysisPreferences.includeCompetitorAnalysis}
                      onCheckedChange={(checked) => setAnalysisPreferences({ ...analysisPreferences, includeCompetitorAnalysis: checked })}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => handleReset("analysis")}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                  <Button 
                    onClick={() => handleSave()}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Analysis Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Settings Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <FileText className="h-6 w-6 mr-3 text-orange-600" />
                  Report Settings
                </CardTitle>
                <CardDescription>Customize how your analysis reports are generated and shared</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultView">Default Report View</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {reportSettings.defaultView}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => setReportSettings({ ...reportSettings, defaultView: "Summary" })}>
                          <div className="flex flex-col">
                            <span className="font-medium">Summary</span>
                            <span className="text-xs text-gray-500">Key metrics and scores only</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setReportSettings({ ...reportSettings, defaultView: "Detailed" })}>
                          <div className="flex flex-col">
                            <span className="font-medium">Detailed</span>
                            <span className="text-xs text-gray-500">Complete analysis with recommendations</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exportFormat">Export Format</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {reportSettings.exportFormat}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {["PDF", "HTML", "JSON", "CSV"].map((format) => (
                          <DropdownMenuItem
                            key={format}
                            onClick={() => setReportSettings({ ...reportSettings, exportFormat: format })}
                          >
                            {format}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Include Technical Details</Label>
                      <p className="text-sm text-gray-500 mt-1">Show detailed technical metrics and server information</p>
                    </div>
                    <Switch
                      checked={reportSettings.includeTechnicalDetails}
                      onCheckedChange={(checked) => setReportSettings({ ...reportSettings, includeTechnicalDetails: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Show Comparison Data</Label>
                      <p className="text-sm text-gray-500 mt-1">Include historical comparisons and industry benchmarks</p>
                    </div>
                    <Switch
                      checked={reportSettings.showComparisonData}
                      onCheckedChange={(checked) => setReportSettings({ ...reportSettings, showComparisonData: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Auto-email Reports</Label>
                      <p className="text-sm text-gray-500 mt-1">Automatically send reports to your email</p>
                    </div>
                    <Switch
                      checked={reportSettings.autoEmailReports}
                      onCheckedChange={(checked) => setReportSettings({ ...reportSettings, autoEmailReports: checked })}
                    />
                  </div>

                  {reportSettings.autoEmailReports && (
                    <div className="ml-8 space-y-2">
                      <Label htmlFor="emailFrequency">Email Frequency</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            {reportSettings.emailFrequency}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {["After each analysis", "Weekly", "Monthly", "Quarterly"].map((freq) => (
                            <DropdownMenuItem
                              key={freq}
                              onClick={() => setReportSettings({ ...reportSettings, emailFrequency: freq })}
                            >
                              {freq}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Share Public Reports</Label>
                      <p className="text-sm text-gray-500 mt-1">Allow creating public shareable report links</p>
                    </div>
                    <Switch
                      checked={reportSettings.sharePublicReports}
                      onCheckedChange={(checked) => setReportSettings({ ...reportSettings, sharePublicReports: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => handleReset("reports")}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                  <Button 
                    onClick={() => handleSave()}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Report Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings Tab */}
          <TabsContent value="display" className="space-y-6">
            <Card className="shadow-xl border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Palette className="h-6 w-6 mr-3 text-orange-600" />
                  Display Settings
                </CardTitle>
                <CardDescription>Customize the appearance and behavior of the application</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme Preference</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          <div className="flex items-center">
                            {displaySettings.theme === "Light" && <Sun className="h-4 w-4 mr-2" />}
                            {displaySettings.theme === "Dark" && <Moon className="h-4 w-4 mr-2" />}
                            {displaySettings.theme === "System" && <Monitor className="h-4 w-4 mr-2" />}
                            {displaySettings.theme}
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => setDisplaySettings({ ...displaySettings, theme: "Light" })}>
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDisplaySettings({ ...displaySettings, theme: "Dark" })}>
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDisplaySettings({ ...displaySettings, theme: "System" })}>
                          <Monitor className="h-4 w-4 mr-2" />
                          System
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {displaySettings.timezone}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {[
                          "America/New_York",
                          "America/Chicago", 
                          "America/Denver",
                          "America/Los_Angeles",
                          "Europe/London",
                          "Europe/Paris",
                          "Asia/Tokyo",
                          "UTC"
                        ].map((tz) => (
                          <DropdownMenuItem
                            key={tz}
                            onClick={() => setDisplaySettings({ ...displaySettings, timezone: tz })}
                          >
                            {tz.replace("_", " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {displaySettings.language}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {[
                          "English (US)",
                          "English (UK)",
                          "Spanish",
                          "French", 
                          "German",
                          "Italian",
                          "Portuguese",
                          "Dutch"
                        ].map((lang) => (
                          <DropdownMenuItem
                            key={lang}
                            onClick={() => setDisplaySettings({ ...displaySettings, language: lang })}
                          >
                            {lang}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {displaySettings.dateFormat}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {[
                          "MM/DD/YYYY",
                          "DD/MM/YYYY",
                          "YYYY-MM-DD",
                          "MMM DD, YYYY"
                        ].map((format) => (
                          <DropdownMenuItem
                            key={format}
                            onClick={() => setDisplaySettings({ ...displaySettings, dateFormat: format })}
                          >
                            {format}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberFormat">Number Format</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {displaySettings.numberFormat}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {[
                          "US (1,234.56)",
                          "EU (1.234,56)",
                          "UK (1,234.56)",
                          "Scientific (1.23e3)"
                        ].map((format) => (
                          <DropdownMenuItem
                            key={format}
                            onClick={() => setDisplaySettings({ ...displaySettings, numberFormat: format })}
                          >
                            {format}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Compact Mode</Label>
                      <p className="text-sm text-gray-500 mt-1">Reduce spacing and show more information per screen</p>
                    </div>
                    <Switch
                      checked={displaySettings.compactMode}
                      onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, compactMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Show Tooltips</Label>
                      <p className="text-sm text-gray-500 mt-1">Display helpful tooltips when hovering over elements</p>
                    </div>
                    <Switch
                      checked={displaySettings.showTooltips}
                      onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, showTooltips: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-base">Enable Animations</Label>
                      <p className="text-sm text-gray-500 mt-1">Show smooth transitions and animations throughout the app</p>
                    </div>
                    <Switch
                      checked={displaySettings.animationsEnabled}
                      onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, animationsEnabled: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => handleReset("display")}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                  <Button 
                    onClick={() => handleSave()}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Display Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
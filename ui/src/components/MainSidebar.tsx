"use client"

import * as React from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Globe,
  BarChart3,
  Plus,
  User,
  LogOut,
  ChevronsUpDown,
  TrendingUp,
  Star,
  Activity,
  CheckCircle,
  Timer,
  Settings
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Logo from '@/components/logo'
import { useRouter } from 'next/navigation'
import { fetchReports, UiReport } from '@/lib/localApi'

// Hardcoded user for whiteboarding
const HARDCODED_USER = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
}

interface MainSidebarProps {
  currentDomain?: string
  variant?: 'default' | 'compact'
  // Add common sidebar props we need
  side?: 'left' | 'right'
  className?: string
}

// Derive a domain list entry from a UiReport
function reportToDomain(r: UiReport) {
  const url = r.report_data?.url ?? ''
  const hostname = (() => { try { return new URL(url).hostname } catch { return url } })()
  return {
    id: r.task_id,
    name: hostname,
    url,
    lastAnalysis: r.created_at?.$date ?? '',
    status: r.report_data?.status ?? 'completed',
    score: r.report_data?.summary?.overall_score ?? 0,
    grade: r.report_data?.summary?.grade ?? 'N/A',
    issues: r.report_data?.summary?.total_issues ?? 0,
    criticalIssues: r.report_data?.summary?.critical_issues ?? 0,
  }
}

export function MainSidebar({ currentDomain = '', variant = 'default', side, className }: MainSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [domains, setDomains] = React.useState<ReturnType<typeof reportToDomain>[]>([])
  const [selectedDomain, setSelectedDomain] = React.useState(currentDomain)

  // Fetch real domains from API on mount
  React.useEffect(() => {
    fetchReports()
      .then(reports => {
        const domainList = reports.map(reportToDomain)
        setDomains(domainList)
        // If no domain is selected yet, use the first one
        if (!selectedDomain && domainList.length > 0) {
          setSelectedDomain(domainList[0].name)
        }
      })
      .catch(() => {/* silently ignore if API not running */})
  }, [selectedDomain])

  // Update selectedDomain when currentDomain prop changes
  React.useEffect(() => {
    if (currentDomain) setSelectedDomain(currentDomain)
  }, [currentDomain])

  const activeDomain = domains.find(d => d.name === selectedDomain) || domains[0]

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDomainChange = (domainName: string) => {
    setSelectedDomain(domainName)

    // Find the domain entry and navigate to its report
    const domain = domains.find(d => d.name === domainName)
    if (domain) {
      router.push(`/report/${domain.id}`)
    }
  }

  const handleNewAnalysis = () => {
    // Navigate to home page for new analysis
    router.push('/')
  }

  const handleLogout = () => {
    // In whiteboarding, this is just for demo
    alert('Logout clicked - in real app this would log out user')
  }

  // Enhanced compact variant for mobile drawer
  if (variant === 'compact') {
    // If no domains loaded yet, show a minimal loading state
    if (!activeDomain) {
      return (
        <div className="space-y-6 p-4">
          <Logo size="md" showText={true} />
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6 p-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" showText={true} />
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            activeDomain.grade === 'A' ? 'bg-green-100 text-green-700' :
            activeDomain.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
            activeDomain.grade === 'C' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            <Star className="w-3 h-3" />
            {activeDomain.grade}
          </div>
        </div>

        {/* Enhanced Compact Domain Switcher */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-600" />
            Current Domain
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 text-sm truncate mb-1" title={activeDomain.name}>
                  {activeDomain.name.length > 20 ? `${activeDomain.name.substring(0, 20)}...` : activeDomain.name}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="font-medium">{activeDomain.score}% Score</span>
                  <span>•</span>
                  <span>{formatDate(activeDomain.lastAnalysis)}</span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white/80 hover:bg-white"
                >
                  <ChevronsUpDown className="w-4 h-4 mr-2" />
                  Switch Domain
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <div className="p-2">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 px-2">All Domains</div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {domains.map((domain) => (
                      <DropdownMenuItem
                        key={domain.id}
                        onSelect={() => handleDomainChange(domain.name)}
                        className="p-3 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center w-full gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            domain.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {domain.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Timer className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate text-sm">{domain.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                                domain.grade === 'A' ? 'bg-green-100 text-green-700' :
                                domain.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                                domain.grade === 'C' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>{domain.score}% ({domain.grade})</span>
                              <span>•</span>
                              <span>{formatDate(domain.lastAnalysis)}</span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <DropdownMenuItem onSelect={handleNewAnalysis} className="p-3 rounded-lg text-orange-600 hover:bg-orange-50">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <Plus className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">New Analysis</div>
                        <div className="text-xs opacity-75">Analyze another domain</div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Enhanced Navigation Links */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" />
            Navigation
          </div>
          
          <Link href="/all-analysis" className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
            pathname === '/all-analysis'
              ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 border-l-4 border-orange-500 shadow-md'
              : 'hover:bg-gray-50 text-gray-700'
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
              pathname === '/all-analysis' 
                ? 'bg-orange-100 text-orange-600' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">All Analysis</div>
              <div className={`text-xs ${pathname === '/all-analysis' ? 'text-orange-600' : 'text-gray-500'}`}>
                View all reports
              </div>
            </div>
            {pathname === '/all-analysis' && (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            )}
          </Link>
          
          <Link href="/progress" className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
            pathname === '/progress'
              ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 border-l-4 border-orange-500 shadow-md'
              : 'hover:bg-gray-50 text-gray-700'
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
              pathname === '/progress' 
                ? 'bg-orange-100 text-orange-600' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Progress Tracking</div>
              <div className={`text-xs ${pathname === '/progress' ? 'text-orange-600' : 'text-gray-500'}`}>
                Live analysis status
              </div>
            </div>
            {pathname === '/progress' && (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            )}
          </Link>
        </div>


        {/* Enhanced Compact User Profile */}
        <div className="pt-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-4 h-auto rounded-xl hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="relative">
                    <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                      <AvatarImage src={HARDCODED_USER.picture} alt={HARDCODED_USER.name} />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-orange-400 to-red-400 text-white font-semibold">
                        {HARDCODED_USER.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{HARDCODED_USER.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="truncate">{HARDCODED_USER.email}</span>
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium text-xs">Online</span>
                    </div>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-xl shadow-xl" side="top" align="end">
              <div className="p-4">
                <div className="space-y-2">
                  <DropdownMenuItem onSelect={handleLogout} className="p-3 rounded-lg hover:bg-red-50 text-red-600">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Sign Out</div>
                      <div className="text-xs opacity-75">Sign out of your account</div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Sidebar collapsible="icon" side={side} className={className}>
      <SidebarHeader className="border-b p-4 border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
        {/* Logo */}
        <div className="flex items-center group-data-[collapsible=icon]:justify-center mb-4">
          <Logo size="lg" showText={true} className="group-data-[collapsible=icon]:!hidden" />
          <div className="group-data-[collapsible=icon]:block hidden">
            <Logo size="md" showText={false} />
          </div>
        </div>

        {/* Simple Domain Switcher */}
        <div className="group-data-[collapsible=icon]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left h-auto p-3 bg-white/80 backdrop-blur"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Current Domain</div>
                    <div className="font-medium text-sm truncate" title={activeDomain?.name ?? ''}>
                      {activeDomain ? (activeDomain.name.length > 18 ? `${activeDomain.name.substring(0, 18)}...` : activeDomain.name) : 'Loading...'}
                    </div>
                  </div>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <div className="p-2">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 px-2">All Domains</div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {domains.map((domain) => (
                    <DropdownMenuItem
                      key={domain.id}
                      onSelect={() => handleDomainChange(domain.name)}
                      className="p-3 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center w-full gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          domain.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {domain.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Timer className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate text-sm">{domain.name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                              domain.grade === 'A' ? 'bg-green-100 text-green-700' :
                              domain.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                              domain.grade === 'C' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>{domain.score}% ({domain.grade})</span>
                            <span>•</span>
                            <span>{formatDate(domain.lastAnalysis)}</span>
                          </div>
                        </div>
                        {domain.name === selectedDomain && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <DropdownMenuItem onSelect={handleNewAnalysis} className="p-3 rounded-lg text-orange-600 hover:bg-orange-50">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Plus className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">New Analysis</div>
                      <div className="text-xs opacity-75">Analyze another domain</div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-r from-white to-gray-50 p-2">
        {/* Navigation Menu */}
        <div className="space-y-2">
          {/* Analysis Section */}
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2">Analysis</div>
          </div>
          
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/all-analysis'}
                tooltip="All Analysis"
                className={`group relative flex items-center justify-start w-full rounded-xl text-sm font-medium transition-all duration-200 min-h-[48px] px-3 ${pathname === '/all-analysis'
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 shadow-md border-l-4 border-orange-500'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:shadow-sm'
                  }`}
              >
                <Link href="/all-analysis" className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    pathname === '/all-analysis' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                  }`}>
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">All Analysis</div>
                    <div className={`text-xs transition-colors ${
                      pathname === '/all-analysis' ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      View all reports
                    </div>
                  </div>
                  {pathname === '/all-analysis' && (
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/progress'}
                tooltip="Progress Tracking"
                className={`group relative flex items-center justify-start w-full rounded-xl text-sm font-medium transition-all duration-200 min-h-[48px] px-3 ${pathname === '/progress'
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 shadow-md border-l-4 border-orange-500'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:shadow-sm'
                  }`}
              >
                <Link href="/progress" className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    pathname === '/progress' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Progress Tracking</div>
                    <div className={`text-xs transition-colors ${
                      pathname === '/progress' ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      Live analysis status
                    </div>
                  </div>
                  {pathname === '/progress' && (
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/settings'}
                tooltip="Settings"
                className={`group relative flex items-center justify-start w-full rounded-xl text-sm font-medium transition-all duration-200 min-h-[48px] px-3 ${pathname === '/settings'
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 shadow-md border-l-4 border-orange-500'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:shadow-sm'
                  }`}
              >
                <Link href="/settings" className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    pathname === '/settings' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                  }`}>
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Settings</div>
                    <div className={`text-xs transition-colors ${
                      pathname === '/settings' ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      Configure preferences
                    </div>
                  </div>
                  {pathname === '/settings' && (
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/profile'}
                tooltip="Profile"
                className={`group relative flex items-center justify-start w-full rounded-xl text-sm font-medium transition-all duration-200 min-h-[48px] px-3 ${pathname === '/profile'
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 shadow-md border-l-4 border-orange-500'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:shadow-sm'
                  }`}
              >
                <Link href="/profile" className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    pathname === '/profile' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Profile</div>
                    <div className={`text-xs transition-colors ${
                      pathname === '/profile' ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      Manage account
                    </div>
                  </div>
                  {pathname === '/profile' && (
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-4 bg-gradient-to-r from-orange-50 to-red-50">
        {/* Enhanced User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group data-[state=open]:bg-white/80 hover:bg-white/60 transition-all duration-200 rounded-xl p-3"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <Avatar className="h-10 w-10 rounded-xl border-2 border-white shadow-sm">
                    <AvatarImage src={HARDCODED_USER.picture} alt={HARDCODED_USER.name} />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-orange-400 to-red-400 text-white font-semibold">
                      {HARDCODED_USER.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                  <div className="font-semibold text-gray-900 text-sm">{HARDCODED_USER.name}</div>
                  <div className="text-xs text-gray-500">Online</div>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors group-data-[collapsible=icon]:hidden" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl shadow-xl border-0 bg-white/95 backdrop-blur"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <div className="p-4">
              {/* User Info Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarImage src={HARDCODED_USER.picture} alt={HARDCODED_USER.name} />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-orange-400 to-red-400 text-white font-semibold">
                    {HARDCODED_USER.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{HARDCODED_USER.name}</div>
                  <div className="text-sm text-gray-500">{HARDCODED_USER.email}</div>
                  <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Active now</span>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="space-y-1">
                <DropdownMenuItem onSelect={handleLogout} className="p-3 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Sign Out</div>
                    <div className="text-xs opacity-75">Sign out of your account</div>
                  </div>
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
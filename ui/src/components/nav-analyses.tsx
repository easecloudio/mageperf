"use client"

import Link from "next/link"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Share,
  Trash2,
  ExternalLink,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavAnalyses({
  analyses,
}: {
  analyses: {
    name: string
    url: string
    status: string
    grade: string | null
    score: number | null
  }[]
}) {
  const { isMobile } = useSidebar()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'processing':
        return <Clock className="w-3 h-3 text-orange-500 animate-pulse" />
      case 'failed':
        return <AlertTriangle className="w-3 h-3 text-red-500" />
      default:
        return <Clock className="w-3 h-3 text-gray-400" />
    }
  }

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-blue-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500'
    }
    return colors[grade as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Analyses</SidebarGroupLabel>
      <SidebarMenu>
        {analyses.map((item, index) => (
          <SidebarMenuItem key={`${item.name}-${index}`}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getStatusIcon(item.status)}
                  <span className="truncate text-sm">{item.name}</span>
                </div>
                {item.grade && (
                  <div className={`w-5 h-5 rounded-full ${getGradeColor(item.grade)} flex items-center justify-center flex-shrink-0 ml-2`}>
                    <span className="text-white text-xs font-bold">{item.grade}</span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem asChild>
                  <Link href={item.url}>
                    <ExternalLink className="text-muted-foreground" />
                    <span>View Report</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="text-muted-foreground" />
                  <span>Share Report</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/analyses">
              <MoreHorizontal />
              <span>View All</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
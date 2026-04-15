"use client"

import * as React from "react"
import {
  BarChart3,
  FileText,
  Activity,
  Zap,
  Shield,
  Wrench,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data for Magento Performance Tool
const data = {
  user: {
    name: "John Doe",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "EaseCloud",
      logo: GalleryVerticalEnd,
      plan: "Performance",
    },
    {
      name: "Magento Store",
      logo: AudioWaveform,
      plan: "Analysis",
    },
    {
      name: "Demo Store",
      logo: Command,
      plan: "Testing",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: BarChart3,
      items: [
        {
          title: "New Analysis",
          url: "/onboarding",
        },
        {
          title: "All Analyses",
          url: "/all-analysis",
        },
        {
          title: "Progress Tracking",
          url: "/progress",
        },
      ],
    },
    {
      title: "Reports",
      url: "/all-analysis",
      icon: FileText,
      items: [
        {
          title: "All Reports",
          url: "/all-analysis",
        },
        {
          title: "Core Web Vitals",
          url: "/progress",
        },
        {
          title: "Technical Analysis",
          url: "/progress",
        },
        {
          title: "Recommendations",
          url: "/progress",
        },
      ],
    },
    {
      title: "Tools",
      url: "/onboarding",
      icon: Wrench,
      items: [
        {
          title: "New Analysis",
          url: "/onboarding",
        },
        {
          title: "View Progress",
          url: "/progress",
        },
        {
          title: "All Analyses",
          url: "/all-analysis",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Performance Monitoring",
      url: "/monitoring",
      icon: Activity,
    },
    {
      name: "Speed Optimization",
      url: "/optimization",
      icon: Zap,
    },
    {
      name: "Security Analysis",
      url: "/security",
      icon: Shield,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

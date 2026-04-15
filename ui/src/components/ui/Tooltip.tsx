"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

// Helper component for technical terms with explanations
interface TechTermProps {
  term: string
  explanation: string
  children?: React.ReactNode
  className?: string
}

function TechTerm({ term, explanation, children }: TechTermProps) {
  return (
    <Tooltip>
        <TooltipTrigger asChild>
            <span className="border-b border-dotted border-gray-400 cursor-help">
                {children || term}
            </span>
        </TooltipTrigger>
        <TooltipContent>
            <p>{explanation}</p>
        </TooltipContent>
    </Tooltip>
  )
}

// Predefined technical terms with explanations
const techTerms = {
  'Core Web Vitals': 'A set of real-world, user-centered metrics that quantify key aspects of user experience. They measure loading performance, interactivity, and visual stability.',
  'First Contentful Paint': 'The time from when the page starts loading to when any part of the page\'s content is rendered on the screen.',
  'Largest Contentful Paint': 'The time it takes for the largest content element (like an image or text block) to become visible within the viewport.',
  'Cumulative Layout Shift': 'A measure of visual stability. It quantifies how much visible content shifts during the loading process.',
  'First Input Delay': 'The time from when a user first interacts with your page to when the browser responds to that interaction.',
  'Time to Interactive': 'The time it takes for a page to become fully interactive (all elements are responsive to user input).',
  'PageSpeed Score': 'Google\'s performance score ranging from 0-100. Scores of 90+ are considered good, 50-89 need improvement, and below 50 are poor.',
  'Magento Admin Path': 'The URL path used to access the Magento administrative panel. Default is usually /admin but can be customized for security.',
  'Magento Version': 'The specific version of Magento running on the store. Important for security updates and compatibility.',
  'Cache Hit Ratio': 'The percentage of requests served from cache versus those requiring database queries. Higher ratios indicate better performance.',
  'TTFB': 'Time To First Byte - the time between the request and when the first byte of the response is received by the browser.',
  'CDN': 'Content Delivery Network - a distributed server system that delivers web content based on geographic location for faster loading.',
  'Minification': 'The process of removing unnecessary characters from code (like whitespace and comments) to reduce file size.',
  'Gzip Compression': 'A compression method that reduces the size of files sent from server to browser, improving loading speed.',
  'HTTP/2': 'The latest version of HTTP protocol that allows for faster, more efficient communication between browsers and servers.',
  'SSL Certificate': 'A digital certificate that encrypts data between the user\'s browser and the website, indicated by HTTPS and a lock icon.',
  'SEO Score': 'Search Engine Optimization score measuring how well a page is optimized for search engines like Google.',
  'Accessibility Score': 'A measure of how accessible a website is to users with disabilities, following WCAG guidelines.',
  'Best Practices Score': 'A score measuring adherence to web development best practices including security, performance, and modern standards.'
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TechTerm, techTerms }
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md border-border",
        elevated: "shadow-lg hover:shadow-xl border-border/50",
        performance: "shadow-lg hover:shadow-xl border-border/30 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm",
        glass: "shadow-xl border-white/20 bg-white/10 backdrop-blur-md",
        outlined: "border-2 shadow-none hover:shadow-sm",
        flat: "shadow-none border-0 bg-transparent",
      },
      size: {
        default: "",
        compact: "text-sm",
        spacious: "text-base",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:border-gray-300",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
)

interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, interactive, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-tight tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between p-6 pt-4 border-t border-gray-100", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants, type CardProps }
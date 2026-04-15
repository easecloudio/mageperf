import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
        primary:
          "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:from-orange-700 hover:to-red-700 hover:shadow-xl border-0",
        secondary:
          "bg-white text-gray-700 border-2 border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md",
        tertiary:
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 border-0 shadow-none",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-gray-300 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none transform-none hover:scale-100",
        success:
          "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:from-emerald-700 hover:to-green-700 hover:shadow-xl",
        warning:
          "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl",
        performance:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl",
      },
      size: {
        default: "h-10 px-6 py-3 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-xl px-8 py-4 has-[>svg]:px-6 text-base font-bold",
        xl: "h-14 rounded-xl px-10 py-5 has-[>svg]:px-8 text-lg font-bold",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

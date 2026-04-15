import { cn } from "@/lib/utils"

function Skeleton({ 
  className, 
  variant = "pulse",
  ...props 
}: React.ComponentProps<"div"> & {
  variant?: "pulse" | "shimmer"
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent rounded-md",
        variant === "pulse" && "animate-pulse",
        variant === "shimmer" && "bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

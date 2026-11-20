import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C93018] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#C93018] text-white hover:bg-[#A82511]",
        dark: "border-transparent bg-[#171614] text-[#F6F4EE]",
        secondary: "border-[#E4DFD3] bg-[#ECE8DF] text-[#171614]",
        destructive: "border-[#B91C1C]/25 bg-[#B91C1C]/10 text-[#B91C1C]",
        outline: "text-[#171614] border-[#CFC9BC] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

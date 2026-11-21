import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#C93018] text-white hover:bg-[#A82511]",
        dark: "border-transparent bg-[#171614] text-[#F6F4EE] dark:bg-[#F6F4EE] dark:text-[#171614]",
        secondary: "border-border bg-secondary text-secondary-foreground",
        success:
          "border-[#1F6E43]/25 bg-[#1F6E43]/10 text-[#1F6E43] dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300",
        warning:
          "border-[#855A0E]/25 bg-[#855A0E]/10 text-[#855A0E] dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-300",
        destructive:
          "border-[#B91C1C]/25 bg-[#B91C1C]/10 text-[#B91C1C] dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-300",
        outline: "text-foreground border-border-strong bg-transparent",
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

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-none border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#141413]/20 bg-[#D4FF2A] text-[#141413] hover:bg-[#C2EE1A]",
        dark:
          "border-transparent bg-[#141413] text-[#F4F3EF] dark:bg-[#F4F3EF] dark:text-[#141413]",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        success:
          "border-[#156E3F]/30 bg-[#156E3F]/10 text-[#156E3F] dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300",
        warning:
          "border-[#8A5A00]/30 bg-[#8A5A00]/10 text-[#8A5A00] dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-300",
        destructive:
          "border-[#C81E1E]/30 bg-[#C81E1E]/10 text-[#C81E1E] dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-300",
        outline:
          "text-foreground border-border-strong bg-transparent",
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

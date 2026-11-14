import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white text-[#0C0D12] hover:bg-neutral-200",
        secondary:
          "border border-white/20 bg-white/10 text-white hover:bg-white/15",
        destructive:
          "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
        outline: "text-white border-white/20 bg-transparent",
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

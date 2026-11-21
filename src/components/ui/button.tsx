import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#C93018] text-white hover:bg-[#A82511] font-semibold",
        dark: "bg-[#171614] text-[#F6F4EE] hover:bg-[#2C2A26] dark:bg-[#F6F4EE] dark:text-[#171614] dark:hover:bg-[#E4DFD3] font-semibold",
        destructive: "bg-[#B91C1C] text-white hover:bg-[#991B1B] font-medium",
        outline:
          "border border-border-strong bg-card text-foreground hover:border-foreground hover:bg-secondary/60",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-border border border-border",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary/70",
        link: "text-[#C93018] dark:text-[#F2644E] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] px-4 py-2",
        sm: "min-h-[40px] rounded-md px-3 text-xs",
        lg: "min-h-[48px] rounded-lg px-6",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

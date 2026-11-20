import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#C93018] text-white hover:bg-[#A82511] font-semibold",
        dark: "bg-[#171614] text-[#F6F4EE] hover:bg-[#2C2A26] font-semibold",
        destructive: "bg-[#B91C1C] text-white hover:bg-[#991B1B] font-medium",
        outline:
          "border border-[#CFC9BC] bg-white text-[#171614] hover:border-[#171614] hover:bg-[#ECE8DF]/50",
        secondary:
          "bg-[#ECE8DF] text-[#171614] hover:bg-[#E4DFD3] border border-[#E4DFD3]",
        ghost: "text-[#5C5850] hover:text-[#171614] hover:bg-[#ECE8DF]/60",
        link: "text-[#C93018] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] px-4 py-2",
        sm: "min-h-[40px] rounded-md px-3",
        lg: "min-h-[48px] rounded-lg px-6",
        icon: "h-11 w-11",
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

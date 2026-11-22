import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#141413] text-[#F4F3EF] hover:bg-[#2A2A28] dark:bg-[#D4FF2A] dark:text-[#141413] dark:hover:bg-[#C2EE1A]",
        lime:
          "bg-[#D4FF2A] text-[#141413] hover:bg-[#C2EE1A] border border-[#141413]/15",
        dark:
          "bg-[#141413] text-[#F4F3EF] hover:bg-[#2A2A28] dark:bg-[#F4F3EF] dark:text-[#141413] dark:hover:bg-[#EAE8E1]",
        destructive:
          "bg-[#C81E1E] text-white hover:bg-[#A61717]",
        outline:
          "border border-border-strong bg-card text-foreground hover:bg-[#141413] hover:text-[#F4F3EF] dark:hover:bg-[#F4F3EF] dark:hover:text-[#141413]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-border border border-border",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-secondary",
        link:
          "text-[#141413] dark:text-[#D4FF2A] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] px-4 py-2",
        sm: "min-h-[40px] px-3 text-xs",
        lg: "min-h-[48px] px-6",
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

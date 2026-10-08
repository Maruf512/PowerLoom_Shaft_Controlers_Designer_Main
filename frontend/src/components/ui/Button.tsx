import { cn } from "@/utils/cn";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-surface hover:bg-primary/90",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-muted text-basec bg-transparent hover:bg-muted/20",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = ({
  className,
  children,
  variant,
  size,
  isLoading = false,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;

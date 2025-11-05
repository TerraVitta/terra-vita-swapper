import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg px-4 py-2 text-base",
          "glass border-glass-border",
          "transition-all duration-300",
          "placeholder:text-muted-foreground/70",
          "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0",
          "file:text-sm file:font-medium file:bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verdigris/20 focus-visible:border-verdigris/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

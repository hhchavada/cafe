import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-muted text-foreground hover:bg-muted/80 shadow-sm border border-card-border",
      accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md",
      secondary: "bg-card text-foreground hover:bg-card/80 border border-card-border",
      outline: "border border-card-border bg-transparent hover:bg-muted text-foreground",
      ghost: "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground",
    };

    const sizes = {
      sm: "h-8 px-4 text-xs rounded-md",
      md: "h-11 px-6 py-2 text-sm rounded-lg",
      lg: "h-14 px-8 text-base rounded-xl",
      icon: "h-11 w-11 flex items-center justify-center p-0 rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

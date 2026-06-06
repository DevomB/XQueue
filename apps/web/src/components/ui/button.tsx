import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-sky-500 text-zinc-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400",
          variant === "secondary" &&
            "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800",
          variant === "ghost" &&
            "text-zinc-400 hover:bg-zinc-800 hover:text-white",
          variant === "danger" &&
            "bg-red-600 text-white hover:bg-red-500",
          size === "sm" && "h-9 px-4 text-sm",
          size === "md" && "h-10 px-5 text-sm",
          size === "lg" && "h-12 px-7 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

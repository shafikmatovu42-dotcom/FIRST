import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-elevated px-3 text-sm text-foreground placeholder:text-muted-foreground/80 shadow-none outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
